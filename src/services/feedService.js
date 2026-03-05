// ---------------------------------------------------------------------------
// feedService.js -- RSS Feed Ingestion Engine for Global Macro Intelligence
// Zero external dependencies. Browser-native DOMParser for XML.
// Multi-proxy fallback + demo data guarantee = always-on intelligence feed.
// ---------------------------------------------------------------------------

// ---- Feed Sources (public, no API keys) -----------------------------------

export const FEEDS = [
  { name: 'Federal Reserve',   url: 'https://www.federalreserve.gov/feeds/press_all.xml',                                                                         region: 'North America', category: 'Monetary Policy' },
  { name: 'ECB',               url: 'https://www.ecb.europa.eu/rss/press.html',                                                                                    region: 'Europe',        category: 'Monetary Policy' },
  { name: 'IMF Blog',          url: 'https://www.imf.org/en/News/rss',                                                                                             region: 'Global',        category: 'Multilateral' },
  { name: 'World Bank',        url: 'https://feeds.worldbank.org/rss/topic/economy',                                                                               region: 'Global',        category: 'Multilateral' },
  { name: 'Reuters Economy',   url: 'https://news.google.com/rss/search?q=global+economy+OR+central+bank+OR+trade+tariffs+OR+sanctions&hl=en-US&gl=US&ceid=US:en', region: 'Global',        category: 'Mixed' },
  { name: 'BBC Business',      url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                                                                              region: 'Global',        category: 'Mixed' },
  { name: 'Al Jazeera Economy',url: 'https://www.aljazeera.com/xml/rss/all.xml',                                                                                   region: 'Global',        category: 'Mixed' },
  { name: 'CNBC Economy',      url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',                                         region: 'North America', category: 'Markets' },
];

// ---- Canonical Taxonomy ---------------------------------------------------

export const CATEGORIES = [
  'Monetary Policy',
  'Trade & Tariffs',
  'Sanctions',
  'Energy Markets',
  'Commodities',
  'FX',
  'Equities',
  'Sovereign Risk',
  'Emerging Markets',
  'Multilateral',
  'Markets',
  'Mixed',
];

export const REGIONS = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'Middle East & Africa',
  'Latin America',
  'Global',
];

// ---- CORS Proxies (tried in order) ----------------------------------------

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// ---- Region Coordinates ---------------------------------------------------

export const REGION_COORDS = {
  'North America':       { lat: 40.0,  lng: -100.0 },
  'Europe':              { lat: 50.0,  lng: 10.0 },
  'Asia-Pacific':        { lat: 35.0,  lng: 105.0 },
  'Middle East & Africa':{ lat: 25.0,  lng: 45.0 },
  'Latin America':       { lat: -15.0, lng: -55.0 },
  'Global':              { lat: 20.0,  lng: 0.0 },
};

// ---- Country Coordinate Lookup -------------------------------------------

const COUNTRY_COORDS = {
  'united states': { lat: 38.9,  lng: -77.0 },
  'us':            { lat: 38.9,  lng: -77.0 },
  'u.s.':          { lat: 38.9,  lng: -77.0 },
  'usa':           { lat: 38.9,  lng: -77.0 },
  'america':       { lat: 38.9,  lng: -77.0 },
  'uk':            { lat: 51.5,  lng: -0.1 },
  'britain':       { lat: 51.5,  lng: -0.1 },
  'united kingdom':{ lat: 51.5,  lng: -0.1 },
  'china':         { lat: 39.9,  lng: 116.4 },
  'japan':         { lat: 35.7,  lng: 139.7 },
  'germany':       { lat: 52.5,  lng: 13.4 },
  'brazil':        { lat: -15.8, lng: -47.9 },
  'india':         { lat: 28.6,  lng: 77.2 },
  'saudi arabia':  { lat: 24.7,  lng: 46.7 },
  'russia':        { lat: 55.8,  lng: 37.6 },
  'nigeria':       { lat: 9.1,   lng: 7.5 },
  'australia':     { lat: -33.9, lng: 151.2 },
  'south korea':   { lat: 37.6,  lng: 127.0 },
  'korea':         { lat: 37.6,  lng: 127.0 },
  'turkey':        { lat: 39.9,  lng: 32.9 },
  'argentina':     { lat: -34.6, lng: -58.4 },
  'south africa':  { lat: -33.9, lng: 18.4 },
  'switzerland':   { lat: 46.9,  lng: 7.4 },
  'france':        { lat: 48.9,  lng: 2.3 },
  'canada':        { lat: 45.4,  lng: -75.7 },
  'mexico':        { lat: 19.4,  lng: -99.1 },
  'indonesia':     { lat: -6.2,  lng: 106.8 },
  'egypt':         { lat: 30.0,  lng: 31.2 },
  'iran':          { lat: 35.7,  lng: 51.4 },
  'israel':        { lat: 31.8,  lng: 35.2 },
  'singapore':     { lat: 1.3,   lng: 103.8 },
  'taiwan':        { lat: 25.0,  lng: 121.5 },
  'vietnam':       { lat: 21.0,  lng: 105.9 },
  'thailand':      { lat: 13.8,  lng: 100.5 },
  'poland':        { lat: 52.2,  lng: 21.0 },
  'italy':         { lat: 41.9,  lng: 12.5 },
  'spain':         { lat: 40.4,  lng: -3.7 },
  'colombia':      { lat: 4.7,   lng: -74.1 },
  'chile':         { lat: -33.4, lng: -70.7 },
  'pakistan':       { lat: 33.7,  lng: 73.0 },
  'bangladesh':    { lat: 23.8,  lng: 90.4 },
  'uae':           { lat: 24.5,  lng: 54.7 },
  'qatar':         { lat: 25.3,  lng: 51.5 },
  'kenya':         { lat: -1.3,  lng: 36.8 },
  'ethiopia':      { lat: 9.0,   lng: 38.7 },
  'european':      { lat: 50.1,  lng: 8.7 },
  'eurozone':      { lat: 50.1,  lng: 8.7 },
};

