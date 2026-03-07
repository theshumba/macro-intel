// ---------------------------------------------------------------------------
// worldMonitorApis.js — Comprehensive world monitoring API integrations
// Ported from koala73/worldmonitor — all public/free-tier APIs
// Covers: economics, markets, geopolitics, natural disasters, cyber,
// maritime, conflict, displacement, infrastructure, research
// ---------------------------------------------------------------------------

const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
];

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeout || 15000),
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeout || 15000),
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function proxiedJson(url, options = {}) {
  for (const proxy of CORS_PROXIES) {
    try {
      return await fetchJson(`${proxy}${encodeURIComponent(url)}`, options);
    } catch { continue; }
  }
  throw new Error(`All proxies failed for ${url}`);
}

async function proxiedText(url, options = {}) {
  for (const proxy of CORS_PROXIES) {
    try {
      return await fetchText(`${proxy}${encodeURIComponent(url)}`, options);
    } catch { continue; }
  }
  throw new Error(`All proxies failed for ${url}`);
}

function safe(fn, label) {
  return fn().catch(err => {
    console.warn(`[worldMonitor] ${label}: ${err.message}`);
    return null;
  });
}

// ===========================================================================
// 1. BIS (Bank for International Settlements) — No key required
// ===========================================================================

function parseBisCsv(csv) {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]; });
    return obj;
  });
}

/** BIS Central Bank Policy Rates */
export async function fetchBisPolicyRates() {
  const url = 'https://stats.bis.org/api/v1/data/WS_CBPOL/M..?detail=dataonly&startPeriod=2023-01&format=csv';
  const csv = await proxiedText(url, { timeout: 20000 });
  const rows = parseBisCsv(csv);
  const rateMap = {};
  for (const r of rows) {
    const country = r['Reference area'] || r['REF_AREA'];
    const period = r['TIME_PERIOD'] || r['Time period'];
    const value = parseFloat(r['OBS_VALUE'] || r['Observation value']);
    if (country && !isNaN(value)) {
      if (!rateMap[country] || period > rateMap[country].period) {
        rateMap[country] = { country, rate: value, period, source: 'BIS' };
      }
    }
  }
  return Object.values(rateMap).sort((a, b) => b.rate - a.rate);
}

/** BIS Credit-to-GDP ratios */
export async function fetchBisCreditToGdp() {
  const url = 'https://stats.bis.org/api/v1/data/WS_TC/Q..A.770.USD?detail=dataonly&startPeriod=2022-Q1&format=csv';
  const csv = await proxiedText(url, { timeout: 20000 });
  const rows = parseBisCsv(csv);
  const result = {};
  for (const r of rows) {
    const country = r['Reference area'] || r['REF_AREA'];
    const value = parseFloat(r['OBS_VALUE'] || r['Observation value']);
    const period = r['TIME_PERIOD'] || r['Time period'];
    if (country && !isNaN(value)) {
      if (!result[country] || period > result[country].period) {
        result[country] = { country, creditToGdp: value, period, source: 'BIS' };
      }
    }
  }
  return Object.values(result);
}

/** BIS Real Effective Exchange Rates */
export async function fetchBisExchangeRates() {
  const url = 'https://stats.bis.org/api/v1/data/WS_EER/M.R..N?detail=dataonly&startPeriod=2024-01&format=csv';
  const csv = await proxiedText(url, { timeout: 20000 });
  const rows = parseBisCsv(csv);
  const result = {};
  for (const r of rows) {
    const country = r['Reference area'] || r['REF_AREA'];
    const value = parseFloat(r['OBS_VALUE'] || r['Observation value']);
    const period = r['TIME_PERIOD'] || r['Time period'];
    if (country && !isNaN(value)) {
      if (!result[country] || period > result[country].period) {
        result[country] = { country, reer: value, period, source: 'BIS' };
      }
    }
  }
  return Object.values(result);
}

// ===========================================================================
// 2. USGS Earthquakes — No key required
// ===========================================================================

/** Earthquakes M4.5+ in last 24 hours */
export async function fetchEarthquakes() {
  const data = await fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
  return (data.features || []).map(f => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: new Date(f.properties.time).toISOString(),
    depth: f.geometry.coordinates[2],
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    tsunami: f.properties.tsunami === 1,
    url: f.properties.url,
    source: 'USGS',
  }));
}

// ===========================================================================
// 3. NASA EONET — Natural Events — No key required
// ===========================================================================

