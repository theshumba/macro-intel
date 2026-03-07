// ---------------------------------------------------------------------------
// clustering.js — Event clustering and deduplication engine
// Groups related articles about the same real-world event into clusters.
// Uses title similarity, shared entities, geography, and time window.
// ---------------------------------------------------------------------------

/**
 * Compute simple word-overlap similarity between two strings (0-1).
 * Uses Jaccard coefficient on word sets.
 */
function wordSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Check if two items share geographic overlap.
 */
function geographyOverlap(a, b) {
  if (a.primaryCountry && a.primaryCountry === b.primaryCountry) return true;
  if (a.primaryRegion && a.primaryRegion === b.primaryRegion) return true;
  if (a.secondaryCountries?.some(c => b.primaryCountry === c || b.secondaryCountries?.includes(c))) return true;
  return false;
}

/**
 * Check if two items are within a clustering time window (default 48 hours).
 */
function withinTimeWindow(a, b, windowHours = 48) {
  const timeA = new Date(a.publishedAt || a.firstSeenAt).getTime();
  const timeB = new Date(b.publishedAt || b.firstSeenAt).getTime();
  return Math.abs(timeA - timeB) < windowHours * 60 * 60 * 1000;
}

/**
 * Check if two items share category or tags.
 */
function categoryOverlap(a, b) {
  if (a.category === b.category) return true;
  if (a.subcategoryTags?.some(t => b.subcategoryTags?.includes(t))) return true;
  return false;
}

// ---- Similarity Score (0-1) -----------------------------------------------

/**
 * Compute overall similarity score between two events.
 * Returns a score 0-1 where higher means more likely to be same event.
 */
function eventSimilarity(a, b) {
  let score = 0;

  // Title similarity (heaviest weight)
  const titleSim = wordSimilarity(a.headline, b.headline);
  score += titleSim * 0.45;

  // Summary similarity
  const summarySim = wordSimilarity(
    a.executiveSummary || a.headline,
    b.executiveSummary || b.headline
  );
  score += summarySim * 0.20;

  // Geographic overlap
  if (geographyOverlap(a, b)) score += 0.15;

  // Category/tag overlap
  if (categoryOverlap(a, b)) score += 0.10;

  // Time proximity (closer = higher score)
  if (withinTimeWindow(a, b, 6)) score += 0.10;
  else if (withinTimeWindow(a, b, 24)) score += 0.05;

  return Math.min(score, 1.0);
}

// ---- Main Clustering Function ---------------------------------------------

/**
 * Cluster an array of events by similarity.
 * Events with similarity >= threshold are merged into the same cluster.
 *
 * Returns the events array with `clusterId` set. Events in the same cluster
 * share the same `clusterId`. The highest-severity or most-sourced event
 * in each cluster is the "canonical" representative.
 *
 * @param {Array} events - Array of event objects
 * @param {number} threshold - Similarity threshold (default 0.35)
 * @returns {Array} events with clusterId assigned
 */
export function clusterEvents(events, threshold = 0.35) {
  if (events.length === 0) return [];

  // Union-Find for clustering
  const parent = new Map();
  const find = (id) => {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)));
    }
    return parent.get(id);
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  // Initialize
  for (const event of events) {
    parent.set(event.eventId, event.eventId);
  }

  // Compare pairs within time window
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      // Skip if not within 48h
      if (!withinTimeWindow(events[i], events[j])) continue;

      const sim = eventSimilarity(events[i], events[j]);
      if (sim >= threshold) {
        union(events[i].eventId, events[j].eventId);
      }
    }
  }

  // Assign cluster IDs
  for (const event of events) {
    event.clusterId = find(event.eventId);
  }

  return events;
}

/**
 * Given clustered events, produce a deduplicated list with one
 * representative per cluster. Merges source lists.
 *
 * @param {Array} events - Clustered events (with clusterId)
 * @returns {Array} Deduplicated events, one per cluster
 */
export function deduplicateClusters(events) {
  const clusters = new Map();

  for (const event of events) {
    const cid = event.clusterId;
    if (!clusters.has(cid)) {
      clusters.set(cid, []);
    }
    clusters.get(cid).push(event);
  }

  const result = [];

  for (const [clusterId, members] of clusters) {
    // Pick canonical: highest severity, then most sources, then most recent
    members.sort((a, b) => {
      if (b.severity !== a.severity) return b.severity - a.severity;
      if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const canonical = { ...members[0] };

    // Merge sources from all cluster members
    const allSources = [];
    const seenUrls = new Set();
    for (const member of members) {
      for (const source of (member.sources || [])) {
        if (!seenUrls.has(source.url)) {
          seenUrls.add(source.url);
          allSources.push(source);
        }
      }
    }
    canonical.sources = allSources;
    canonical.sourceCount = allSources.length;

    // Set cluster metadata
    canonical.clusterId = clusterId;
    const firstSeen = members.reduce((min, m) =>
      new Date(m.firstSeenAt) < new Date(min) ? m.firstSeenAt : min,
      members[0].firstSeenAt
    );
    const lastUpdated = members.reduce((max, m) =>
      new Date(m.lastUpdatedAt) > new Date(max) ? m.lastUpdatedAt : max,
      members[0].lastUpdatedAt
    );
    canonical.firstSeenAt = firstSeen;
    canonical.lastUpdatedAt = lastUpdated;

    // Merge secondary countries and regions
    const allCountries = new Set([canonical.primaryCountry, ...canonical.secondaryCountries]);
    const allRegions = new Set([canonical.primaryRegion, ...canonical.secondaryRegions]);
    for (const member of members.slice(1)) {
      if (member.primaryCountry) allCountries.add(member.primaryCountry);
      member.secondaryCountries?.forEach(c => allCountries.add(c));
      if (member.primaryRegion) allRegions.add(member.primaryRegion);
      member.secondaryRegions?.forEach(r => allRegions.add(r));
    }
    allCountries.delete('');
    allRegions.delete('');
    canonical.secondaryCountries = [...allCountries].filter(c => c !== canonical.primaryCountry);
    canonical.secondaryRegions = [...allRegions].filter(r => r !== canonical.primaryRegion);
    canonical.crossRegionFlag = allRegions.size > 1;

    // Merge subcategory tags
    const allTags = new Set(canonical.subcategoryTags || []);
    for (const member of members.slice(1)) {
      member.subcategoryTags?.forEach(t => allTags.add(t));
    }
    canonical.subcategoryTags = [...allTags];

    // Store related event IDs
    canonical.relatedEventIds = members
      .filter(m => m.eventId !== canonical.eventId)
      .map(m => m.eventId);

    // Upgrade severity if multiple sources confirm
    if (canonical.severity < 3 && canonical.sourceCount >= 4) {
      canonical.severity = Math.min(canonical.severity + 1, 3);
    }

    // Upgrade confidence
    if (canonical.sourceCount >= 3) {
      canonical.confidence = 'confirmed';
    }

    result.push(canonical);
  }

  // Sort: severity desc, then source count desc, then date desc
  result.sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity;
    if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return result;
}
