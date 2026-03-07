// ---------------------------------------------------------------------------
// sourceRegistry.js — Expanded source registry for Macro Intel
// 30+ feeds across 4 tiers: Official, Reputable, Discovery, Market
// ---------------------------------------------------------------------------

import { SOURCE_TIERS } from './eventModel.js';

// ---- Tier 1: Official / Primary Sources -----------------------------------

const TIER_1_FEEDS = [
  {
    name: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'North America',
    defaultCategory: 'Central Banks & Monetary Policy',
    pollMinutes: 15,
  },
  {
    name: 'ECB',
    url: 'https://www.ecb.europa.eu/rss/press.html',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Europe',
    defaultCategory: 'Central Banks & Monetary Policy',
    pollMinutes: 15,
  },
  {
    name: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/rss/news',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Europe',
    defaultCategory: 'Central Banks & Monetary Policy',
    pollMinutes: 15,
  },
  {
    name: 'IMF',
    url: 'https://www.imf.org/en/News/rss',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Global Maritime / Strategic Waterways',
    defaultCategory: 'Institutional Research / Reports',
    pollMinutes: 15,
  },
  {
    name: 'World Bank',
    url: 'https://feeds.worldbank.org/rss/topic/economy',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Global Maritime / Strategic Waterways',
    defaultCategory: 'Institutional Research / Reports',
    pollMinutes: 15,
  },
  {
    name: 'OECD',
    url: 'https://www.oecd.org/newsroom/index.xml',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Europe',
    defaultCategory: 'Institutional Research / Reports',
    pollMinutes: 15,
  },
  {
    name: 'US Treasury',
    url: 'https://home.treasury.gov/system/files/rss.xml',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'North America',
    defaultCategory: 'Government Policy & Regulation',
    pollMinutes: 15,
  },
  {
    name: 'EU Council',
    url: 'https://www.consilium.europa.eu/en/rss-feeds/',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'Europe',
    defaultCategory: 'Government Policy & Regulation',
    pollMinutes: 15,
  },
  {
    name: 'RBI',
    url: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
    tier: SOURCE_TIERS.OFFICIAL,
    region: 'South Asia',
    defaultCategory: 'Central Banks & Monetary Policy',
    pollMinutes: 15,
    note: 'May not have standard RSS — fallback to scraping needed',
  },
];

// ---- Tier 2: Reputable Reporting Sources ----------------------------------

const TIER_2_FEEDS = [
  {
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'CNBC Economy',
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'North America',
    defaultCategory: 'Markets & Financial Conditions',
    pollMinutes: 10,
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'MENA',
    defaultCategory: 'Geopolitics & Conflict',
    pollMinutes: 10,
  },
  {
    name: 'DW News',
    url: 'https://rss.dw.com/xml/rss-en-bus',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'France 24',
    url: 'https://www.france24.com/en/rss',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Geopolitics & Conflict',
    pollMinutes: 10,
  },
  {
    name: 'CNN Business',
    url: 'https://rss.cnn.com/rss/money_news_international.rss',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'North America',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'Sky News Business',
    url: 'https://feeds.skynews.com/feeds/rss/business.xml',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Markets & Financial Conditions',
    pollMinutes: 10,
  },
  {
    name: 'Reuters via Google News',
    url: 'https://news.google.com/rss/search?q=global+economy+OR+central+bank+OR+trade+tariffs+OR+sanctions+OR+energy+crisis+OR+geopolitics&hl=en-US&gl=US&ceid=US:en',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'North America',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'Bloomberg via Google News',
    url: 'https://news.google.com/rss/search?q=site:bloomberg.com+economy+OR+markets+OR+sanctions+OR+trade&hl=en-US&gl=US&ceid=US:en',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'North America',
    defaultCategory: 'Markets & Financial Conditions',
    pollMinutes: 10,
  },
  {
    name: 'WSJ via Google News',
    url: 'https://news.google.com/rss/search?q=site:wsj.com+economy+OR+markets+OR+federal+reserve+OR+trade&hl=en-US&gl=US&ceid=US:en',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'North America',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'The Economist via Google News',
    url: 'https://news.google.com/rss/search?q=site:economist.com+economy+OR+geopolitics&hl=en-US&gl=US&ceid=US:en',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
  {
    name: 'FT via Google News',
    url: 'https://news.google.com/rss/search?q=site:ft.com+economy+OR+markets+OR+central+bank&hl=en-US&gl=US&ceid=US:en',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Markets & Financial Conditions',
    pollMinutes: 10,
  },
  {
    name: 'Euronews Business',
    url: 'https://www.euronews.com/rss?level=theme&name=business',
    tier: SOURCE_TIERS.REPUTABLE,
    region: 'Europe',
    defaultCategory: 'Macroeconomics',
    pollMinutes: 10,
  },
];

// ---- Tier 3: Discovery Layer ----------------------------------------------

const TIER_3_FEEDS = [
  {
    name: 'GDELT',
    url: null,
    apiEndpoint: 'https://api.gdeltproject.org/api/v2/doc/doc',
    tier: SOURCE_TIERS.DISCOVERY,
    region: null,
    defaultCategory: null,
    pollMinutes: 10,
    note: 'Dataset required — free API, needs integration. Use for discovery only, not truth.',
    implemented: false,
  },
];

// ---- All Feeds ------------------------------------------------------------

export const ALL_FEEDS = [...TIER_1_FEEDS, ...TIER_2_FEEDS, ...TIER_3_FEEDS];

export const ACTIVE_FEEDS = ALL_FEEDS.filter(f => f.url && f.implemented !== false);

// ---- Feed lookup helpers --------------------------------------------------

export function getFeedsByTier(tier) {
  return ALL_FEEDS.filter(f => f.tier === tier);
}

export function getActiveFeedsByPollInterval(minutes) {
  return ACTIVE_FEEDS.filter(f => f.pollMinutes <= minutes);
}

// ---- Missing data report --------------------------------------------------

export function getMissingSourceReport() {
  const missing = [];

  // Tier 3 not yet implemented
  for (const feed of TIER_3_FEEDS) {
    if (!feed.implemented || !feed.url) {
      missing.push({
        source: feed.name,
        tier: feed.tier,
        reason: feed.note || 'No URL or not implemented',
        candidateEndpoint: feed.apiEndpoint || feed.url || 'unknown',
      });
    }
  }

  // Known gaps — sources we want but can't RSS
  const knownGaps = [
    { source: 'Bank of Japan', tier: 1, reason: 'No RSS feed available. Would need web scraping or API.' },
    { source: 'PBOC', tier: 1, reason: 'No English RSS feed. Would need translation + scraping.' },
    { source: 'National statistical offices', tier: 1, reason: 'Varies by country. Need per-country integration.' },
    { source: 'OFAC SDN List', tier: 1, reason: 'Sanctions list updates. Need API integration or periodic CSV download.' },
    { source: 'EU Sanctions Registry', tier: 1, reason: 'Need API integration for real-time sanctions updates.' },
  ];

  return [...missing, ...knownGaps];
}