/** Active natural events (wildfires, storms, volcanoes, etc.) */
export async function fetchNaturalEvents(days = 30) {
  const data = await fetchJson(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=${days}`);
  return (data.events || []).map(e => {
    const geo = e.geometry?.[e.geometry.length - 1];
    return {
      id: e.id,
      title: e.title,
      category: e.categories?.[0]?.title || 'Unknown',
      date: geo?.date || e.geometry?.[0]?.date,
      lat: geo?.coordinates?.[1],
      lng: geo?.coordinates?.[0],
      magnitude: geo?.magnitudeValue,
      magnitudeUnit: geo?.magnitudeUnit,
      source: 'NASA EONET',
    };
  });
}

// ===========================================================================
// 4. GDACS — Global Disaster Alerts — No key required
// ===========================================================================

/** Recent disaster alerts */
export async function fetchGdacsAlerts() {
  try {
    const text = await proxiedText('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP');
    // GDACS returns XML — parse key fields
    const events = [];
    const eventRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = eventRegex.exec(text)) !== null) {
      const block = match[1];
      const get = (tag) => { const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)); return m?.[1] || ''; };
      const getAttr = (tag, attr) => { const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`)); return m?.[1] || ''; };
      events.push({
        title: get('title'),
        description: get('description'),
        link: get('link'),
        pubDate: get('pubDate'),
        alertLevel: getAttr('gdacs:alertlevel', 'value') || get('gdacs:alertlevel'),
        eventType: get('gdacs:eventtype'),
        country: get('gdacs:country'),
        lat: parseFloat(getAttr('geo:Point', 'lat') || get('geo:lat')) || null,
        lng: parseFloat(getAttr('geo:Point', 'long') || get('geo:long')) || null,
        severity: get('gdacs:severity'),
        source: 'GDACS',
      });
    }
    return events.slice(0, 50);
  } catch (err) {
    console.warn('[worldMonitor] GDACS:', err.message);
    return [];
  }
}

// ===========================================================================
// 5. GDELT — Global Event Intelligence — No key required
// ===========================================================================

/** Search GDELT for recent articles by query */
export async function searchGdelt(query = 'geopolitics economy', maxRecords = 50) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxRecords}&format=json`;
  const data = await proxiedJson(url);
  return (data.articles || []).map(a => ({
    title: a.title,
    url: a.url,
    source: a.domain || a.sourcecountry,
    date: a.seendate,
    tone: a.tone,
    language: a.language,
    country: a.sourcecountry,
    dataSource: 'GDELT',
  }));
}

// ===========================================================================
// 6. UCDP — Armed Conflict Data — No key required
// ===========================================================================

/** Recent armed conflict events from Uppsala Conflict Data Program */
export async function fetchConflictEvents(year = 2024) {
  const data = await proxiedJson(`https://ucdpapi.pcr.uu.se/api/gedevents/24.1?pagesize=100&page=0`);
  return (data.Result || []).map(e => ({
    id: e.id,
    year: e.year,
    country: e.country,
    region: e.region,
    sideA: e.side_a,
    sideB: e.side_b,
    deaths: e.best,
    deathsLow: e.low,
    deathsHigh: e.high,
    type: e.type_of_violence === 1 ? 'State-based' : e.type_of_violence === 2 ? 'Non-state' : 'One-sided',
    lat: e.latitude,
    lng: e.longitude,
    date: e.date_start,
    source: 'UCDP',
  }));
}

// ===========================================================================
// 7. UNHCR — Displacement & Refugee Data — No key required
// ===========================================================================

/** Global refugee and displacement statistics */
export async function fetchDisplacementData(year = 2023) {
  const data = await proxiedJson(`https://api.unhcr.org/population/v1/population/?year=${year}&limit=200&page=1&coo_all=true&coa_all=true`);
  const items = data.items || [];
  // Aggregate by country of origin
  const byOrigin = {};
  for (const item of items) {
    const country = item.coo_name || item.coo;
    if (!country) continue;
    if (!byOrigin[country]) byOrigin[country] = { country, refugees: 0, asylum: 0, idps: 0, stateless: 0 };
    byOrigin[country].refugees += item.refugees || 0;
    byOrigin[country].asylum += item.asylum_seekers || 0;
    byOrigin[country].idps += item.idps || 0;
    byOrigin[country].stateless += item.stateless || 0;
  }
  return {
    year,
    countries: Object.values(byOrigin).sort((a, b) => b.refugees - a.refugees).slice(0, 30),
    source: 'UNHCR',
  };
}

// ===========================================================================
// 8. NGA Maritime Warnings — No key required
// ===========================================================================

