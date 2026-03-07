// ---------------------------------------------------------------------------
// tradeApis.js — Trade data API integrations
// World Bank WITS, UK Trade Tariff, UN Comtrade
// All public APIs, no keys required.
// ---------------------------------------------------------------------------

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeout || 20000),
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchXml(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeout || 20000),
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

// CORS proxy for APIs that don't allow browser requests
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
];

async function fetchWithProxy(url, options = {}) {
  // Try direct first
  try {
    return await fetchJson(url, options);
  } catch {
    // Fallback to proxy
    for (const proxy of CORS_PROXIES) {
      try {
        return await fetchJson(`${proxy}${encodeURIComponent(url)}`, options);
      } catch { continue; }
    }
    throw new Error(`All fetch attempts failed for ${url}`);
  }
}

// ===========================================================================
// 1. WORLD BANK WITS (World Integrated Trade Solution)
// https://wits.worldbank.org/API/V1
// ===========================================================================

const WITS_BASE = 'https://wits.worldbank.org/API/V1';

// Country ISO3 codes for WITS
const COUNTRY_ISO3 = {
  'United States': 'USA', 'China': 'CHN', 'Japan': 'JPN',
  'Germany': 'DEU', 'United Kingdom': 'GBR', 'India': 'IND',
  'Russia': 'RUS', 'Brazil': 'BRA', 'Turkey': 'TUR',
  'Nigeria': 'NGA', 'France': 'FRA', 'Iran': 'IRN',
  'Vietnam': 'VNM', 'South Korea': 'KOR', 'Saudi Arabia': 'SAU',
  'Mexico': 'MEX', 'Indonesia': 'IDN', 'Canada': 'CAN',
  'Australia': 'AUS', 'Italy': 'ITA', 'South Africa': 'ZAF',
  'Argentina': 'ARG',
};

/**
 * Fetch tariff data from WITS for a country.
 * Returns weighted average applied tariff rates.
 * @param {string} countryName - e.g., 'United States'
 * @param {string} year - e.g., '2022'
 */
