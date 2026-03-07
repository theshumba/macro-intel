// ---------------------------------------------------------------------------
// classifier.js — Event classification, severity, and tag extraction
// Replaces the old keyword-counting approach with structured rules.
// ---------------------------------------------------------------------------

import { SEVERITY, CATEGORIES } from './eventModel.js';

// ---- Category Keywords (mapped to new 12-category framework) --------------

const CATEGORY_RULES = {
  'Central Banks & Monetary Policy': {
    keywords: ['central bank', 'interest rate', 'rate hike', 'rate cut', 'fed', 'ecb', 'boe', 'boj', 'pboc', 'rbi', 'rba', 'monetary policy', 'federal reserve', 'fomc', 'quantitative', 'tightening', 'easing', 'hawkish', 'dovish', 'deposit rate', 'policy rate', 'overnight rate'],
    weight: 3,
  },
  'Trade & Sanctions': {
    keywords: ['tariff', 'trade war', 'trade deal', 'free trade', 'sanctions', 'embargo', 'ofac', 'wto', 'export ban', 'import duty', 'trade deficit', 'trade surplus', 'bilateral trade', 'trade agreement', 'blacklist', 'restricted entity', 'secondary sanctions', 'trade barrier', 'customs', 'anti-dumping'],
    weight: 3,
  },
  'Energy & Commodities': {
    keywords: ['oil', 'gas', 'opec', 'crude', 'petroleum', 'lng', 'pipeline', 'refinery', 'energy', 'commodity', 'gold', 'silver', 'copper', 'wheat', 'lithium', 'iron ore', 'coal', 'uranium', 'renewables', 'solar', 'wind power', 'nuclear', 'mining', 'barrel', 'brent', 'wti', 'henry hub', 'rare earth'],
    weight: 3,
  },
  'Geopolitics & Conflict': {
    keywords: ['war', 'conflict', 'military', 'invasion', 'airstrike', 'missile', 'drone', 'ceasefire', 'peace talks', 'territorial', 'annexation', 'nato', 'alliance', 'defense', 'weapons', 'nuclear', 'escalation', 'de-escalation', 'coup', 'insurgency', 'rebel', 'militia', 'peacekeeping'],
    weight: 3,
  },
  'Macroeconomics': {
    keywords: ['gdp', 'inflation', 'cpi', 'pce', 'unemployment', 'jobs', 'payroll', 'recession', 'expansion', 'growth', 'contraction', 'fiscal policy', 'budget', 'spending', 'stimulus', 'austerity', 'debt-to-gdp', 'current account', 'balance of payments'],
    weight: 2,
  },
  'Markets & Financial Conditions': {
    keywords: ['stock', 'equity', 'bond', 'yield', 'spread', 'credit', 'default', 'downgrade', 'upgrade', 'rating', 'forex', 'currency', 'dollar', 'euro', 'yen', 'yuan', 'sterling', 'index', 'nasdaq', 's&p', 'ftse', 'nikkei', 'rally', 'sell-off', 'volatility', 'vix', 'ipo', 'market crash'],
    weight: 2,
  },
  'Government Policy & Regulation': {
    keywords: ['regulation', 'legislation', 'executive order', 'congress', 'parliament', 'election', 'vote', 'referendum', 'subsidy', 'tax', 'fiscal', 'budget', 'debt ceiling', 'government shutdown', 'cabinet', 'minister', 'prime minister', 'president signed', 'policy reform'],
    weight: 2,
  },
  'Supply Chains & Logistics': {
    keywords: ['supply chain', 'shipping', 'port', 'freight', 'container', 'logistics', 'semiconductor', 'chip shortage', 'factory', 'manufacturing', 'disruption', 'bottleneck', 'inventory', 'just-in-time', 'reshoring', 'nearshoring', 'onshoring'],
    weight: 2,
  },
  'Technology & Strategic Infrastructure': {
    keywords: ['ai infrastructure', 'data center', 'semiconductor', 'chip', 'subsea cable', 'undersea cable', '5g', '6g', 'quantum', 'space', 'satellite', 'cyber', 'critical infrastructure', 'tech regulation', 'cloud computing', 'digital currency', 'cbdc'],
    weight: 2,
  },
  'Water, Food & Resource Security': {
    keywords: ['water', 'desalination', 'drought', 'famine', 'food security', 'crop', 'harvest', 'irrigation', 'aquifer', 'water stress', 'food price', 'grain', 'fertilizer', 'agricultural', 'food crisis', 'hunger'],
    weight: 2,
  },
  'Official Data Releases': {
    keywords: ['data release', 'statistics office', 'bureau of', 'census', 'survey', 'pmi', 'manufacturing index', 'consumer confidence', 'retail sales', 'housing starts', 'trade balance', 'jobs report', 'nonfarm payroll', 'initial claims'],
    weight: 2,
  },
  'Institutional Research / Reports': {
    keywords: ['imf report', 'world bank report', 'oecd report', 'outlook', 'forecast', 'projection', 'working paper', 'research', 'study finds', 'annual report', 'global economic prospects'],
    weight: 1,
  },
};

// ---- Secondary Tag Extraction Rules ---------------------------------------

