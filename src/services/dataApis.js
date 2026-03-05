// ---------------------------------------------------------------------------
// dataApis.js — Comprehensive macro/market/news API integrations
// Free-tier APIs for economic data, market prices, and news sentiment.
// ---------------------------------------------------------------------------

// ---- API Keys (set in .env) -----------------------------------------------
// Most have free tiers. Set keys in .env file, app works without them (graceful fallback).

const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY || '';
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || '';
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY || '';
const TWELVE_DATA_KEY = import.meta.env.VITE_TWELVE_DATA_KEY || '';
const MARKETAUX_KEY = import.meta.env.VITE_MARKETAUX_KEY || '';
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || '';

// ---- Helpers --------------------------------------------------------------

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeout || 15000),
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function safeCall(fn, label) {
  return fn().catch((err) => {
    console.warn(`[dataApis] ${label}: ${err.message}`);
    return null;
  });
}

// ===========================================================================
// 1. GLOBAL MACRO & DEVELOPMENT DATA
// ===========================================================================

/**
 * World Bank Open Data API
 * No key required. Returns country-level macro indicators.
 * @param {string} indicator - e.g., 'NY.GDP.MKTP.CD' (GDP), 'FP.CPI.TOTL.ZG' (CPI)
 * @param {string} country - ISO2 code or 'all'
 * @param {string} dateRange - e.g., '2020:2025'
 */
export async function fetchWorldBank(indicator, country = 'all', dateRange = '2020:2025') {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${dateRange}&format=json&per_page=500`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || data.length < 2) return [];
  return data[1]?.map((d) => ({
    country: d.country?.value,
    countryCode: d.countryiso3code,
    year: d.date,
    value: d.value,
    indicator: d.indicator?.value,
  })).filter((d) => d.value !== null) || [];
}

// Common World Bank indicators
export const WB_INDICATORS = {
  GDP: 'NY.GDP.MKTP.CD',
  GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',
  CPI_INFLATION: 'FP.CPI.TOTL.ZG',
  TRADE_PCT_GDP: 'NE.TRD.GNFS.ZS',
  CURRENT_ACCOUNT: 'BN.CAB.XOKA.CD',
  FDI_INFLOWS: 'BX.KLT.DINV.CD.WD',
  EXTERNAL_DEBT: 'DT.DOD.DECT.CD',
  RESERVES: 'FI.RES.TOTL.CD',
  UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',
  POPULATION: 'SP.POP.TOTL',
  ENERGY_USE: 'EG.USE.PCAP.KG.OE',
  CO2_EMISSIONS: 'EN.ATM.CO2E.PC',
};

/**
 * FRED (Federal Reserve Economic Data)
 * Free API key required (https://fred.stlouisfed.org/docs/api/)
 * @param {string} seriesId - e.g., 'FEDFUNDS', 'CPIAUCSL', 'DGS10'
 * @param {number} limit - number of recent observations
 */
export async function fetchFRED(seriesId, limit = 100) {
  if (!FRED_API_KEY) return null;
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
  const data = await fetchJson(url);
  return data.observations?.map((o) => ({
    date: o.date,
    value: o.value === '.' ? null : parseFloat(o.value),
    seriesId,
  })).filter((d) => d.value !== null) || [];
}

// Common FRED series
export const FRED_SERIES = {
  FED_FUNDS: 'FEDFUNDS',
  CPI: 'CPIAUCSL',
  CORE_CPI: 'CPILFESL',
  TEN_YEAR_YIELD: 'DGS10',
  TWO_YEAR_YIELD: 'DGS2',
  DOLLAR_INDEX: 'DTWEXBGS',
  UNEMPLOYMENT: 'UNRATE',
  GDP_GROWTH: 'A191RL1Q225SBEA',
  SP500: 'SP500',
  VIX: 'VIXCLS',
  OIL_WTI: 'DCOILWTICO',
  GOLD: 'GOLDAMGBD228NLBM',
  M2_MONEY: 'M2SL',
  BREAKEVEN_5Y: 'T5YIE',
  YIELD_SPREAD_10Y2Y: 'T10Y2Y',
};

/**
 * DB.nomics — Aggregator of public statistical agencies
 * No key required.
 * @param {string} provider - e.g., 'IMF', 'OECD', 'Eurostat'
 * @param {string} dataset - e.g., 'WEO:2024-04'
 * @param {string} series - e.g., 'USA.NGDP_RPCH'
 */
export async function fetchDBnomics(provider, dataset, series) {
  const url = `https://api.db.nomics.world/v22/series/${provider}/${dataset}/${series}?observations=1`;
  const data = await fetchJson(url);
  const seriesData = data.series?.docs?.[0];
  if (!seriesData) return null;
  return {
    name: seriesData.series_name,
    provider,
    periods: seriesData.period,
    values: seriesData.value,
  };
}