/** Active navigational warnings from US NGA */
export async function fetchMaritimeWarnings() {
  const data = await proxiedJson('https://msi.nga.mil/api/publications/broadcast-warn?output=json&status=A');
  return (data || []).slice(0, 30).map(w => ({
    id: w.messageId || w.id,
    area: w.navArea || w.area,
    text: w.text || w.message,
    issuedDate: w.issueDate || w.date,
    authority: w.authority || 'NGA',
    source: 'NGA MSI',
  }));
}

// ===========================================================================
// 9. Crypto Markets — No key required (CoinPaprika fallback)
// ===========================================================================

/** Top cryptocurrency prices and market data */
export async function fetchCryptoMarkets() {
  // Try CoinGecko first (no key needed for basic), fallback to CoinPaprika
  try {
    const data = await fetchJson('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,ripple,solana,cardano&sparkline=true&price_change_percentage=24h,7d');
    return data.map(c => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      change7d: c.price_change_percentage_7d_in_currency,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      sparkline: c.sparkline_in_7d?.price || [],
      source: 'CoinGecko',
    }));
  } catch {
    // Fallback: CoinPaprika
    const data = await proxiedJson('https://api.coinpaprika.com/v1/tickers?quotes=USD');
    return data.slice(0, 10).map(c => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      price: c.quotes?.USD?.price,
      change24h: c.quotes?.USD?.percent_change_24h,
      change7d: c.quotes?.USD?.percent_change_7d,
      marketCap: c.quotes?.USD?.market_cap,
      volume24h: c.quotes?.USD?.volume_24h,
      sparkline: [],
      source: 'CoinPaprika',
    }));
  }
}

/** Crypto Fear & Greed Index */
export async function fetchFearGreedIndex() {
  const data = await fetchJson('https://api.alternative.me/fng/?limit=30');
  return (data.data || []).map(d => ({
    value: parseInt(d.value),
    label: d.value_classification,
    timestamp: new Date(d.timestamp * 1000).toISOString(),
    source: 'Alternative.me',
  }));
}

// ===========================================================================
// 10. Cyber Threat Intelligence — No key required
// ===========================================================================

/** Active C2 botnet servers from Feodo Tracker */
export async function fetchFeodoTracker() {
  const data = await proxiedJson('https://feodotracker.abuse.ch/downloads/ipblocklist.json');
  return (data || []).slice(0, 30).map(e => ({
    ip: e.ip_address,
    port: e.port,
    malware: e.malware,
    firstSeen: e.first_seen,
    lastOnline: e.last_online,
    country: e.country,
    source: 'Feodo Tracker',
  }));
}

/** Recent malicious URLs from URLhaus */
export async function fetchUrlhaus(limit = 30) {
  const data = await proxiedJson(`https://urlhaus-api.abuse.ch/v1/urls/recent/limit/${limit}/`);
  return (data.urls || []).map(u => ({
    url: u.url,
    status: u.url_status,
    threat: u.threat,
    tags: u.tags || [],
    dateAdded: u.date_added,
    reporter: u.reporter,
    source: 'URLhaus',
  }));
}

/** AlienVault OTX threat indicators */
export async function fetchOtxIndicators() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const data = await proxiedJson(`https://otx.alienvault.com/api/v1/indicators/export?type=IPv4&modified_since=${since}`);
  return (data.results || data || []).slice(0, 30).map(i => ({
    indicator: i.indicator,
    type: i.type,
    title: i.title || i.description,
    created: i.created,
    source: 'AlienVault OTX',
  }));
}

// ===========================================================================
// 11. Prediction Markets — Polymarket (may be blocked by CORS)
// ===========================================================================

/** Active prediction markets from Polymarket */
export async function fetchPredictionMarkets() {
  try {
    const data = await proxiedJson('https://gamma-api.polymarket.com/events?closed=false&active=true&limit=20&order=volume24hr&ascending=false');
    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      volume: e.volume,
      volume24h: e.volume24hr,
      liquidity: e.liquidity,
      endDate: e.endDate,
      markets: (e.markets || []).slice(0, 3).map(m => ({
        question: m.question,
        outcomePrices: m.outcomePrices,
        volume: m.volume,
      })),
      source: 'Polymarket',
    }));
  } catch {
    return [];
  }
}

// ===========================================================================
// 12. Yahoo Finance — No key required (CORS proxied)
// ===========================================================================

