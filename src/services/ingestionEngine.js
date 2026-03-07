// ---------------------------------------------------------------------------
// ingestionEngine.js — Live news ingestion engine for Macro Intel
// Handles source expansion, classification, geolocation, clustering,
// deduplication, and archive storage.
// ---------------------------------------------------------------------------

import { createEvent, createSource, SOURCE_TIERS } from './eventModel.js';
import { ACTIVE_FEEDS, getActiveFeedsByPollInterval } from './sourceRegistry.js';
import { geolocateEvent, inferRegionFromSource } from './geolocation.js';
import { classifyCategory, extractTags, classifySeverity, classifyConfidence } from './classifier.js';
import { clusterEvents, deduplicateClusters } from './clustering.js';
import { storeEvents } from './archiveDb.js';
import { stripHtml, getTagText, parseXml } from './xmlParser.js';

// ---- Configuration --------------------------------------------------------

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '';

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// ---- Fetch Helpers --------------------------------------------------------

async function fetchWithProxyFallback(url) {
  const errors = [];
  for (const proxy of CORS_PROXIES) {
    const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) { errors.push(`${proxy}: HTTP ${response.status}`); continue; }
      const text = await response.text();
      if (!text || text.length < 50 || text.trim().startsWith('<!DOCTYPE')) {
        errors.push(`${proxy}: invalid response`); continue;
      }
      return text;
    } catch (err) {
      errors.push(`${proxy}: ${err.message}`);
    }
  }
  throw new Error(`All proxies failed for ${url}`);
}