/**
 * Our World in Data — CSV/JSON datasets
 * No key required. Fetches from GitHub-hosted datasets.
 * @param {string} dataset - e.g., 'co2', 'energy', 'gdp'
 */
export async function fetchOWID(dataset) {
  const OWID_DATASETS = {
    co2: 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json',
    energy: 'https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.json',
    covid: 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json',
  };
  const url = OWID_DATASETS[dataset];
  if (!url) return null;
  return fetchJson(url, { timeout: 30000 });
}

// ===========================================================================
// 2. MARKET PRICES, FUNDAMENTALS & TECHNICALS
// ===========================================================================

/**
 * Alpha Vantage — Stocks, FX, crypto, economic indicators
 * Free key: 25 requests/day (https://www.alphavantage.co/support/)
 */
export async function fetchAlphaVantage(fn, params = {}) {
  if (!ALPHA_VANTAGE_KEY) return null;
  const query = new URLSearchParams({ function: fn, apikey: ALPHA_VANTAGE_KEY, ...params });
  const url = `https://www.alphavantage.co/query?${query}`;
  return fetchJson(url);
}

// Alpha Vantage convenience functions
export async function fetchForexRate(from, to) {
  return fetchAlphaVantage('CURRENCY_EXCHANGE_RATE', { from_currency: from, to_currency: to });
}

export async function fetchCryptoPrice(symbol, market = 'USD') {
  return fetchAlphaVantage('CURRENCY_EXCHANGE_RATE', { from_currency: symbol, to_currency: market });
}

export async function fetchEconomicIndicator(indicator) {
  // indicator: 'REAL_GDP', 'CPI', 'INFLATION', 'UNEMPLOYMENT', 'FEDERAL_FUNDS_RATE', etc.
  return fetchAlphaVantage(indicator);
}

/**
 * Finnhub — Real-time stock/FX, economic calendar, sentiment
 * Free tier: 60 requests/min (https://finnhub.io/)
 */
export async function fetchFinnhub(endpoint, params = {}) {
  if (!FINNHUB_KEY) return null;
  const query = new URLSearchParams({ token: FINNHUB_KEY, ...params });
  const url = `https://finnhub.io/api/v1/${endpoint}?${query}`;
  return fetchJson(url);
}

export async function fetchEconomicCalendar() {
  const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const to = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  return fetchFinnhub('calendar/economic', { from, to });
}

export async function fetchMarketNews(category = 'general') {
  // category: 'general', 'forex', 'crypto', 'merger'
  return fetchFinnhub('news', { category });
}

export async function fetchStockQuote(symbol) {
  return fetchFinnhub('quote', { symbol });
}

/**
 * Twelve Data — Stocks, FX, crypto, commodities, technicals
 * Free tier: 800 requests/day (https://twelvedata.com/)
 */
export async function fetchTwelveData(endpoint, params = {}) {
  if (!TWELVE_DATA_KEY) return null;
  const query = new URLSearchParams({ apikey: TWELVE_DATA_KEY, ...params });
  const url = `https://api.twelvedata.com/${endpoint}?${query}`;
  return fetchJson(url);
}

export async function fetchTimeSeriesPrice(symbol, interval = '1day', outputsize = 30) {
  return fetchTwelveData('time_series', { symbol, interval, outputsize });
}

export async function fetchRealTimePrice(symbol) {
  return fetchTwelveData('price', { symbol });
}

// ===========================================================================
// 3. NEWS, SENTIMENT & EVENT CALENDARS
// ===========================================================================

/**
 * Marketaux — Financial news + sentiment
 * Free tier: 100 requests/day (https://www.marketaux.com/)
 */
export async function fetchMarketaux(params = {}) {
  if (!MARKETAUX_KEY) return null;
  const query = new URLSearchParams({
    api_token: MARKETAUX_KEY,
    language: 'en',
    limit: 50,
    ...params,
  });
  const url = `https://api.marketaux.com/v1/news/all?${query}`;
  const data = await fetchJson(url);
  return data.data?.map((item) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    source: item.source,
    publishedAt: item.published_at,
    sentiment: item.entities?.[0]?.sentiment_score || null,
    tickers: item.entities?.map((e) => e.symbol).filter(Boolean) || [],
  })) || [];
}

/**
 * NewsAPI — General news (can filter for business/economy)
 * Free tier: 100 requests/day, 1 month of articles (https://newsapi.org/)
 */
