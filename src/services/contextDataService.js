// ---------------------------------------------------------------------------
// contextDataService.js — Contextual data fetcher
// Takes an event, matches indicators, fetches data from open APIs in parallel.
// Returns chart-ready time series with caching.
// ---------------------------------------------------------------------------

import { matchIndicators, extractCountryCode, searchIndicators } from './indicatorCatalog';
import { fetchWorldBank, fetchFRED, fetchOWID } from './dataApis';

// ---- In-memory cache --------------------------------------------------------

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(itemId) {
  return `ctx:${itemId}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry;
}

// ---- OWID data cache (large files, cache separately) ------------------------

const owidCache = new Map();

async function getOWIDData(dataset) {
  if (owidCache.has(dataset)) return owidCache.get(dataset);
  try {
    const data = await fetchOWID(dataset);
    if (data) owidCache.set(dataset, data);
    return data;
  } catch {
    return null;
  }
}

// ---- Data fetchers per source -----------------------------------------------

async function fetchWorldBankIndicator(indicator, countryCode) {
  try {
    const data = await fetchWorldBank(indicator.fetchKey, countryCode, '2010:2025');
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // World Bank returns newest first; sort by year ascending
    const sorted = data
      .filter(d => d.value !== null && d.value !== undefined)
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    if (sorted.length === 0) return null;

    return {
      id: indicator.id,
      name: indicator.name,
      source: 'World Bank',
      unit: indicator.unit,
      chartType: indicator.chartType,
      country: sorted[0].country || countryCode,
      data: sorted.map(d => ({
        date: d.year,
        value: typeof d.value === 'number' ? d.value : parseFloat(d.value),
      })),
      latestValue: sorted[sorted.length - 1].value,
      latestDate: sorted[sorted.length - 1].year,
    };
  } catch {
    return null;
  }
}

async function fetchFREDIndicator(indicator) {
  try {
    const data = await fetchFRED(indicator.fetchKey, 60);
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // FRED returns newest first; reverse for charts
    const sorted = [...data].reverse();

    return {
      id: indicator.id,
      name: indicator.name,
      source: 'FRED',
      unit: indicator.unit,
      chartType: indicator.chartType,
      data: sorted.map(d => ({
        date: d.date,
        value: d.value,
      })),
      latestValue: data[0].value,
      latestDate: data[0].date,
    };
  } catch {
    return null;
  }
}

async function fetchOWIDIndicator(indicator, countryName) {
  try {
    const dataset = await getOWIDData(indicator.fetchKey);
    if (!dataset) return null;

    // OWID data is keyed by country name
    // Try exact match first, then fuzzy
    let countryData = null;
    const nameVariants = [
      countryName,
      countryName?.charAt(0).toUpperCase() + countryName?.slice(1),
    ];

    for (const name of nameVariants) {
      if (dataset[name]) {
        countryData = dataset[name];
        break;
      }
    }

    // Try common name mappings
    if (!countryData) {
      const OWID_NAME_MAP = {
        'US': 'United States', 'GB': 'United Kingdom', 'CN': 'China',
        'JP': 'Japan', 'DE': 'Germany', 'FR': 'France', 'IN': 'India',
        'BR': 'Brazil', 'KR': 'South Korea', 'SA': 'Saudi Arabia',
        'AE': 'United Arab Emirates', 'ZA': 'South Africa', 'RU': 'Russia',
        'WLD': 'World',
      };
      for (const [, name] of Object.entries(OWID_NAME_MAP)) {
        if (dataset[name]) {
          countryData = dataset[name];
          break;
        }
      }
    }

    if (!countryData) return null;

    // OWID data has { data: [{ year, co2, gdp_per_capita, ... }] }
    const field = indicator.dataField;
    const yearData = (countryData.data || [])
      .filter(d => d.year >= 2000 && d[field] !== null && d[field] !== undefined)
      .map(d => ({
        date: String(d.year),
        value: d[field],
      }));

    if (yearData.length === 0) return null;

    return {
      id: indicator.id,
      name: indicator.name,
      source: 'Our World in Data',
      unit: indicator.unit,
      chartType: indicator.chartType,
      data: yearData,
      latestValue: yearData[yearData.length - 1].value,
      latestDate: yearData[yearData.length - 1].date,
    };
  } catch {
    return null;
  }
}

// ---- Main fetch function ----------------------------------------------------

/**
 * Fetch contextual data for an event item.
 * Matches indicators, fetches in parallel, returns chart-ready results.
 *
 * @param {object} item - Event with headline, summary, category, region, keywords
 * @param {object} options - { maxIndicators, forceRefresh }
 * @returns {Promise<object>} { indicators: [...], fetchedAt, matchedCount }
 */
export async function fetchContextData(item, options = {}) {
  const { maxIndicators = 8, forceRefresh = false } = options;

  if (!item) return { indicators: [], fetchedAt: null, matchedCount: 0 };

  // Check cache
  const cacheKey = getCacheKey(item.id);
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  // Match indicators
  const matched = matchIndicators(item, maxIndicators);
  if (matched.length === 0) {
    return { indicators: [], fetchedAt: Date.now(), matchedCount: 0 };
  }

  // Extract country context
  const searchText = `${item.headline || ''} ${item.summary || ''}`;
  const countryCode = extractCountryCode(searchText, item.region);

  // Fetch all indicators in parallel
  const fetchPromises = matched.map(indicator => {
    switch (indicator.source) {
      case 'worldbank':
        return fetchWorldBankIndicator(indicator, countryCode);
      case 'fred':
        return fetchFREDIndicator(indicator);
      case 'owid':
        return fetchOWIDIndicator(indicator, countryCode);
      default:
        return Promise.resolve(null);
    }
  });

  const results = await Promise.all(fetchPromises);

  // Filter out nulls (failed fetches)
  const indicators = results.filter(Boolean);

  const result = {
    indicators,
    fetchedAt: Date.now(),
    matchedCount: matched.length,
    countryCode,
  };

  // Cache the result
  cache.set(cacheKey, result);

  return result;
}

/**
 * Fetch a single indicator by ID (for manual indicator browser).
 */
export async function fetchSingleIndicator(indicatorDef, countryCodeOrItem) {
  const countryCode = typeof countryCodeOrItem === 'string'
    ? countryCodeOrItem
    : extractCountryCode(
        `${countryCodeOrItem?.headline || ''} ${countryCodeOrItem?.summary || ''}`,
        countryCodeOrItem?.region
      );

  switch (indicatorDef.source) {
    case 'worldbank':
      return fetchWorldBankIndicator(indicatorDef, countryCode);
    case 'fred':
      return fetchFREDIndicator(indicatorDef);
    case 'owid':
      return fetchOWIDIndicator(indicatorDef, countryCode);
    default:
      return null;
  }
}

/**
 * Search and fetch indicators by query string.
 */
export async function searchAndFetch(query, countryCode = 'WLD', maxResults = 5) {
  const matches = searchIndicators(query, maxResults);
  if (matches.length === 0) return [];

  const results = await Promise.all(
    matches.map(ind => {
      switch (ind.source) {
        case 'worldbank':
          return fetchWorldBankIndicator(ind, countryCode);
        case 'fred':
          return fetchFREDIndicator(ind);
        case 'owid':
          return fetchOWIDIndicator(ind, countryCode);
        default:
          return Promise.resolve(null);
      }
    })
  );

  return results.filter(Boolean);
}

/**
 * Clear cache (for testing or forced refresh).
 */
export function clearCache() {
  cache.clear();
  owidCache.clear();
}

/**
 * Extract top data points for content enrichment.
 * Returns the N most relevant data citations from fetched indicators.
 */
export function extractDataCitations(contextData, maxCitations = 4) {
  if (!contextData?.indicators?.length) return [];

  return contextData.indicators
    .filter(ind => ind.latestValue !== null && ind.latestValue !== undefined)
    .slice(0, maxCitations)
    .map(ind => {
      let formattedValue;
      const val = ind.latestValue;

      if (Math.abs(val) >= 1e12) {
        formattedValue = `$${(val / 1e12).toFixed(1)}T`;
      } else if (Math.abs(val) >= 1e9) {
        formattedValue = `$${(val / 1e9).toFixed(1)}B`;
      } else if (Math.abs(val) >= 1e6) {
        formattedValue = `${(val / 1e6).toFixed(1)}M`;
      } else if (Math.abs(val) >= 1e3) {
        formattedValue = `${(val / 1e3).toFixed(1)}K`;
      } else if (Number.isInteger(val)) {
        formattedValue = val.toLocaleString();
      } else {
        formattedValue = val.toFixed(1);
      }

      // Add unit suffix
      if (ind.unit === '%') {
        formattedValue = `${val.toFixed(1)}%`;
      } else if (ind.unit && !formattedValue.startsWith('$')) {
        formattedValue = `${formattedValue} ${ind.unit}`;
      }

      return {
        name: ind.name,
        value: formattedValue,
        rawValue: val,
        date: ind.latestDate,
        source: ind.source,
        country: ind.country,
      };
    });
}