/** Fetch quote data from Yahoo Finance */
export async function fetchYahooQuote(symbol) {
  const data = await proxiedJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`);
  const result = data.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const quotes = result.indicators?.quote?.[0];
  const timestamps = result.timestamp || [];
  return {
    symbol: meta.symbol,
    name: meta.shortName || meta.longName || meta.symbol,
    currency: meta.currency,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    change: meta.regularMarketPrice - meta.chartPreviousClose,
    changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2),
    history: timestamps.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      close: quotes?.close?.[i],
    })).filter(d => d.close != null),
    source: 'Yahoo Finance',
  };
}

/** Batch fetch major market indices and commodities */
export async function fetchYahooMarketBatch() {
  const symbols = [
    '^GSPC', '^DJI', '^IXIC', '^FTSE', '^GDAXI', '^N225', '^HSI',  // Indices
    'GC=F', 'CL=F', 'SI=F', 'NG=F', 'HG=F',                       // Commodities
    'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCNY=X',               // Forex
  ];

  const results = { indices: [], commodities: [], forex: [] };

  for (const symbol of symbols) {
    try {
      const q = await fetchYahooQuote(symbol);
      if (!q) continue;
      if (symbol.startsWith('^')) results.indices.push(q);
      else if (symbol.includes('=F')) results.commodities.push(q);
      else results.forex.push(q);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch { continue; }
  }

  return results;
}

// ===========================================================================
// 13. arXiv Papers — No key required
// ===========================================================================

/** Search arXiv for recent papers */
export async function fetchArxivPapers(query = 'artificial intelligence economics', maxResults = 10) {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  const xml = await proxiedText(url);
  const papers = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => { const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`)); return m?.[1]?.trim() || ''; };
    papers.push({
      title: get('title').replace(/\s+/g, ' '),
      summary: get('summary').replace(/\s+/g, ' ').slice(0, 300),
      published: get('published'),
      link: get('id'),
      source: 'arXiv',
    });
  }
  return papers;
}

// ===========================================================================
// 14. Hacker News — No key required
// ===========================================================================

/** Top Hacker News stories */
export async function fetchHackerNews(limit = 15) {
  const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
  const stories = [];
  for (const id of ids.slice(0, limit)) {
    try {
      const item = await fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (item?.title) {
        stories.push({
          id: item.id,
          title: item.title,
          url: item.url,
          score: item.score,
          comments: item.descendants || 0,
          author: item.by,
          time: new Date(item.time * 1000).toISOString(),
          source: 'Hacker News',
        });
      }
    } catch { continue; }
  }
  return stories;
}

// ===========================================================================
// 15. AGGREGATED WORLD MONITOR SNAPSHOT
// ===========================================================================

/**
 * Fetch everything in parallel for the World Monitor page.
 * Each API call is wrapped in safe() so failures don't block others.
 */
export async function fetchWorldMonitorSnapshot() {
  const [
    earthquakes,
    naturalEvents,
    gdacsAlerts,
    gdeltArticles,
    conflictEvents,
    displacement,
    maritimeWarnings,
    crypto,
    fearGreed,
    feodoThreats,
    urlhausThreats,
    predictions,
    bisPolicyRates,
  ] = await Promise.all([
    safe(() => fetchEarthquakes(), 'Earthquakes'),
    safe(() => fetchNaturalEvents(14), 'Natural Events'),
    safe(() => fetchGdacsAlerts(), 'GDACS'),
    safe(() => searchGdelt('global economy geopolitics conflict', 30), 'GDELT'),
    safe(() => fetchConflictEvents(), 'UCDP Conflict'),
    safe(() => fetchDisplacementData(), 'UNHCR'),
    safe(() => fetchMaritimeWarnings(), 'NGA Maritime'),
    safe(() => fetchCryptoMarkets(), 'Crypto'),
    safe(() => fetchFearGreedIndex(), 'Fear/Greed'),
    safe(() => fetchFeodoTracker(), 'Feodo'),
    safe(() => fetchUrlhaus(20), 'URLhaus'),
    safe(() => fetchPredictionMarkets(), 'Polymarket'),
    safe(() => fetchBisPolicyRates(), 'BIS Rates'),
  ]);

  return {
    earthquakes: earthquakes || [],
    naturalEvents: naturalEvents || [],
    gdacsAlerts: gdacsAlerts || [],
    gdeltArticles: gdeltArticles || [],
    conflictEvents: conflictEvents || [],
    displacement,
    maritimeWarnings: maritimeWarnings || [],
    crypto: crypto || [],
    fearGreed: fearGreed || [],
    cyberThreats: {
      feodo: feodoThreats || [],
      urlhaus: urlhausThreats || [],
    },
    predictions: predictions || [],
    bisPolicyRates: bisPolicyRates || [],
    fetchedAt: new Date().toISOString(),
  };
}