// ---- Keyword Dictionaries -------------------------------------------------

const HIGH_IMPACT_KEYWORDS = [
  'emergency', 'crisis', 'default', 'war', 'sanctions', 'crash',
  'collapse', 'recession', 'inflation surge', 'rate hike', 'rate cut', 'tariff',
];

const MEDIUM_IMPACT_KEYWORDS = [
  'growth', 'gdp', 'unemployment', 'trade', 'policy', 'summit',
  'agreement', 'deal', 'bond', 'yield', 'commodity',
];

const CATEGORY_KEYWORDS = {
  'Monetary Policy':  ['rate', 'interest', 'central bank', 'fed', 'ecb', 'inflation', 'monetary', 'federal reserve', 'boj', 'pboc', 'rba'],
  'Trade & Tariffs':  ['trade', 'tariff', 'export', 'import', 'wto', 'bilateral', 'duty', 'trade war', 'trade deal', 'trade deficit'],
  'Sanctions':        ['sanction', 'ofac', 'embargo', 'restrict', 'ban', 'penalty', 'blacklist'],
  'Energy Markets':   ['oil', 'gas', 'opec', 'energy', 'crude', 'petroleum', 'pipeline', 'lng', 'refinery'],
  'Commodities':      ['gold', 'silver', 'copper', 'wheat', 'agricultural', 'commodity', 'mining', 'iron ore', 'lithium', 'soybean'],
  'FX':               ['currency', 'dollar', 'euro', 'yen', 'yuan', 'forex', 'exchange rate', 'fx', 'sterling', 'rupee'],
  'Equities':         ['stock', 'equity', 's&p', 'nasdaq', 'ftse', 'nikkei', 'index', 'rally', 'sell-off', 'dow jones', 'hang seng'],
  'Sovereign Risk':   ['debt', 'sovereign', 'bond', 'yield', 'default', 'fiscal', 'credit rating', 'downgrade', 'upgrade'],
  'Emerging Markets': ['emerging', 'developing', 'frontier', 'brics', 'emerging market'],
};

const INFLATION_KEYWORDS = {
  inflationary:    ['inflation', 'price surge', 'cpi rise', 'cost increase', 'rate hike', 'overheating', 'wage pressure', 'supply shortage', 'tariff', 'import duty'],
  disinflationary: ['deflation', 'disinflation', 'price drop', 'cpi fall', 'rate cut', 'demand weakness', 'price decline', 'easing', 'dovish'],
};

const GROWTH_KEYWORDS = {
  positive: ['growth', 'expansion', 'recovery', 'boom', 'upturn', 'rebound', 'surplus', 'job gains', 'hiring', 'bullish'],
  negative: ['recession', 'contraction', 'slowdown', 'downturn', 'decline', 'stagnation', 'job losses', 'layoffs', 'bearish', 'slump'],
};

// ---- Geo-location Helpers -------------------------------------------------

/**
 * Scan text for country names and return specific coordinates if found.
 * Falls back to region centroid with random offset.
 */