export async function fetchWitsTariff(countryName, year = '2022') {
  const iso3 = COUNTRY_ISO3[countryName];
  if (!iso3) return null;
  const url = `${WITS_BASE}/wits/datasource/trn/country/${iso3}/indicator/AHS-WGTD-AVRG/partner/WLD/product/Total/year/${year}`;
  try {
    const text = await fetchXml(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
    // Parse XML response — extract value
    const match = text.match(/<Value>([\d.]+)<\/Value>/);
    return match ? { country: countryName, year, averageTariff: parseFloat(match[1]), source: 'WITS/World Bank' } : null;
  } catch (err) {
    console.warn(`[tradeApis] WITS tariff for ${countryName}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch trade summary data from WITS.
 * @param {string} countryName
 * @param {string} year
 */
export async function fetchWitsTradeProfile(countryName, year = '2022') {
  const iso3 = COUNTRY_ISO3[countryName];
  if (!iso3) return null;
  try {
    const url = `${WITS_BASE}/wits/datasource/tradestats-trade/country/${iso3}/indicator/XPRT-TRD-VL/partner/WLD/product/Total/year/${year}`;
    const text = await fetchXml(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
    const exportMatch = text.match(/<Value>([\d.E+]+)<\/Value>/);
    const exports = exportMatch ? parseFloat(exportMatch[1]) : null;

    const url2 = `${WITS_BASE}/wits/datasource/tradestats-trade/country/${iso3}/indicator/MPRT-TRD-VL/partner/WLD/product/Total/year/${year}`;
    const text2 = await fetchXml(`https://corsproxy.io/?url=${encodeURIComponent(url2)}`);
    const importMatch = text2.match(/<Value>([\d.E+]+)<\/Value>/);
    const imports = importMatch ? parseFloat(importMatch[1]) : null;

    return {
      country: countryName,
      year,
      totalExports: exports,
      totalImports: imports,
      tradeBalance: exports && imports ? exports - imports : null,
      source: 'WITS/World Bank',
    };
  } catch (err) {
    console.warn(`[tradeApis] WITS trade profile for ${countryName}: ${err.message}`);
    return null;
  }
}

// ===========================================================================
// 2. UK TRADE TARIFF API
// https://www.trade-tariff.service.gov.uk/uk/api
// ===========================================================================

const UK_TARIFF_BASE = 'https://www.trade-tariff.service.gov.uk';

/**
 * Search UK trade tariff headings.
 * @param {string} query - e.g., 'steel', 'semiconductors', 'wheat'
 */
export async function searchUkTariff(query) {
  try {
    const url = `${UK_TARIFF_BASE}/api/v2/search?q=${encodeURIComponent(query)}`;
    const data = await fetchWithProxy(url);
    return {
      query,
      results: (data.data || []).slice(0, 20).map(item => ({
        id: item.id,
        type: item.type,
        description: item.attributes?.description || item.attributes?.formatted_description || '',
        goodsNomenclatureItemId: item.attributes?.goods_nomenclature_item_id || '',
      })),
      source: 'UK Trade Tariff Service',
    };
  } catch (err) {
    console.warn(`[tradeApis] UK Tariff search: ${err.message}`);
    return { query, results: [], source: 'UK Trade Tariff Service' };
  }
}

/**
 * Get details for a specific commodity code.
 * @param {string} commodityCode - e.g., '0101210000'
 */
export async function fetchUkTariffCommodity(commodityCode) {
  try {
    const url = `${UK_TARIFF_BASE}/api/v2/commodities/${commodityCode}`;
    const data = await fetchWithProxy(url);
    const attrs = data.data?.attributes || {};
    return {
      code: commodityCode,
      description: attrs.description || attrs.formatted_description || '',
      dutyRate: attrs.basic_duty_rate || null,
      meursing: attrs.meursing_code || false,
      source: 'UK Trade Tariff Service',
    };
  } catch (err) {
    console.warn(`[tradeApis] UK Tariff commodity ${commodityCode}: ${err.message}`);
    return null;
  }
}

// ===========================================================================
// 3. UN COMTRADE API
// https://comtradeapi.un.org/public/v1
// ===========================================================================

const COMTRADE_BASE = 'https://comtradeapi.un.org/public/v1';

/**
 * Get latest Comtrade data releases.
 * Shows which countries have recently published trade data.
 */
export async function fetchComtradeReleases() {
  try {
    const data = await fetchWithProxy(`${COMTRADE_BASE}/getComtradeReleases`);
    return {
      releases: (data || []).slice(0, 50).map(r => ({
        country: r.reporterDesc || r.reporter,
        reporterCode: r.reporterCode,
        year: r.period,
        flowDesc: r.flowDesc || r.flowCode,
        releaseDate: r.releaseDate,
        totalRecords: r.totalRecords,
      })),
      source: 'UN Comtrade',
    };
  } catch (err) {
    console.warn(`[tradeApis] Comtrade releases: ${err.message}`);
    return { releases: [], source: 'UN Comtrade' };
  }
}

/**
 * Get trade data for a specific country from Comtrade.
 * @param {string} reporterCode - UN M49 code (e.g., '840' for US)
 * @param {string} period - year, e.g., '2023'
 */
export async function fetchComtradeTrade(reporterCode, period = '2023') {
  try {
    const url = `${COMTRADE_BASE}/get/C/A/HS?reporterCode=${reporterCode}&period=${period}&partnerCode=0&flowCode=M,X&cmdCode=TOTAL`;
    const data = await fetchWithProxy(url);
    return {
      records: (data.data || []).map(r => ({
        reporter: r.reporterDesc,
        partner: r.partnerDesc,
        flow: r.flowDesc,
        value: r.primaryValue,
        year: r.period,
        commodity: r.cmdDesc,
      })),
      source: 'UN Comtrade',
    };
  } catch (err) {
    console.warn(`[tradeApis] Comtrade trade data: ${err.message}`);
    return { records: [], source: 'UN Comtrade' };
  }
}

// Country name to UN M49 code mapping
export const COUNTRY_M49 = {
  'United States': '840', 'China': '156', 'Japan': '392',
  'Germany': '276', 'United Kingdom': '826', 'India': '356',
  'Russia': '643', 'Brazil': '076', 'Turkey': '792',
  'Nigeria': '566', 'France': '250', 'Iran': '364',
  'Vietnam': '704', 'South Korea': '410', 'Saudi Arabia': '682',
};

// ===========================================================================
// 4. ALPHA VANTAGE LIVE MARKET DATA
// Uses the key from .env (VITE_ALPHA_VANTAGE_KEY)
// ===========================================================================

const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || '';
const AV_BASE = 'https://www.alphavantage.co/query';

/**
 * Fetch real-time forex exchange rate.
 * @param {string} from - e.g., 'USD'
 * @param {string} to - e.g., 'EUR'
 */
export async function fetchLiveForex(from, to) {
  if (!AV_KEY) return null;
  try {
    const url = `${AV_BASE}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`;
    const data = await fetchJson(url);
    const rate = data['Realtime Currency Exchange Rate'];
    if (!rate) return null;
    return {
      pair: `${from}/${to}`,
      rate: parseFloat(rate['5. Exchange Rate']),
      bidPrice: parseFloat(rate['8. Bid Price']),
      askPrice: parseFloat(rate['9. Ask Price']),
      lastRefreshed: rate['6. Last Refreshed'],
      source: 'Alpha Vantage',
    };
  } catch (err) {
    console.warn(`[tradeApis] AV forex ${from}/${to}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch stock/index quote from Alpha Vantage.
 * @param {string} symbol - e.g., 'SPY', 'AAPL'
 */
export async function fetchLiveQuote(symbol) {
  if (!AV_KEY) return null;
  try {
    const url = `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`;
    const data = await fetchJson(url);
    const q = data['Global Quote'];
    if (!q) return null;
    return {
      symbol: q['01. symbol'],
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePercent: q['10. change percent'],
      volume: parseInt(q['06. volume']),
      latestDay: q['07. latest trading day'],
      source: 'Alpha Vantage',
    };
  } catch (err) {
    console.warn(`[tradeApis] AV quote ${symbol}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch all live market data in one batch.
 * Staggers requests to respect Alpha Vantage rate limit (5/min on free tier).
 */
export async function fetchLiveMarketBatch() {
  if (!AV_KEY) return null;

  const forexPairs = [
    ['USD', 'EUR'], ['USD', 'JPY'], ['GBP', 'USD'],
    ['USD', 'CNY'], ['USD', 'INR'],
  ];

  const quotes = ['SPY', 'EFA', 'GLD', 'USO'];

  const results = { forex: [], equities: [], fetchedAt: new Date().toISOString() };

  // Fetch forex (one at a time to avoid rate limits)
  for (const [from, to] of forexPairs) {
    const rate = await fetchLiveForex(from, to);
    if (rate) results.forex.push(rate);
    // Alpha Vantage free tier: 5 calls/min — small delay between calls
    await new Promise(r => setTimeout(r, 1500));
  }

  // Fetch equity/ETF quotes
  for (const symbol of quotes) {
    const quote = await fetchLiveQuote(symbol);
    if (quote) results.equities.push(quote);
    await new Promise(r => setTimeout(r, 1500));
  }

  return results;
}

// ===========================================================================
// 5. AGGREGATED TRADE DASHBOARD DATA
// ===========================================================================

/**
 * Fetch all trade data for the Trade & Data section.
 * Runs all APIs in parallel where possible.
 */
export async function fetchTradeSnapshot() {
  const [comtradeReleases, ukTariffSteel, ukTariffSemiconductors] = await Promise.all([
    fetchComtradeReleases().catch(() => ({ releases: [], source: 'UN Comtrade' })),
    searchUkTariff('steel').catch(() => ({ query: 'steel', results: [], source: 'UK Trade Tariff' })),
    searchUkTariff('semiconductors').catch(() => ({ query: 'semiconductors', results: [], source: 'UK Trade Tariff' })),
  ]);

  return {
    comtradeReleases,
    ukTariffSamples: { steel: ukTariffSteel, semiconductors: ukTariffSemiconductors },
    fetchedAt: new Date().toISOString(),
  };
}
