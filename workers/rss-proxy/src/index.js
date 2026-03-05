// ---------------------------------------------------------------------------
// Macro Intel RSS Proxy — Cloudflare Worker
// Fetches RSS feeds server-side, bypasses CORS, returns structured JSON.
// ---------------------------------------------------------------------------

const FEEDS = [
  { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', region: 'North America', category: 'Monetary Policy' },
  { name: 'ECB', url: 'https://www.ecb.europa.eu/rss/press.html', region: 'Europe', category: 'Monetary Policy' },
  { name: 'IMF Blog', url: 'https://www.imf.org/en/News/rss', region: 'Global', category: 'Multilateral' },
  { name: 'World Bank', url: 'https://feeds.worldbank.org/rss/topic/economy', region: 'Global', category: 'Multilateral' },
  { name: 'Reuters Economy', url: 'https://news.google.com/rss/search?q=global+economy+OR+central+bank+OR+trade+tariffs+OR+sanctions&hl=en-US&gl=US&ceid=US:en', region: 'Global', category: 'Mixed' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', region: 'Global', category: 'Mixed' },
  { name: 'Al Jazeera Economy', url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'Global', category: 'Mixed' },
  { name: 'CNBC Economy', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', region: 'North America', category: 'Markets' },
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function stripHtml(html) {
  if (!html) return '';
  let text = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  text = text.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return text.trim();
}

function parseXml(xmlString, feed) {
  // Simple regex-based XML parser (no DOMParser in Workers)
  const items = [];

  // Try RSS 2.0 <item> elements
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlString)) !== null) {
    const block = match[1];
    const title = stripHtml(extractTag(block, 'title'));
    const description = stripHtml(extractTag(block, 'description'));
    const link = extractTag(block, 'link').trim();
    const pubDate = extractTag(block, 'pubDate');

    if (title) {
      items.push({
        title,
        description: description.slice(0, 500),
        link,
        pubDate: pubDate || null,
        sourceName: feed.name,
        sourceCategory: feed.category,
        sourceRegion: feed.region,
      });
    }
  }

  if (items.length > 0) return items;

  // Fall back to Atom <entry> elements
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
  while ((match = entryRegex.exec(xmlString)) !== null) {
    const block = match[1];
    const title = stripHtml(extractTag(block, 'title'));
    const summary = stripHtml(extractTag(block, 'summary') || extractTag(block, 'content'));
    const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["']/);
    const link = linkMatch ? linkMatch[1] : '';
    const updated = extractTag(block, 'updated') || extractTag(block, 'published');

    if (title) {
      items.push({
        title,
        description: summary.slice(0, 500),
        link,
        pubDate: updated || null,
        sourceName: feed.name,
        sourceCategory: feed.category,
        sourceRegion: feed.region,
      });
    }
  }

  return items;
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: { 'User-Agent': 'MacroIntel/1.0 RSS Reader' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { feed: feed.name, items: [], error: `HTTP ${response.status}` };
    }

    const text = await response.text();

    if (!text || text.length < 50) {
      return { feed: feed.name, items: [], error: 'Empty response' };
    }

    const items = parseXml(text, feed);
    return { feed: feed.name, items, error: null };
  } catch (err) {
    return { feed: feed.name, items: [], error: err.message };
  }
}

// ---- API Proxy Routes -----------------------------------------------------

async function handleApiProxy(url, env) {
  const path = url.pathname;

  // /api/fred/:seriesId — Proxy FRED requests (keeps API key server-side)
  if (path.startsWith('/api/fred/')) {
    const seriesId = path.replace('/api/fred/', '');
    const limit = url.searchParams.get('limit') || '100';
    if (!env.FRED_API_KEY) return jsonResponse({ error: 'FRED_API_KEY not configured' }, 503);
    const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    const resp = await fetch(fredUrl);
    const data = await resp.json();
    return jsonResponse(data);
  }

  // /api/finnhub/:endpoint — Proxy Finnhub requests
  if (path.startsWith('/api/finnhub/')) {
    const endpoint = path.replace('/api/finnhub/', '');
    if (!env.FINNHUB_KEY) return jsonResponse({ error: 'FINNHUB_KEY not configured' }, 503);
    const params = new URLSearchParams(url.searchParams);
    params.set('token', env.FINNHUB_KEY);
    const finnUrl = `https://finnhub.io/api/v1/${endpoint}?${params}`;
    const resp = await fetch(finnUrl);
    const data = await resp.json();
    return jsonResponse(data);
  }

  // /api/worldbank/:indicator — Proxy World Bank (no key needed, but avoids CORS)
  if (path.startsWith('/api/worldbank/')) {
    const indicator = path.replace('/api/worldbank/', '');
    const country = url.searchParams.get('country') || 'all';
    const date = url.searchParams.get('date') || '2020:2025';
    const wbUrl = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${date}&format=json&per_page=500`;
    const resp = await fetch(wbUrl);
    const data = await resp.json();
    return jsonResponse(data);
  }

  // /api/marketaux — Proxy Marketaux news
  if (path === '/api/marketaux') {
    if (!env.MARKETAUX_KEY) return jsonResponse({ error: 'MARKETAUX_KEY not configured' }, 503);
    const params = new URLSearchParams(url.searchParams);
    params.set('api_token', env.MARKETAUX_KEY);
    if (!params.has('language')) params.set('language', 'en');
    if (!params.has('limit')) params.set('limit', '50');
    const mUrl = `https://api.marketaux.com/v1/news/all?${params}`;
    const resp = await fetch(mUrl);
    const data = await resp.json();
    return jsonResponse(data);
  }

  return null; // not an API proxy route
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Try API proxy routes first
    const proxyResponse = await handleApiProxy(url, env);
    if (proxyResponse) return proxyResponse;

    if (url.pathname !== '/api/feeds' && url.pathname !== '/') {
      return jsonResponse({ error: 'Not found. Available: /api/feeds, /api/fred/:series, /api/finnhub/:endpoint, /api/worldbank/:indicator, /api/marketaux' }, 404);
    }

    // Check cache
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Filter feeds if ?sources= param provided
    const sourcesParam = url.searchParams.get('sources');
    let feedsToFetch = FEEDS;

    if (sourcesParam) {
      const sourceNames = sourcesParam.toLowerCase().split(',');
      feedsToFetch = FEEDS.filter((f) =>
        sourceNames.some((s) => f.name.toLowerCase().includes(s))
      );
    }

    // Fetch all feeds concurrently
    const results = await Promise.allSettled(feedsToFetch.map(fetchFeed));

    const allItems = [];
    const errors = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value.items);
        if (result.value.error) {
          errors.push({ feed: result.value.feed, error: result.value.error });
        }
      } else {
        errors.push({ feed: 'unknown', error: result.reason?.message });
      }
    }

    const body = JSON.stringify({
      items: allItems,
      fetchedAt: new Date().toISOString(),
      feedCount: feedsToFetch.length,
      itemCount: allItems.length,
      errors: errors.length > 0 ? errors : undefined,
    });

    const response = new Response(body, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': `s-maxage=${env.CACHE_TTL || 600}`,
      },
    });

    // Store in cache
    if (allItems.length > 0) {
      await cache.put(cacheKey, response.clone());
    }

    return response;
  },
};