export async function fetchNewsAPI(query = 'global economy', pageSize = 20) {
  if (!NEWSAPI_KEY) return null;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
  const data = await fetchJson(url);
  return data.articles?.map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt,
    imageUrl: a.urlToImage,
  })) || [];
}

// ===========================================================================
// 4. AGGREGATED FETCH — Get everything in parallel
// ===========================================================================

/**
 * Fetch a comprehensive macro snapshot.
 * Returns whatever APIs are configured (gracefully skips unconfigured ones).
 */
export async function fetchMacroSnapshot() {
  const [
    worldBankGDP,
    fredFunds,
    fredCPI,
    fredVix,
    fredOil,
    fredGold,
    fredYieldSpread,
    finnhubCalendar,
    finnhubNews,
    marketauxNews,
  ] = await Promise.all([
    safeCall(() => fetchWorldBank(WB_INDICATORS.GDP_GROWTH, 'all', '2023:2025'), 'WorldBank GDP'),
    safeCall(() => fetchFRED(FRED_SERIES.FED_FUNDS, 10), 'FRED Funds'),
    safeCall(() => fetchFRED(FRED_SERIES.CPI, 12), 'FRED CPI'),
    safeCall(() => fetchFRED(FRED_SERIES.VIX, 30), 'FRED VIX'),
    safeCall(() => fetchFRED(FRED_SERIES.OIL_WTI, 30), 'FRED Oil'),
    safeCall(() => fetchFRED(FRED_SERIES.GOLD, 30), 'FRED Gold'),
    safeCall(() => fetchFRED(FRED_SERIES.YIELD_SPREAD_10Y2Y, 30), 'FRED Yield Spread'),
    safeCall(() => fetchEconomicCalendar(), 'Finnhub Calendar'),
    safeCall(() => fetchMarketNews(), 'Finnhub News'),
    safeCall(() => fetchMarketaux(), 'Marketaux News'),
  ]);

  return {
    macro: {
      worldBankGDP,
      fedFundsRate: fredFunds,
      cpi: fredCPI,
      vix: fredVix,
      oilWTI: fredOil,
      gold: fredGold,
      yieldSpread: fredYieldSpread,
    },
    calendar: finnhubCalendar,
    news: {
      finnhub: finnhubNews,
      marketaux: marketauxNews,
    },
    fetchedAt: new Date().toISOString(),
  };
}

// ===========================================================================
// 5. API CATALOG — Reference for all available integrations
// ===========================================================================

export const API_CATALOG = {
  // No key required
  worldBank: { name: 'World Bank Open Data', keyRequired: false, rateLimit: 'Generous', url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392' },
  dbNomics: { name: 'DB.nomics', keyRequired: false, rateLimit: 'Generous', url: 'https://db.nomics.world/docs/api/' },
  owid: { name: 'Our World in Data', keyRequired: false, rateLimit: 'None (static files)', url: 'https://github.com/owid' },
  eurostat: { name: 'Eurostat', keyRequired: false, rateLimit: 'Generous', url: 'https://ec.europa.eu/eurostat/web/json-and-unicode-web-services' },
  imf: { name: 'IMF Data API', keyRequired: false, rateLimit: 'Generous', url: 'https://datahelp.imf.org/knowledgebase/articles/667681' },
  faostat: { name: 'FAOSTAT', keyRequired: false, rateLimit: 'Generous', url: 'https://www.fao.org/faostat/en/#data' },

  // Free key required
  fred: { name: 'FRED', keyRequired: true, rateLimit: '120 req/min', url: 'https://fred.stlouisfed.org/docs/api/api_key.html' },
  alphaVantage: { name: 'Alpha Vantage', keyRequired: true, rateLimit: '25 req/day (free)', url: 'https://www.alphavantage.co/support/' },
  finnhub: { name: 'Finnhub', keyRequired: true, rateLimit: '60 req/min', url: 'https://finnhub.io/' },
  twelveData: { name: 'Twelve Data', keyRequired: true, rateLimit: '800 req/day', url: 'https://twelvedata.com/' },
  marketaux: { name: 'Marketaux', keyRequired: true, rateLimit: '100 req/day', url: 'https://www.marketaux.com/' },
  newsapi: { name: 'NewsAPI', keyRequired: true, rateLimit: '100 req/day', url: 'https://newsapi.org/' },
  tradingEconomics: { name: 'Trading Economics', keyRequired: true, rateLimit: 'Limited free tier', url: 'https://tradingeconomics.com/api/' },
  marketstack: { name: 'Marketstack', keyRequired: true, rateLimit: '100 req/month (free)', url: 'https://marketstack.com/' },
  tiingo: { name: 'Tiingo', keyRequired: true, rateLimit: 'Free tier available', url: 'https://api.tiingo.com/' },
};
