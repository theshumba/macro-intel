// ---------------------------------------------------------------------------
// archiveDb.js — IndexedDB-backed event archive using Dexie.js
// Stores all ingested events with full metadata and provenance.
// Supports search, filtering, and event lifecycle tracking.
// ---------------------------------------------------------------------------

import Dexie from 'dexie';

// ---- Database Schema ------------------------------------------------------

const db = new Dexie('MacroIntelArchive');

db.version(1).stores({
  events: 'eventId, clusterId, headline, category, primaryCountry, primaryRegion, severity, confidence, status, firstSeenAt, lastUpdatedAt, publishedAt, ingestedAt',
  eventLog: '++id, eventId, action, timestamp',
});

// ---- Event Storage --------------------------------------------------------

/**
 * Store a batch of events. Updates existing events by eventId.
 * Writes to both the events table and the event log.
 */
export async function storeEvents(events) {
  const now = new Date().toISOString();

  await db.transaction('rw', db.events, db.eventLog, async () => {
    for (const event of events) {
      const existing = await db.events.get(event.eventId);

      if (existing) {
        // Update existing event
        await db.events.put({
          ...existing,
          ...event,
          lastUpdatedAt: now,
          sourceCount: Math.max(existing.sourceCount || 0, event.sourceCount || 0),
          sources: mergeSources(existing.sources, event.sources),
        });
        await db.eventLog.add({
          eventId: event.eventId,
          action: 'updated',
          timestamp: now,
          details: `Source count: ${event.sourceCount}`,
        });
      } else {
        // New event
        await db.events.put(event);
        await db.eventLog.add({
          eventId: event.eventId,
          action: 'ingested',
          timestamp: now,
          details: `First seen via ${event.sources?.[0]?.name || 'unknown'}`,
        });
      }
    }
  });
}

function mergeSources(existing = [], incoming = []) {
  const seen = new Set(existing.map(s => s.url));
  const merged = [...existing];
  for (const source of incoming) {
    if (source.url && !seen.has(source.url)) {
      seen.add(source.url);
      merged.push(source);
    }
  }
  return merged;
}

// ---- Event Retrieval ------------------------------------------------------

/**
 * Get all events, optionally filtered. Returns most recent first.
 */
export async function getEvents({
  category,
  region,
  country,
  severity,
  status,
  search,
  startDate,
  endDate,
  limit = 200,
  offset = 0,
} = {}) {
  let collection = db.events.orderBy('publishedAt').reverse();

  const results = await collection.toArray();

  let filtered = results;

  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }
  if (region) {
    filtered = filtered.filter(e =>
      e.primaryRegion === region || e.secondaryRegions?.includes(region)
    );
  }
  if (country) {
    filtered = filtered.filter(e =>
      e.primaryCountry === country || e.secondaryCountries?.includes(country)
    );
  }
  if (severity) {
    filtered = filtered.filter(e => e.severity >= severity);
  }
  if (status) {
    filtered = filtered.filter(e => e.status === status);
  }
  if (startDate) {
    filtered = filtered.filter(e => new Date(e.publishedAt) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(e => new Date(e.publishedAt) <= new Date(endDate));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e => {
      const searchable = [
        e.headline,
        e.executiveSummary,
        e.category,
        e.primaryCountry,
        e.primaryRegion,
        ...(e.subcategoryTags || []),
        ...(e.sources?.map(s => s.name) || []),
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);

  return { events: paged, total, offset, limit };
}

/**
 * Get a single event by ID.
 */
export async function getEvent(eventId) {
  return db.events.get(eventId);
}

/**
 * Get all events in a cluster.
 */
export async function getClusterEvents(clusterId) {
  return db.events.where('clusterId').equals(clusterId).toArray();
}

// ---- Event Log ------------------------------------------------------------

/**
 * Get the lifecycle log for a specific event.
 */
export async function getEventLog(eventId) {
  return db.eventLog.where('eventId').equals(eventId).sortBy('timestamp');
}

/**
 * Add a log entry for an event.
 */
export async function logEventAction(eventId, action, details = '') {
  await db.eventLog.add({
    eventId,
    action,
    timestamp: new Date().toISOString(),
    details,
  });
}

// ---- Event Lifecycle Updates ----------------------------------------------

/**
 * Update event status (active -> updated -> confirmed -> resolved -> downgraded)
 */
export async function updateEventStatus(eventId, newStatus) {
  await db.events.update(eventId, {
    status: newStatus,
    lastUpdatedAt: new Date().toISOString(),
  });
  await logEventAction(eventId, `status_change:${newStatus}`);
}

// ---- Statistics -----------------------------------------------------------

/**
 * Get archive stats for dashboard display.
 */
export async function getArchiveStats() {
  const total = await db.events.count();
  const bySeverity = { 1: 0, 2: 0, 3: 0 };
  const byCategory = {};
  const byRegion = {};

  await db.events.each(event => {
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
    byRegion[event.primaryRegion] = (byRegion[event.primaryRegion] || 0) + 1;
  });

  return { total, bySeverity, byCategory, byRegion };
}

// ---- Cleanup --------------------------------------------------------------

/**
 * Purge events older than a given number of days.
 */
export async function purgeOldEvents(daysOld = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  const cutoffISO = cutoff.toISOString();

  const toDelete = await db.events
    .where('ingestedAt')
    .below(cutoffISO)
    .primaryKeys();

  await db.events.bulkDelete(toDelete);
  return toDelete.length;
}

/**
 * Clear the entire archive. Use with caution.
 */
export async function clearArchive() {
  await db.events.clear();
  await db.eventLog.clear();
}

export default db;