function resolveCoordinates(text, region) {
  const lower = (text || '').toLowerCase();

  // Try country-specific coordinates first
  // Sort by key length descending so "south korea" matches before "korea", etc.
  const sortedCountries = Object.entries(COUNTRY_COORDS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [country, coords] of sortedCountries) {
    // Use word boundary check to avoid partial matches
    const pattern = new RegExp(`\\b${country.replace(/\./g, '\\.')}\\b`, 'i');
    if (pattern.test(lower)) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  // Fall back to region centroid with random offset (+-5 degrees)
  const base = REGION_COORDS[region] || REGION_COORDS['Global'];
  return {
    lat: base.lat + (Math.random() - 0.5) * 10,
    lng: base.lng + (Math.random() - 0.5) * 10,
  };
}

/**
 * For demo items: use specific country coords from the headline,
 * or region coords with a spread offset so points don't cluster.
 */
function resolveDemoCoordinates(headline, summary, region, specificCoords) {
  if (specificCoords) {
    // Small jitter so multiple items in the same country don't overlap
    return {
      lat: specificCoords.lat + (Math.random() - 0.5) * 2,
      lng: specificCoords.lng + (Math.random() - 0.5) * 2,
    };
  }
  // Try to extract country from headline/summary
  return resolveCoordinates(`${headline} ${summary}`, region);
}

// ---- Scoring & Classification Helpers -------------------------------------

/**
 * Compute impact score (1-10) for a piece of text.
 * Scans for high, then medium keywords. Falls back to 3.
 */
function scoreImpact(text) {
  const lower = text.toLowerCase();
  let score = 3; // default low

  for (const kw of HIGH_IMPACT_KEYWORDS) {
    if (lower.includes(kw)) {
      // Each high-impact hit pushes toward 8-10
      score = Math.max(score, 8);
      // Second distinct high-impact keyword lifts to 10
      const otherHigh = HIGH_IMPACT_KEYWORDS.filter(k => k !== kw);
      if (otherHigh.some(k => lower.includes(k))) {
        score = 10;
      }
      break;
    }
  }

  if (score < 8) {
    for (const kw of MEDIUM_IMPACT_KEYWORDS) {
      if (lower.includes(kw)) {
        score = Math.max(score, 5);
        const otherMed = MEDIUM_IMPACT_KEYWORDS.filter(k => k !== kw);
        if (otherMed.some(k => lower.includes(k))) {
          score = Math.min(score + 2, 7);
        }
        break;
      }
    }
  }

  return score;
}

/**
 * Extract matched keywords from text across all dictionaries.
 */
function extractKeywords(text) {
  const lower = text.toLowerCase();
  const matched = new Set();

  const allKeywords = [
    ...HIGH_IMPACT_KEYWORDS,
    ...MEDIUM_IMPACT_KEYWORDS,
    ...Object.values(CATEGORY_KEYWORDS).flat(),
  ];

  for (const kw of allKeywords) {
    if (lower.includes(kw)) {
      matched.add(kw);
    }
  }

  return [...matched];
}

/**
 * Auto-categorise based on keyword density in text.
 * Returns the category with the most keyword hits, or the feed's
 * original category as fallback.
 */
function categorize(text, fallbackCategory) {
  const lower = text.toLowerCase();
  let bestCategory = fallbackCategory;
  let bestCount = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const count = keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
    if (count > bestCount) {
      bestCount = count;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/**
 * Classify inflation bias: inflationary | disinflationary | neutral.
 */
function classifyInflationBias(text) {
  const lower = text.toLowerCase();

  let inflationaryHits = 0;
  let disinflationaryHits = 0;

  for (const kw of INFLATION_KEYWORDS.inflationary) {
    if (lower.includes(kw)) inflationaryHits++;
  }
  for (const kw of INFLATION_KEYWORDS.disinflationary) {
    if (lower.includes(kw)) disinflationaryHits++;
  }

  if (inflationaryHits === 0 && disinflationaryHits === 0) return 'neutral';
  if (inflationaryHits > disinflationaryHits) return 'inflationary';
  if (disinflationaryHits > inflationaryHits) return 'disinflationary';
  return 'neutral'; // tie -> neutral
}

/**
 * Classify growth bias: positive | negative | mixed.
 */
function classifyGrowthBias(text) {
  const lower = text.toLowerCase();

  let positiveHits = 0;
  let negativeHits = 0;

  for (const kw of GROWTH_KEYWORDS.positive) {
    if (lower.includes(kw)) positiveHits++;
  }
  for (const kw of GROWTH_KEYWORDS.negative) {
    if (lower.includes(kw)) negativeHits++;
  }

  if (positiveHits === 0 && negativeHits === 0) return 'mixed';
  if (positiveHits > 0 && negativeHits > 0) return 'mixed';
  if (positiveHits > negativeHits) return 'positive';
  return 'negative';
}

// ---- XML Parsing ----------------------------------------------------------

/**
 * Strip HTML tags and decode common entities from a string.
 */
function stripHtml(html) {
  if (!html) return '';
  // Remove CDATA wrappers
  let text = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  // Decode common entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return text.trim();
}

/**
 * Get text content from first matching XML element.
 */
function getTagText(item, tagName) {
  const el = item.getElementsByTagName(tagName)[0];
  if (!el) return '';
  return el.textContent || '';
}

/**
 * Parse an RSS/Atom XML string into an array of raw item objects.
 * Handles both RSS 2.0 (<item>) and Atom (<entry>) formats.
 */
function parseXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn('XML parse error:', parseError.textContent);
    return [];
  }

  const items = [];

  // Try RSS 2.0 items first
  const rssItems = doc.getElementsByTagName('item');
  if (rssItems.length > 0) {
    for (const item of rssItems) {
      items.push({
        title:       stripHtml(getTagText(item, 'title')),
        description: stripHtml(getTagText(item, 'description')),
        link:        getTagText(item, 'link').trim(),
        pubDate:     getTagText(item, 'pubDate'),
      });
    }
    return items;
  }

  // Fall back to Atom entries
  const entries = doc.getElementsByTagName('entry');
  for (const entry of entries) {
    // Atom links live in <link href="..."/>
    const linkEl = entry.getElementsByTagName('link')[0];
    const href = linkEl ? (linkEl.getAttribute('href') || linkEl.textContent || '') : '';

    items.push({
      title:       stripHtml(getTagText(entry, 'title')),
      description: stripHtml(getTagText(entry, 'summary') || getTagText(entry, 'content')),
      link:        href.trim(),
      pubDate:     getTagText(entry, 'updated') || getTagText(entry, 'published'),
    });
  }

  return items;
}

// ---- Proxy Fallback Fetch -------------------------------------------------

/**
 * Try fetching a URL through multiple CORS proxies in sequence.
 * Returns the response text from the first proxy that succeeds.
 * Throws if all proxies fail.
 */
async function fetchWithProxyFallback(url) {
  const errors = [];

  for (const proxy of CORS_PROXIES) {
    const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(12000), // 12s per proxy attempt
      });

      if (!response.ok) {
        errors.push(`${proxy}: HTTP ${response.status}`);
        continue;
      }

      const text = await response.text();

      // Sanity check: proxies sometimes return HTML error pages
      if (!text || text.length < 50 || text.trim().startsWith('<!DOCTYPE')) {
        errors.push(`${proxy}: invalid response (not XML)`);
        continue;
      }

      return text;
    } catch (err) {
      errors.push(`${proxy}: ${err.message}`);
    }
  }

  throw new Error(`All proxies failed for ${url}: ${errors.join('; ')}`);
}

