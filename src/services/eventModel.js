// ---------------------------------------------------------------------------
// eventModel.js — Canonical event data model for Macro Intel
// Every event flowing through the system conforms to this schema.
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';

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

  return {
    eventId: uuidv4(),
    clusterId: clusterId || uuidv4(),

    // Content
    headline,
    executiveSummary,
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