async function fetchFromWorker() {
  if (!WORKER_URL) return null;
  try {
    const response = await fetch(`${WORKER_URL}/api/feeds`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

// ---- Single Feed Fetch + Enrichment ---------------------------------------

async function fetchAndEnrichFeed(feed) {
  try {
    const xmlText = await fetchWithProxyFallback(feed.url);
    const rawItems = parseXml(xmlText);

    return rawItems.map(item => {
      const combinedText = `${item.title} ${item.description}`;

      // Source
      const source = createSource({
        name: feed.name,
        url: item.link,
        tier: feed.tier,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      });

      // Geolocation
      const geo = geolocateEvent(combinedText, feed.name);
      const region = geo.primaryRegion || inferRegionFromSource(feed);

      // Classification
      const category = classifyCategory(combinedText, feed.defaultCategory);
      const tags = extractTags(combinedText);
      const severity = classifySeverity(combinedText, 1, geo.crossRegionFlag);
      const confidence = classifyConfidence([source]);

      return createEvent({
        headline: item.title,
        executiveSummary: item.description,
        severity,
        confidence,
        publishedAt: source.publishedAt,
        sources: [source],
        primaryCountry: geo.primaryCountry,
        secondaryCountries: geo.secondaryCountries,
        primaryRegion: region,
        secondaryRegions: geo.secondaryRegions,
        crossRegionFlag: geo.crossRegionFlag,
        coordinates: geo.coordinates,
        locationConfidence: geo.locationConfidence,
        category,
        subcategoryTags: tags,
      });
    });
  } catch (err) {
    console.warn(`[ingestion] ${feed.name}: ${err.message}`);
    return [];
  }
}

// ---- Worker Data Enrichment -----------------------------------------------

function enrichWorkerItems(workerData) {
  return workerData.items.map(item => {
    const combinedText = `${item.title} ${item.description}`;

    const source = createSource({
      name: item.sourceName,
      url: item.link,
      tier: item.sourceName?.includes('Federal Reserve') || item.sourceName?.includes('ECB')
        ? SOURCE_TIERS.OFFICIAL : SOURCE_TIERS.REPUTABLE,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    });

    const geo = geolocateEvent(combinedText, item.sourceName || '');
    const region = geo.primaryRegion || item.sourceRegion || '';
    const category = classifyCategory(combinedText, item.sourceCategory || 'Macroeconomics');
    const tags = extractTags(combinedText);
    const severity = classifySeverity(combinedText, 1, geo.crossRegionFlag);

    return createEvent({
      headline: item.title,
      executiveSummary: item.description,
      severity,
      confidence: classifyConfidence([source]),
      publishedAt: source.publishedAt,
      sources: [source],
      primaryCountry: geo.primaryCountry,
      secondaryCountries: geo.secondaryCountries,
      primaryRegion: region,
      secondaryRegions: geo.secondaryRegions,
      crossRegionFlag: geo.crossRegionFlag,
      coordinates: geo.coordinates,
      locationConfidence: geo.locationConfidence,
      category,
      subcategoryTags: tags,
    });
  });
}

// ---- Demo Data ------------------------------------------------------------

function generateDemoData() {
  const now = Date.now();
  const h = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  const demos = [
    {
      headline: 'Federal Reserve Holds Rates Steady, Signals Potential September Cut',
      summary: 'The FOMC voted unanimously to maintain the federal funds rate at 4.25-4.50%, citing persistent shelter inflation. Chair Powell noted the committee sees meaningful progress on its dual mandate.',
      sourceName: 'Federal Reserve', tier: 1, url: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
      publishedAt: h(4),
    },
    {
      headline: 'ECB Cuts Deposit Rate to 2.75% as Eurozone Growth Stalls',
      summary: 'The European Central Bank lowered its key deposit facility rate by 25 basis points as Q1 GDP came in at 0.1%. President Lagarde warned that trade policy uncertainty and weak manufacturing are weighing on the bloc.',
      sourceName: 'ECB', tier: 1, url: 'https://www.ecb.europa.eu/press/pr/date/2025/html/',
      publishedAt: h(8),
    },
    {
      headline: 'US Imposes 35% Tariff on Chinese EV and Battery Imports',
      summary: 'The administration announced expanded Section 301 tariffs targeting Chinese electric vehicles, batteries, and critical minerals. Beijing vowed countermeasures and filed a WTO dispute.',
      sourceName: 'Reuters', tier: 2, url: 'https://www.reuters.com/business/',
      publishedAt: h(12),
    },
    {
      headline: 'EU Expands Russia Sanctions to Target LNG Transshipment and Shadow Fleet',
      summary: 'The EU adopted its 16th sanctions package against Russia, targeting LNG transshipment through EU ports and 47 additional shadow fleet vessels. Insurance of sanctioned vessels is now prohibited.',
      sourceName: 'Al Jazeera', tier: 2, url: 'https://www.aljazeera.com/economy',
      publishedAt: h(18),
    },
    {
      headline: 'OPEC+ Agrees to Extend Production Cuts Through Q3',
      summary: 'The OPEC+ alliance voted to maintain output reductions of 2.2 million barrels per day. Saudi Arabia signaled willingness to make additional voluntary cuts if prices fall below $75/barrel.',
      sourceName: 'Al Jazeera', tier: 2, url: 'https://www.aljazeera.com/economy',
      publishedAt: h(16),
    },
    {
      headline: 'Bank of Japan Raises Policy Rate to 0.75%, Yen Strengthens',
      summary: 'The BoJ raised the overnight call rate to 0.75% as core CPI holds above 3%. The yen rallied over 2% against the dollar. Governor Ueda cited broadening wage growth as a key factor.',
      sourceName: 'BBC Business', tier: 2, url: 'https://www.bbc.com/news/business',
      publishedAt: h(14),
    },
    {
      headline: 'Gold Breaks $2,800 as Central Banks Accelerate Reserve Diversification',
      summary: 'Spot gold surged past $2,800 per ounce driven by record central bank purchases led by China, Poland, and India. The World Gold Council reported 387 tonnes of official sector buying in Q1.',
      sourceName: 'CNBC', tier: 2, url: 'https://www.cnbc.com/commodities/',
      publishedAt: h(10),
    },
    {
      headline: 'Moody\'s Downgrades France to Aa3 on Fiscal Deterioration',
      summary: 'Moody\'s lowered France\'s sovereign credit rating citing the government\'s inability to pass fiscal consolidation. The 2025 deficit is projected at 5.8% of GDP with debt approaching 115%.',
      sourceName: 'Reuters', tier: 2, url: 'https://www.reuters.com/markets/',
      publishedAt: h(24),
    },
    {
      headline: 'Dollar Index Falls Below 100 on Dual Deficit Concerns',
      summary: 'The DXY dollar index broke below 100 as markets repriced the US fiscal trajectory. CBO revised the 2025 deficit forecast to 7.2% of GDP while the current account deficit widened to 3.8%.',
      sourceName: 'CNBC', tier: 2, url: 'https://www.cnbc.com/currencies/',
      publishedAt: h(20),
    },
    {
      headline: 'S&P 500 Hits Record High as AI Capex Cycle Drives Earnings Beat',
      summary: 'The S&P 500 closed at an all-time high of 5,842. Hyperscaler capital expenditure guidance for 2025 was revised up by $47 billion, signaling sustained demand for AI infrastructure.',
      sourceName: 'CNBC', tier: 2, url: 'https://www.cnbc.com/markets/',
      publishedAt: h(6),
    },
    {
      headline: 'Strait of Hormuz: Iran Threatens to Restrict Tanker Traffic After New Sanctions',
      summary: 'Iran warned it could restrict tanker access through the Strait of Hormuz in response to expanded Western sanctions targeting its drone component supply network. US Fifth Fleet raised alert level.',
      sourceName: 'BBC Business', tier: 2, url: 'https://www.bbc.com/news/business',
      publishedAt: h(22),
    },
    {
      headline: 'Vietnam GDP Growth Hits 7.4% as Manufacturing FDI Diversifies from China',
      summary: 'Vietnam reported 7.4% year-on-year GDP growth driven by surging FDI in electronics and semiconductor assembly. Samsung, Intel, and Apple suppliers have accelerated capacity expansion.',
      sourceName: 'BBC Business', tier: 2, url: 'https://www.bbc.com/news/business',
      publishedAt: h(46),
    },
    {
      headline: 'India and UK Finalize Comprehensive Free Trade Agreement',
      summary: 'After three years of negotiations, India and the UK signed a bilateral free trade agreement covering goods, services, and digital trade. Tariffs on 90% of product lines will be phased out over 10 years.',
      sourceName: 'BBC Business', tier: 2, url: 'https://www.bbc.com/news/business',
      publishedAt: h(32),
    },
    {
      headline: 'Taiwan Strait: PLA Navy Conducts Largest Military Exercise in 18 Months',
      summary: 'China\'s military conducted large-scale naval exercises around Taiwan involving 40+ vessels and aircraft. The exercises simulated a blockade scenario. The US deployed an additional carrier group to the western Pacific.',
      sourceName: 'CNN Business', tier: 2, url: 'https://www.cnn.com/business',
      publishedAt: h(28),
    },
    {
      headline: 'G7 Agrees to Mobilize $100B in Climate Finance Using Frozen Russian Assets',
      summary: 'G7 leaders agreed to use windfall profits from immobilized Russian sovereign assets to fund a $100 billion climate finance facility for developing nations.',
      sourceName: 'IMF', tier: 1, url: 'https://www.imf.org/en/Blogs',
      publishedAt: h(50),
    },
    {
      headline: 'Nigeria Attracts Record FDI After Naira Liberalization and Subsidy Reforms',
      summary: 'FDI into Nigeria hit $3.2 billion in Q1 2025, the highest quarterly figure in a decade. Reforms that unified the naira exchange rate and removed fuel subsidies are credited with restoring investor confidence.',
      sourceName: 'World Bank', tier: 1, url: 'https://www.worldbank.org/en/news',
      publishedAt: h(36),
    },
  ];

  return demos.map(d => {
    const combinedText = `${d.headline} ${d.summary}`;
    const source = createSource({ name: d.sourceName, url: d.url, tier: d.tier, publishedAt: d.publishedAt });
    const geo = geolocateEvent(combinedText, d.sourceName);
    const category = classifyCategory(combinedText);
    const tags = extractTags(combinedText);
    const severity = classifySeverity(combinedText, 1, geo.crossRegionFlag);

    return createEvent({
      headline: d.headline,
      executiveSummary: d.summary,
      severity,
      confidence: classifyConfidence([source]),
      publishedAt: d.publishedAt,
      sources: [source],
      primaryCountry: geo.primaryCountry,
      secondaryCountries: geo.secondaryCountries,
      primaryRegion: geo.primaryRegion || '',
      secondaryRegions: geo.secondaryRegions,
      crossRegionFlag: geo.crossRegionFlag,
      coordinates: geo.coordinates,
      locationConfidence: geo.locationConfidence,
      category,
      subcategoryTags: tags,
    });
  });
}

// ---- Main Ingestion Pipeline ----------------------------------------------

/**
 * Fetch, classify, geolocate, cluster, deduplicate, and archive events.
 * Returns the deduplicated event list for display.
 */
export async function ingestAll() {
  let rawEvents = [];

  // 1. Try worker first
  const workerData = await fetchFromWorker();
  if (workerData) {
    console.info(`[ingestion] Worker returned ${workerData.items.length} items`);
    rawEvents = enrichWorkerItems(workerData);
  } else {
    // 2. Fallback to direct feed fetching via CORS proxies
    const results = await Promise.allSettled(
      ACTIVE_FEEDS.map(feed => fetchAndEnrichFeed(feed))
    );
    rawEvents = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  // 3. If nothing came through, use demo data
  if (rawEvents.length === 0) {
    console.warn('[ingestion] All feeds failed. Using demo data.');
    rawEvents = generateDemoData();
  }

  // 4. Cluster related events
  const clustered = clusterEvents(rawEvents);

  // 5. Deduplicate: one representative per cluster
  const deduplicated = deduplicateClusters(clustered);

  // 6. Store to archive (async, don't block UI)
  storeEvents(deduplicated).catch(err =>
    console.warn('[ingestion] Archive write failed:', err.message)
  );

  console.info(`[ingestion] ${rawEvents.length} raw -> ${deduplicated.length} events after clustering`);

  return deduplicated;
}

// ---- Exports for backward compatibility -----------------------------------

export const CATEGORIES_COMPAT = [
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

export const REGIONS_COMPAT = [
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