// ---- Feed Fetching --------------------------------------------------------

/**
 * Fetch a single RSS feed through CORS proxy fallback chain.
 * Returns structured items enriched with source metadata and coordinates.
 */
async function fetchFeed(feed) {
  try {
    const xmlText = await fetchWithProxyFallback(feed.url);
    const rawItems = parseXml(xmlText);

    return rawItems.map((item) => {
      const combinedText = `${item.title} ${item.description}`;
      const region = feed.region;
      const coords = resolveCoordinates(combinedText, region);

      return {
        id:             crypto.randomUUID(),
        headline:       item.title,
        summary:        item.description,
        source:         feed.name,
        link:           item.link,
        publishedAt:    item.pubDate ? new Date(item.pubDate) : new Date(),
        region,
        category:       categorize(combinedText, feed.category),
        sourceCategory: feed.category,
        impactScore:    scoreImpact(combinedText),
        keywords:       extractKeywords(combinedText),
        inflationBias:  classifyInflationBias(combinedText),
        growthBias:     classifyGrowthBias(combinedText),
        lat:            coords.lat,
        lng:            coords.lng,
      };
    });
  } catch (err) {
    console.warn(`[feedService] ${feed.name}: ${err.message}`);
    return [];
  }
}

// ---- Demo / Fallback Data -------------------------------------------------

/**
 * Generate curated demo data that covers all categories and regions.
 * Used when real feeds return 0 items (all proxies down, offline, etc.).
 * Timestamps spread across the last 72 hours for realistic feel.
 */