const TAG_RULES = {
  inflation: ['inflation', 'cpi', 'pce', 'price surge', 'cost increase', 'price pressure', 'disinflation', 'deflation'],
  GDP: ['gdp', 'gross domestic product', 'economic growth', 'economic output'],
  unemployment: ['unemployment', 'jobs', 'payroll', 'labor market', 'hiring', 'layoffs', 'jobless'],
  rates: ['interest rate', 'rate hike', 'rate cut', 'policy rate', 'benchmark rate', 'deposit rate'],
  bonds: ['bond', 'treasury', 'yield', 'spread', 'sovereign debt', 'gilt', 'bund'],
  FX: ['currency', 'dollar', 'euro', 'yen', 'yuan', 'forex', 'exchange rate', 'fx', 'lira', 'rupee', 'rand'],
  tariffs: ['tariff', 'duty', 'trade barrier', 'anti-dumping', 'countervailing'],
  exports: ['export', 'trade surplus', 'trade balance'],
  oil: ['oil', 'crude', 'brent', 'wti', 'petroleum', 'barrel'],
  gas: ['gas', 'lng', 'natural gas', 'henry hub', 'pipeline'],
  ports: ['port', 'harbor', 'terminal', 'docking'],
  shipping: ['shipping', 'freight', 'container', 'vessel', 'tanker', 'maritime'],
  pipelines: ['pipeline', 'nord stream', 'turk stream', 'keystone'],
  desalination: ['desalination', 'water treatment', 'water plant'],
  semiconductors: ['semiconductor', 'chip', 'tsmc', 'asml', 'fabrication', 'foundry'],
  'AI infrastructure': ['ai infrastructure', 'data center', 'gpu', 'cloud computing', 'hyperscaler'],
  sanctions: ['sanction', 'ofac', 'embargo', 'blacklist', 'restricted', 'designated'],
  elections: ['election', 'vote', 'ballot', 'referendum', 'campaign', 'polling'],
  'fiscal policy': ['fiscal', 'budget', 'spending', 'deficit', 'surplus', 'debt ceiling', 'austerity'],
  defense: ['defense', 'defence', 'military', 'arms', 'weapons', 'missile'],
  'water stress': ['water stress', 'water scarcity', 'drought', 'aquifer', 'water shortage'],
  'food security': ['food security', 'famine', 'hunger', 'crop failure', 'grain shortage'],
  nuclear: ['nuclear', 'uranium', 'enrichment', 'reactor', 'nonproliferation'],
  'rare earths': ['rare earth', 'critical mineral', 'lithium', 'cobalt', 'nickel'],
  LNG: ['lng', 'liquefied natural gas', 'gas terminal', 'regasification'],
  renewables: ['renewable', 'solar', 'wind', 'green energy', 'clean energy', 'hydrogen'],
  debt: ['debt', 'sovereign debt', 'external debt', 'default', 'restructuring'],
  'credit rating': ['credit rating', 'downgrade', 'upgrade', 'moody', 'fitch', 's&p global', 'rating agency'],
  chokepoints: ['chokepoint', 'strait', 'canal', 'passage', 'bottleneck'],
  'undersea cables': ['undersea cable', 'subsea cable', 'submarine cable', 'internet cable'],
};

// ---- Severity Rules -------------------------------------------------------

const MAJOR_INDICATORS = [
  'war', 'invasion', 'emergency', 'crisis', 'collapse', 'crash', 'default',
  'systemic', 'chokepoint threat', 'oil supply disruption', 'shipping blocked',
  'emergency rate', 'sovereign crisis', 'infrastructure attack', 'nuclear',
  'escalation', 'sanctions package', 'martial law', 'coup',
];

const MATERIAL_INDICATORS = [
  'sanctions', 'tariff', 'rate hike', 'rate cut', 'strike', 'disruption',
  'supply chain', 'major speech', 'summit', 'agreement', 'pipeline',
  'election result', 'downgrade', 'upgrade', 'deal', 'conflict',
  'embargo', 'protest', 'blockade', 'cyber attack',
];

// ---- Main Classification Functions ----------------------------------------

/**
 * Classify an article into the 12-category framework.
 * Returns the best-matching category or a fallback.
 */
export function classifyCategory(text, fallbackCategory = 'Macroeconomics') {
  const lower = text.toLowerCase();
  let bestCategory = fallbackCategory;
  let bestScore = 0;

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const kw of rules.keywords) {
      if (lower.includes(kw)) {
        score += rules.weight;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/**
 * Extract secondary tags from text.
 * Returns array of matched tag names.
 */
export function extractTags(text) {
  const lower = text.toLowerCase();
  const tags = [];

  for (const [tag, keywords] of Object.entries(TAG_RULES)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        tags.push(tag);
        break; // One match per tag is enough
      }
    }
  }

  return tags;
}

/**
 * Determine event severity (1=Routine, 2=Material, 3=Major).
 * Uses keyword indicators, source count, and cross-region flag.
 */
export function classifySeverity(text, sourceCount = 1, crossRegion = false) {
  const lower = text.toLowerCase();

  // Check for major indicators first
  let majorHits = 0;
  for (const kw of MAJOR_INDICATORS) {
    if (lower.includes(kw)) majorHits++;
  }
  if (majorHits >= 2 || (majorHits >= 1 && sourceCount >= 3)) {
    return SEVERITY.MAJOR;
  }

  // Check for material indicators
  let materialHits = 0;
  for (const kw of MATERIAL_INDICATORS) {
    if (lower.includes(kw)) materialHits++;
  }
  if (materialHits >= 2 || (materialHits >= 1 && (sourceCount >= 2 || crossRegion))) {
    return SEVERITY.MATERIAL;
  }

  // Default to routine
  return SEVERITY.ROUTINE;
}

/**
 * Determine confidence level based on source tier and count.
 */
export function classifyConfidence(sources = []) {
  if (sources.length === 0) return 'unconfirmed';

  const hasTier1 = sources.some(s => s.tier === 1);
  const hasTier2 = sources.some(s => s.tier === 2);
  const hasConflict = false; // Would need NLP to detect — flag for future

  if (hasConflict) return 'conflicting';
  if (hasTier1) return 'confirmed';
  if (hasTier2 && sources.length >= 2) return 'confirmed';
  if (hasTier2) return 'reported';
  return 'reported';
}
