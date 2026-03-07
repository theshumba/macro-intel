// ---------------------------------------------------------------------------
// eventModel.js — Canonical event data model for Macro Intel
// Every event flowing through the system conforms to this schema.
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';

// ---- Content Fingerprinting ------------------------------------------------

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','can','could',
  'must','to','of','in','for','on','with','at','by','from','as','into','through',
  'during','before','after','above','below','between','out','off','over','under',
  'again','further','then','once','here','there','when','where','why','how','all',
  'both','each','few','more','most','other','some','such','nor','not','only',
  'own','same','so','than','too','very','just','and','but','or','if','while',
  'about','against','up','down','that','this','these','those','its','also','new',
  'says','said','could','amid','via','per','yet',
]);

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a stable content fingerprint from a headline.
 * Same story with minor wording changes produces the same fingerprint.
 */
export function createContentFingerprint(headline) {
  if (!headline) return null;
  const words = headline.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .sort();
  if (words.length === 0) return null;
  return `fp-${djb2Hash(words.join(' '))}`;
}

/**
 * Create a fingerprint from a source URL (article link).
 * Normalizes protocol, trailing slashes, and query params.
 */
export function createUrlFingerprint(url) {
  if (!url) return null;
  const normalized = url
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .replace(/[?#].*$/, '')
    .toLowerCase();
  return `url-${djb2Hash(normalized)}`;
}

// ---- Region Framework (12 regions) ----------------------------------------

export const REGIONS = [
  'North America',
  'Latin America',
  'Europe',
  'Russia / Eurasia',
  'MENA',
  'Sub-Saharan Africa',
  'South Asia',
  'East Asia',
  'Southeast Asia',
  'Oceania',
  'Global Maritime / Strategic Waterways',
  'Arctic',
];

// ---- Category Framework (12 categories) -----------------------------------

export const CATEGORIES = [
  'Macroeconomics',
  'Central Banks & Monetary Policy',
  'Government Policy & Regulation',
  'Trade & Sanctions',
  'Energy & Commodities',
  'Markets & Financial Conditions',
  'Geopolitics & Conflict',
  'Supply Chains & Logistics',
  'Technology & Strategic Infrastructure',
  'Water, Food & Resource Security',
  'Official Data Releases',
  'Institutional Research / Reports',
];

// ---- Secondary Tags -------------------------------------------------------

export const SECONDARY_TAGS = [
  'inflation', 'GDP', 'unemployment', 'rates', 'bonds', 'FX',
  'tariffs', 'exports', 'oil', 'gas', 'ports', 'shipping',
  'pipelines', 'desalination', 'semiconductors', 'AI infrastructure',
  'sanctions', 'elections', 'fiscal policy', 'defense',
  'water stress', 'food security', 'nuclear', 'rare earths',
  'LNG', 'renewables', 'debt', 'credit rating', 'migration',
  'chokepoints', 'undersea cables', 'military', 'cyber',
];

// ---- Severity Levels ------------------------------------------------------

export const SEVERITY = {
  ROUTINE: 1,   // headline + executive summary only
  MATERIAL: 2,  // + what happened
  MAJOR: 3,     // + why this matters + linked context
};

// ---- Source Tiers ---------------------------------------------------------

export const SOURCE_TIERS = {
  OFFICIAL: 1,
  REPUTABLE: 2,
  DISCOVERY: 3,
  MARKET: 4,
};

// ---- Confidence Levels ----------------------------------------------------

export const CONFIDENCE = {
  CONFIRMED: 'confirmed',
  REPORTED: 'reported',
  UNCONFIRMED: 'unconfirmed',
  CONFLICTING: 'conflicting',
};

// ---- Event Lifecycle Statuses ---------------------------------------------

export const EVENT_STATUS = {
  ACTIVE: 'active',
  UPDATED: 'updated',
  CONFIRMED: 'confirmed',
  RESOLVED: 'resolved',
  DOWNGRADED: 'downgraded',
};

// ---- Location Confidence --------------------------------------------------

export const LOCATION_CONFIDENCE = {
  EXACT: 'exact',
  CITY: 'city',
  COUNTRY: 'country',
  REGION: 'region',
  ESTIMATED: 'estimated',
};

// ---- Factory: create a new event ------------------------------------------

export function createEvent({
  headline,
  executiveSummary = '',
  whatHappened = [],
  whyThisMatters = null,
  severity = SEVERITY.ROUTINE,
  confidence = CONFIDENCE.REPORTED,
  publishedAt = new Date().toISOString(),
  sources = [],
  primaryCountry = '',
  secondaryCountries = [],
  primaryRegion = '',
  secondaryRegions = [],
  crossRegionFlag = false,
  coordinates = null,
  geometry = null,
  locationConfidence = LOCATION_CONFIDENCE.ESTIMATED,
  category = '',
  subcategoryTags = [],
  relatedMarketInstruments = [],
  relatedContextData = [],
  status = EVENT_STATUS.ACTIVE,
  relatedEventIds = [],
  clusterId = null,
} = {}) {
  const now = new Date().toISOString();
  const primaryUrl = sources?.[0]?.url || null;

  return {
    eventId: uuidv4(),
    clusterId: clusterId || uuidv4(),
    contentFingerprint: createContentFingerprint(headline),
    urlFingerprint: createUrlFingerprint(primaryUrl),

    // Content
    headline,
    executiveSummary,
    alternateHeadlines: [],
    whatHappened,
    whyThisMatters,

    // Severity & confidence
    severity,
    confidence,

    // Temporal
    firstSeenAt: now,
    lastUpdatedAt: now,
    publishedAt,
    ingestedAt: now,

    // Sources
    sourceCount: sources.length,
    sources,

    // Geography
    primaryCountry,
    secondaryCountries,
    primaryRegion,
    secondaryRegions,
    crossRegionFlag,
    coordinates,
    geometry,
    locationConfidence,

    // Classification
    category,
    subcategoryTags,

    // Linked data
    relatedMarketInstruments,
    relatedContextData,

    // Lifecycle
    status,
    relatedEventIds,
  };
}

// ---- Factory: create a source reference -----------------------------------

export function createSource({
  name,
  url,
  tier,
  publishedAt = new Date().toISOString(),
  ingestedAt = new Date().toISOString(),
  description = '',
} = {}) {
  return { name, url, tier, publishedAt, ingestedAt, description };
}