function generateDemoData() {
  const now = Date.now();
  const h = (hours) => new Date(now - hours * 60 * 60 * 1000);

  const demoItems = [
    // ── Monetary Policy (3) ─────────────────────────────────────────────
    {
      headline: 'Federal Reserve Holds Rates Steady, Signals Potential September Cut',
      summary: 'The FOMC voted unanimously to maintain the federal funds rate at 4.25-4.50%, citing persistent shelter inflation offsetting goods deflation. Chair Powell noted the committee sees "meaningful progress" on its dual mandate and hinted that one to two rate cuts remain on the table for late 2025 if disinflation continues.',
      source: 'Federal Reserve',
      link: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
      publishedAt: h(4),
      region: 'North America',
      category: 'Monetary Policy',
      sourceCategory: 'Monetary Policy',
      impactScore: 9,
      keywords: ['rate', 'fed', 'inflation', 'rate cut', 'monetary', 'federal reserve'],
      inflationBias: 'disinflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['united states'],
    },
    {
      headline: 'ECB Cuts Deposit Rate to 2.75% as Eurozone Growth Stalls',
      summary: 'The European Central Bank lowered its key deposit facility rate by 25 basis points, the third cut this cycle, as Q1 GDP came in at a disappointing 0.1%. President Lagarde warned that trade policy uncertainty and weak manufacturing are dragging the bloc closer to stagnation, though services inflation remains sticky above target.',
      source: 'ECB',
      link: 'https://www.ecb.europa.eu/press/pr/date/2025/html/',
      publishedAt: h(8),
      region: 'Europe',
      category: 'Monetary Policy',
      sourceCategory: 'Monetary Policy',
      impactScore: 8,
      keywords: ['rate cut', 'ecb', 'inflation', 'growth', 'monetary', 'rate'],
      inflationBias: 'disinflationary',
      growthBias: 'negative',
      _coords: { lat: 50.1, lng: 8.7 }, // Frankfurt
    },
    {
      headline: 'Bank of Japan Raises Policy Rate to 0.75%, Yen Strengthens Sharply',
      summary: 'The BoJ surprised markets with its third consecutive rate hike, bringing the overnight call rate to 0.75% as core CPI holds above 3%. The yen rallied over 2% against the dollar in the immediate aftermath. Governor Ueda cited broadening wage growth and reduced risk of deflation relapse as key factors behind the decision.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/markets/rates-bonds/',
      publishedAt: h(14),
      region: 'Asia-Pacific',
      category: 'Monetary Policy',
      sourceCategory: 'Monetary Policy',
      impactScore: 9,
      keywords: ['rate hike', 'boj', 'inflation', 'yen', 'monetary', 'rate'],
      inflationBias: 'inflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['japan'],
    },

    // ── Trade & Tariffs (2) ─────────────────────────────────────────────
    {
      headline: 'US Imposes 35% Tariff on Chinese EV and Battery Imports',
      summary: 'The Biden administration announced expanded Section 301 tariffs targeting Chinese electric vehicles, batteries, and critical minerals. The effective rate on Chinese EVs rises to 102.5% when combined with existing duties. Beijing vowed "firm countermeasures" and filed a WTO dispute, while European automakers warned of supply chain spillovers.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/business/autos-transportation/',
      publishedAt: h(12),
      region: 'North America',
      category: 'Trade & Tariffs',
      sourceCategory: 'Mixed',
      impactScore: 9,
      keywords: ['tariff', 'trade', 'trade war', 'import', 'duty'],
      inflationBias: 'inflationary',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['united states'],
    },
    {
      headline: 'India and UK Finalize Comprehensive Free Trade Agreement',
      summary: 'After three years of negotiations, India and the United Kingdom signed a bilateral free trade agreement covering goods, services, and digital trade. Tariffs on 90% of product lines will be phased out over 10 years. The deal is seen as a landmark post-Brexit achievement for London and a gateway to faster Indian export growth.',
      source: 'BBC Business',
      link: 'https://www.bbc.com/news/business',
      publishedAt: h(22),
      region: 'Asia-Pacific',
      category: 'Trade & Tariffs',
      sourceCategory: 'Mixed',
      impactScore: 7,
      keywords: ['trade', 'trade deal', 'export', 'bilateral', 'agreement'],
      inflationBias: 'disinflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['india'],
    },

    // ── Sanctions (2) ───────────────────────────────────────────────────
    {
      headline: 'EU Expands Russia Sanctions to Target LNG Transshipment and Shadow Fleet',
      summary: 'The European Union adopted its 16th sanctions package against Russia, for the first time directly targeting liquefied natural gas transshipment through EU ports and designated 47 additional vessels in Russia\'s "shadow fleet." Insurance and reinsurance of sanctioned vessels is now prohibited, tightening the net around Russian energy exports.',
      source: 'Al Jazeera Economy',
      link: 'https://www.aljazeera.com/economy',
      publishedAt: h(18),
      region: 'Europe',
      category: 'Sanctions',
      sourceCategory: 'Mixed',
      impactScore: 8,
      keywords: ['sanction', 'embargo', 'restrict', 'gas', 'lng', 'energy'],
      inflationBias: 'inflationary',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['russia'],
    },
    {
      headline: 'US Treasury Designates Iranian Drone Component Supply Network',
      summary: 'OFAC designated a network of 12 entities across Turkey, the UAE, and China involved in procuring advanced microelectronics for Iranian drone manufacturing. Secondary sanctions now apply to any financial institution processing transactions for the designated parties, raising compliance costs for regional banks.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/world/',
      publishedAt: h(30),
      region: 'Middle East & Africa',
      category: 'Sanctions',
      sourceCategory: 'Mixed',
      impactScore: 7,
      keywords: ['sanction', 'ofac', 'restrict', 'penalty'],
      inflationBias: 'neutral',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['iran'],
    },

    // ── Energy Markets (2) ──────────────────────────────────────────────
    {
      headline: 'OPEC+ Agrees to Extend Production Cuts Through Q3 2025',
      summary: 'The OPEC+ alliance voted to maintain current output reductions of 2.2 million barrels per day through September, defying market expectations of a gradual unwind. Saudi Arabia signaled willingness to make additional voluntary cuts if prices fall below $75/barrel. Brent crude rallied 4% on the announcement.',
      source: 'Al Jazeera Economy',
      link: 'https://www.aljazeera.com/economy',
      publishedAt: h(16),
      region: 'Middle East & Africa',
      category: 'Energy Markets',
      sourceCategory: 'Mixed',
      impactScore: 8,
      keywords: ['oil', 'opec', 'crude', 'energy', 'commodity'],
      inflationBias: 'inflationary',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['saudi arabia'],
    },
    {
      headline: 'US Natural Gas Prices Surge as Heat Dome Drives Record Power Demand',
      summary: 'Henry Hub natural gas futures jumped 18% in a single week as an unprecedented early-summer heat dome blanketed the southern and eastern United States. Power burn demand hit 48 Bcf/d, a new record, draining storage injections and raising concerns about winter supply adequacy. Utilities are accelerating LNG spot cargo purchases.',
      source: 'CNBC Economy',
      link: 'https://www.cnbc.com/energy/',
      publishedAt: h(26),
      region: 'North America',
      category: 'Energy Markets',
      sourceCategory: 'Markets',
      impactScore: 7,
      keywords: ['gas', 'energy', 'commodity'],
      inflationBias: 'inflationary',
      growthBias: 'mixed',
      _coords: COUNTRY_COORDS['united states'],
    },

    // ── Commodities (2) ─────────────────────────────────────────────────
    {
      headline: 'Gold Breaks $2,800 as Central Banks Accelerate Reserve Diversification',
      summary: 'Spot gold surged past $2,800 per ounce for the first time, driven by record central bank purchases led by China, Poland, and India. The World Gold Council reported 387 tonnes of official sector buying in Q1 alone, on pace to exceed the 2024 full-year record. Real yields remain suppressed despite nominal rate hikes.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/markets/commodities/',
      publishedAt: h(10),
      region: 'Global',
      category: 'Commodities',
      sourceCategory: 'Mixed',
      impactScore: 7,
      keywords: ['gold', 'commodity'],
      inflationBias: 'inflationary',
      growthBias: 'mixed',
      _coords: COUNTRY_COORDS['china'],
    },
    {
      headline: 'Lithium Prices Rebound 40% as EV Demand Outpaces New Mine Supply',
      summary: 'Lithium carbonate prices in China have surged from their 2024 lows, climbing back above $18,000/tonne as electric vehicle sales growth re-accelerates across China and Europe. Several planned expansions in Australia and Chile have been delayed due to permitting issues, tightening the near-term supply outlook ahead of a structural deficit projected for 2026.',
      source: 'BBC Business',
      link: 'https://www.bbc.com/news/business',
      publishedAt: h(34),
      region: 'Asia-Pacific',
      category: 'Commodities',
      sourceCategory: 'Mixed',
      impactScore: 6,
      keywords: ['lithium', 'commodity', 'mining'],
      inflationBias: 'inflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['australia'],
    },

    // ── FX (2) ──────────────────────────────────────────────────────────
    {
      headline: 'Dollar Index Falls Below 100 for First Time Since 2023 on Dual Deficit Concerns',
      summary: 'The DXY dollar index broke below the psychologically significant 100 level as markets repriced the US fiscal trajectory. The Congressional Budget Office revised its 2025 deficit forecast to 7.2% of GDP, while the current account deficit widened to 3.8%. Euro and yen were the primary beneficiaries, with EUR/USD trading above 1.14.',
      source: 'CNBC Economy',
      link: 'https://www.cnbc.com/currencies/',
      publishedAt: h(20),
      region: 'North America',
      category: 'FX',
      sourceCategory: 'Markets',
      impactScore: 8,
      keywords: ['dollar', 'currency', 'forex', 'euro', 'yen', 'exchange rate', 'fiscal', 'yield'],
      inflationBias: 'inflationary',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['united states'],
    },
    {
      headline: 'Turkish Lira Stabilizes After Central Bank Raises Rates to 50%',
      summary: 'The Central Bank of Turkey held its benchmark rate at 50% for the fourth consecutive month, maintaining the orthodoxy pivot that has brought annual inflation down from 75% to 38%. The lira has appreciated 8% in real terms year-to-date, attracting carry trade flows that pushed gross reserves above $150 billion for the first time.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/markets/currencies/',
      publishedAt: h(38),
      region: 'Europe',
      category: 'FX',
      sourceCategory: 'Mixed',
      impactScore: 6,
      keywords: ['currency', 'rate', 'inflation', 'rate hike'],
      inflationBias: 'disinflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['turkey'],
    },

    // ── Equities (2) ────────────────────────────────────────────────────
    {
      headline: 'S&P 500 Hits Record High as AI Capex Cycle Drives Earnings Beat',
      summary: 'The S&P 500 closed at an all-time high of 5,842, lifted by blowout earnings from mega-cap tech firms. Hyperscaler capital expenditure guidance for 2025 was revised up by a collective $47 billion, signaling sustained demand for AI infrastructure. Breadth improved with 380 names above their 200-day moving average.',
      source: 'CNBC Economy',
      link: 'https://www.cnbc.com/markets/',
      publishedAt: h(6),
      region: 'North America',
      category: 'Equities',
      sourceCategory: 'Markets',
      impactScore: 7,
      keywords: ['stock', 'equity', 's&p', 'index', 'rally'],
      inflationBias: 'neutral',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['united states'],
    },
    {
      headline: 'Hang Seng Jumps 5% on Beijing Property Stimulus and Tech Rally',
      summary: 'Hong Kong\'s Hang Seng Index posted its best weekly gain in three months after China\'s State Council announced a comprehensive property support package including mortgage rate cuts, down payment reductions, and local government bond quotas for housing inventory purchases. Tech giants Alibaba and Tencent led the rally on strong quarterly results.',
      source: 'BBC Business',
      link: 'https://www.bbc.com/news/business',
      publishedAt: h(28),
      region: 'Asia-Pacific',
      category: 'Equities',
      sourceCategory: 'Mixed',
      impactScore: 7,
      keywords: ['stock', 'equity', 'hang seng', 'index', 'rally', 'rate cut'],
      inflationBias: 'disinflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['china'],
    },

    // ── Sovereign Risk (2) ──────────────────────────────────────────────
    {
      headline: 'Moody\'s Downgrades France to Aa3 on Fiscal Deterioration',
      summary: 'Moody\'s lowered France\'s sovereign credit rating by one notch, citing the government\'s inability to pass meaningful fiscal consolidation after the collapse of the minority coalition. The 2025 deficit is projected at 5.8% of GDP with debt-to-GDP approaching 115%. OAT-Bund spreads widened 15bp on the announcement.',
      source: 'Reuters Economy',
      link: 'https://www.reuters.com/markets/rates-bonds/',
      publishedAt: h(24),
      region: 'Europe',
      category: 'Sovereign Risk',
      sourceCategory: 'Mixed',
      impactScore: 8,
      keywords: ['sovereign', 'debt', 'fiscal', 'downgrade', 'credit rating', 'bond', 'yield'],
      inflationBias: 'neutral',
      growthBias: 'negative',
      _coords: COUNTRY_COORDS['france'],
    },
    {
      headline: 'Argentina Reaches Deal with IMF for $15B Extended Fund Facility',
      summary: 'Argentina secured a new $15 billion program with the International Monetary Fund, replacing the previous arrangement. The deal includes a crawling peg exchange rate band, fiscal primary surplus targets of 2% of GDP, and central bank independence safeguards. Sovereign bonds rallied 8 points, with country risk dropping below 700bp.',
      source: 'IMF Blog',
      link: 'https://www.imf.org/en/News',
      publishedAt: h(42),
      region: 'Latin America',
      category: 'Sovereign Risk',
      sourceCategory: 'Multilateral',
      impactScore: 7,
      keywords: ['sovereign', 'debt', 'fiscal', 'bond', 'deal', 'agreement'],
      inflationBias: 'disinflationary',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['argentina'],
    },

    // ── Emerging Markets (2) ────────────────────────────────────────────
    {
      headline: 'Nigeria Attracts Record FDI After Naira Liberalization and Subsidy Reforms',
      summary: 'Foreign direct investment into Nigeria hit $3.2 billion in Q1 2025, the highest quarterly figure in a decade. The reforms that unified the naira exchange rate and removed fuel subsidies are credited with restoring investor confidence. The stock exchange is up 42% year-to-date in dollar terms, making Lagos the world\'s best-performing equity market.',
      source: 'World Bank',
      link: 'https://www.worldbank.org/en/news',
      publishedAt: h(36),
      region: 'Middle East & Africa',
      category: 'Emerging Markets',
      sourceCategory: 'Multilateral',
      impactScore: 6,
      keywords: ['emerging', 'growth', 'currency', 'equity'],
      inflationBias: 'neutral',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['nigeria'],
    },
    {
      headline: 'Vietnam GDP Growth Hits 7.4% as Manufacturing FDI Diversifies from China',
      summary: 'Vietnam reported 7.4% year-on-year GDP growth in Q1, driven by surging foreign direct investment in electronics and semiconductor assembly. Samsung, Intel, and Apple suppliers have accelerated capacity expansion as firms diversify supply chains away from China. The trade surplus widened to $8.1 billion, supporting the dong.',
      source: 'BBC Business',
      link: 'https://www.bbc.com/news/business',
      publishedAt: h(46),
      region: 'Asia-Pacific',
      category: 'Emerging Markets',
      sourceCategory: 'Mixed',
      impactScore: 6,
      keywords: ['growth', 'emerging', 'trade', 'surplus', 'export'],
      inflationBias: 'neutral',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['vietnam'],
    },

    // ── Multilateral (1) ────────────────────────────────────────────────
    {
      headline: 'G7 Agrees to Mobilize $100B in Climate Finance Using Frozen Russian Assets',
      summary: 'G7 leaders reached a landmark agreement to use the windfall profits from immobilized Russian sovereign assets (approximately $280 billion held in Western institutions) to fund a $100 billion climate finance facility for developing nations. The mechanism uses asset income streams as collateral for front-loaded lending, bypassing the legal complexities of outright asset seizure.',
      source: 'IMF Blog',
      link: 'https://www.imf.org/en/Blogs',
      publishedAt: h(50),
      region: 'Global',
      category: 'Multilateral',
      sourceCategory: 'Multilateral',
      impactScore: 8,
      keywords: ['sanction', 'summit', 'agreement', 'deal'],
      inflationBias: 'neutral',
      growthBias: 'positive',
      _coords: COUNTRY_COORDS['switzerland'],
    },
  ];

  // Enrich each demo item with id and resolved coordinates
  return demoItems.map((item) => {
    const coords = resolveDemoCoordinates(
      item.headline,
      item.summary,
      item.region,
      item._coords,
    );

    const enriched = {
      ...item,
      id: crypto.randomUUID(),
      lat: coords.lat,
      lng: coords.lng,
    };

    // Remove internal _coords helper
    delete enriched._coords;

    return enriched;
  });
}

// ---- Public API -----------------------------------------------------------

/**
 * Fetch all configured RSS feeds concurrently and return a flat,
 * de-duplicated, impact-sorted array of structured items.
 *
 * If all feeds fail (CORS proxies down, offline, etc.), returns
 * curated demo data so the UI always has something to show.
 */
export async function fetchAllFeeds() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems = results.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );

  // De-duplicate by headline + source (same article from same feed)
  const seen = new Set();
  const unique = allItems.filter((item) => {
    const key = `${item.source}::${item.headline}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by impact score descending, then by date descending
  unique.sort((a, b) => {
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  // If no real items came through, fall back to demo data
  if (unique.length === 0) {
    console.warn('[feedService] All feeds failed. Using demo data.');
    return generateDemoData();
  }

  return unique;
}
