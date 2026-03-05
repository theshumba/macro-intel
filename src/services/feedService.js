// ---------------------------------------------------------------------------
// feedService.js -- RSS Feed Ingestion Engine for Global Macro Intelligence
// Zero external dependencies. Browser-native DOMParser for XML.
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

// ---- CORS Proxy -----------------------------------------------------------

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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

// ---- Feed Fetching --------------------------------------------------------

/**
 * Fetch a single RSS feed through the CORS proxy.
 * Returns structured items enriched with source metadata.
 */
async function fetchFeed(feed) {
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feed.url)}`;

  try {
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(15000), // 15s timeout per feed
    });

    if (!response.ok) {
      console.warn(`[feedService] ${feed.name}: HTTP ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const rawItems = parseXml(xmlText);

    return rawItems.map((item) => {
      const combinedText = `${item.title} ${item.description}`;

      return {
        id:             crypto.randomUUID(),
        headline:       item.title,
        summary:        item.description,
        source:         feed.name,
        link:           item.link,
        publishedAt:    item.pubDate ? new Date(item.pubDate) : new Date(),
        region:         feed.region,
        category:       categorize(combinedText, feed.category),
        sourceCategory: feed.category,
        impactScore:    scoreImpact(combinedText),
        keywords:       extractKeywords(combinedText),
        inflationBias:  classifyInflationBias(combinedText),
        growthBias:     classifyGrowthBias(combinedText),
      };
    });
  } catch (err) {
    console.warn(`[feedService] ${feed.name}: ${err.message}`);
    return [];
  }
}

// ---- Public API -----------------------------------------------------------

/**
 * Fetch all configured RSS feeds concurrently and return a flat,
 * de-duplicated, impact-sorted array of structured items.
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

  return unique;
}
