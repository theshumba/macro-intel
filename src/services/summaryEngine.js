// ---------------------------------------------------------------------------
// summaryEngine.js — Plain English event summarization
// Produces factual, concise event summaries in plain English.
// Severity-based: Routine gets less, Major gets more.
// ---------------------------------------------------------------------------

import { SEVERITY } from './eventModel.js';

/**
 * Generate a summary for an event based on its severity.
 *
 * Severity 1 (Routine): headline + executive summary + sources
 * Severity 2 (Material): + what happened
 * Severity 3 (Major): + why this matters + linked context
 *
 * Rules:
 * - Plain English, concise, factual
 * - No filler, no consulting language, no forced market implications
 * - Always preserve source lineage
 * - Only include "why this matters" for severity 3
 */
export function generateSummary(event) {
  const {
    headline = '',
    executiveSummary = '',
    whatHappened = [],
    whyThisMatters = null,
    severity = SEVERITY.ROUTINE,
    sources = [],
    primaryCountry = '',
    primaryRegion = '',
    category = '',
    subcategoryTags = [],
    publishedAt = '',
    relatedContextData = [],
  } = event;

  const summary = {
    headline,
    severity,
    executiveSummary: executiveSummary || buildExecutiveSummary(event),
    sources: formatSources(sources),
    time: formatTime(publishedAt),
    country: primaryCountry,
    region: primaryRegion,
    category,
    tags: subcategoryTags,
  };

  // Severity 2+: add "what happened"
  if (severity >= SEVERITY.MATERIAL) {
    summary.whatHappened = whatHappened.length > 0
      ? whatHappened
      : buildWhatHappened(event);
  }

  // Severity 3 only: add "why this matters" and linked context
  if (severity >= SEVERITY.MAJOR) {
    summary.whyThisMatters = whyThisMatters || buildWhyThisMatters(event);
    if (relatedContextData.length > 0) {
      summary.linkedContext = relatedContextData;
    }
  }

  return summary;
}

// ---- Executive Summary Builder --------------------------------------------

function buildExecutiveSummary(event) {
  const { headline, sources, primaryCountry, primaryRegion, category } = event;

  const sourceNames = sources?.map(s => s.name).filter(Boolean);
  const sourceStr = sourceNames?.length > 0
    ? `Reported by ${sourceNames.slice(0, 3).join(', ')}.`
    : '';

  const locationStr = primaryCountry
    ? `in ${primaryCountry}`
    : primaryRegion
      ? `in the ${primaryRegion} region`
      : '';

  return `${headline}. ${sourceStr}`.trim();
}

// ---- What Happened Builder ------------------------------------------------

function buildWhatHappened(event) {
  const { headline, executiveSummary, sources } = event;
  const points = [];

  // Use the headline as the core fact
  if (headline) {
    points.push(headline);
  }

  // Add summary as context (if different from headline)
  if (executiveSummary && executiveSummary !== headline) {
    // Split long summaries into 2-3 bullet points
    const sentences = executiveSummary
      .split(/\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    for (const sentence of sentences.slice(0, 4)) {
      const clean = sentence.endsWith('.') ? sentence : sentence + '.';
      if (!points.includes(clean) && clean !== headline + '.') {
        points.push(clean);
      }
    }
  }

  return points.slice(0, 5);
}

// ---- Why This Matters Builder (severity 3 only) ---------------------------

function buildWhyThisMatters(event) {
  const { category, primaryRegion, subcategoryTags = [], sources } = event;

  // Only generate for genuinely major events — keep it factual, not speculative
  const tagStr = subcategoryTags.slice(0, 3).join(', ');
  const regionStr = primaryRegion || 'multiple regions';

  // Map categories to factual impact statements
  const impactMap = {
    'Central Banks & Monetary Policy':
      `Central bank actions at this level directly affect borrowing costs, currency values, and financial conditions across ${regionStr}.`,
    'Trade & Sanctions':
      `Trade and sanctions actions of this scale can disrupt supply chains, alter trade flows, and affect economic relationships across ${regionStr}.`,
    'Energy & Commodities':
      `Energy supply disruptions at this scale affect prices, import costs, and economic stability for energy-dependent economies.`,
    'Geopolitics & Conflict':
      `Conflict and geopolitical escalation at this level creates uncertainty for investment, trade, and security across affected regions.`,
    'Macroeconomics':
      `Macroeconomic shifts at this scale affect employment, investment, and policy direction across ${regionStr}.`,
    'Markets & Financial Conditions':
      `Financial market moves at this scale affect asset values, credit conditions, and investor sentiment broadly.`,
    'Government Policy & Regulation':
      `Policy changes at this level can reshape industry structure, trade patterns, and economic incentives across ${regionStr}.`,
    'Supply Chains & Logistics':
      `Supply chain disruptions at this scale affect production timelines, costs, and availability of goods across multiple sectors.`,
    'Technology & Strategic Infrastructure':
      `Strategic infrastructure events at this level affect national security, technological capability, and economic competitiveness.`,
    'Water, Food & Resource Security':
      `Resource security events at this scale affect food prices, water availability, and humanitarian conditions.`,
    'Official Data Releases':
      `This data release is significant enough to shift policy expectations and market positioning.`,
    'Institutional Research / Reports':
      `This institutional assessment carries weight with policymakers and market participants.`,
  };

  return impactMap[category] ||
    `This development has significant implications for ${regionStr}.`;
}

// ---- Source Formatting -----------------------------------------------------

function formatSources(sources = []) {
  return sources.map(s => ({
    name: s.name,
    url: s.url,
    tier: s.tier,
    publishedAt: s.publishedAt,
  }));
}

// ---- Time Formatting ------------------------------------------------------

function formatTime(publishedAt) {
  if (!publishedAt) return '';
  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) return publishedAt;

  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Less than 1 hour ago';
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
