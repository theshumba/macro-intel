# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

### No API Key Required (Free, Open Access)

**World Bank Open Data:**
- Used for: Country-level macro indicators (GDP, CPI, trade, debt, employment, energy, demographics)
- Client: Custom `fetchWorldBank()` in `src/services/dataApis.js`
- Base URL: `https://api.worldbank.org/v2/`
- Rate limit: Generous (no documented limit)
- 12 pre-defined indicators in `WB_INDICATORS` constant, 50+ in `src/services/indicatorCatalog.js`

**DB.nomics:**
- Used for: Aggregated statistical agency data (IMF, OECD, Eurostat)
- Client: Custom `fetchDBnomics()` in `src/services/dataApis.js`
- Base URL: `https://api.db.nomics.world/v22/`
- Rate limit: Generous

**Our World in Data (OWID):**
- Used for: CO2, energy, population datasets (GitHub-hosted JSON)
- Client: Custom `fetchOWID()` in `src/services/dataApis.js`
- Base URLs: Raw GitHub repository URLs (`raw.githubusercontent.com/owid/`)
- Rate limit: None (static files)
- Used for 10 indicators in `src/services/indicatorCatalog.js`

**RSS Feeds (8 primary, 22+ in expanded registry):**
- Used for: Live news ingestion from central banks, multilateral orgs, and news outlets
- Client: Custom XML parser using browser `DOMParser` in `src/services/feedService.js` and `src/services/ingestionEngine.js`
- Sources defined in `src/services/feedService.js` (8 feeds) and `src/services/sourceRegistry.js` (30+ feeds across 3 tiers)
- Primary feeds: Federal Reserve, ECB, IMF, World Bank, Google News (Reuters), BBC Business, Al Jazeera, CNBC
- Expanded Tier 2: Bank of England, OECD, DW News, France 24, CNN Business, Sky News, Bloomberg/WSJ/FT/Economist via Google News RSS
- Tier 3 (not implemented): GDELT API

### Free API Key Required

**FRED (Federal Reserve Economic Data):**
- Used for: US economic time series (rates, inflation, employment, commodities, markets)
- Client: Custom `fetchFRED()` in `src/services/dataApis.js`
- Env var: `VITE_FRED_API_KEY`
- Base URL: `https://api.stlouisfed.org/fred/`
- Rate limit: 120 requests/min
- 16 pre-defined series in `FRED_SERIES`, 25+ in indicator catalog
- Also proxied server-side via Worker at `/api/fred/:seriesId`

**Alpha Vantage:**
- Used for: Stocks, FX, crypto prices, economic indicators
- Client: Custom `fetchAlphaVantage()` in `src/services/dataApis.js`
- Env var: `VITE_ALPHA_VANTAGE_KEY`
- Base URL: `https://www.alphavantage.co/query`
- Rate limit: 25 requests/day (free tier)
- Convenience wrappers: `fetchForexRate()`, `fetchCryptoPrice()`, `fetchEconomicIndicator()`

**Finnhub:**
- Used for: Real-time stock/FX quotes, economic calendar, market news
- Client: Custom `fetchFinnhub()` in `src/services/dataApis.js`
- Env var: `VITE_FINNHUB_KEY`
- Base URL: `https://finnhub.io/api/v1/`
- Rate limit: 60 requests/min
- Convenience wrappers: `fetchEconomicCalendar()`, `fetchMarketNews()`, `fetchStockQuote()`
- Also proxied server-side via Worker at `/api/finnhub/:endpoint`

**Twelve Data:**
- Used for: Stocks, FX, crypto, commodities, technicals
- Client: Custom `fetchTwelveData()` in `src/services/dataApis.js`
- Env var: `VITE_TWELVE_DATA_KEY`
- Base URL: `https://api.twelvedata.com/`
- Rate limit: 800 requests/day
- Convenience wrappers: `fetchTimeSeriesPrice()`, `fetchRealTimePrice()`

**Marketaux:**
- Used for: Financial news with sentiment analysis
- Client: Custom `fetchMarketaux()` in `src/services/dataApis.js`
- Env var: `VITE_MARKETAUX_KEY`
- Base URL: `https://api.marketaux.com/v1/`
- Rate limit: 100 requests/day
- Also proxied server-side via Worker at `/api/marketaux`

**NewsAPI:**
- Used for: General news search (business/economy)
- Client: Custom `fetchNewsAPI()` in `src/services/dataApis.js`
- Env var: `VITE_NEWSAPI_KEY`
- Base URL: `https://newsapi.org/v2/`
- Rate limit: 100 requests/day, 1 month lookback

### Cataloged but Not Integrated

Listed in `API_CATALOG` in `src/services/dataApis.js`:
- **Trading Economics** - Limited free tier
- **Marketstack** - 100 requests/month (free)
- **Tiingo** - Free tier available
- **Eurostat** - No key required (mentioned but no dedicated fetch function)
- **IMF Data API** - No key required (mentioned but no dedicated fetch function)
- **FAOSTAT** - No key required (mentioned but no dedicated fetch function)
- **OECD** - No key required (mentioned but no dedicated fetch function)
- **UN Data** - No key required (mentioned but no dedicated fetch function)

## Data Storage

**Databases:**
- IndexedDB via Dexie.js 4.3.0
  - Database name: `MacroIntelArchive`
  - Client: `src/services/archiveDb.js`
  - Tables:
    - `events` - Full event objects with indexes on `eventId`, `clusterId`, `headline`, `category`, `primaryCountry`, `primaryRegion`, `severity`, `confidence`, `status`, `firstSeenAt`, `lastUpdatedAt`, `publishedAt`, `ingestedAt`
    - `eventLog` - Event lifecycle audit trail with auto-increment `id`, `eventId`, `action`, `timestamp`
  - Operations: `storeEvents()`, `getEvents()`, `getEvent()`, `getClusterEvents()`, `getEventLog()`, `updateEventStatus()`, `getArchiveStats()`, `purgeOldEvents()`, `clearArchive()`
  - Purge policy: 90 days default

**File Storage:**
- None (no file uploads, no S3/cloud storage)

**Caching:**
- In-memory cache in `src/services/contextDataService.js`
  - TTL: 30 minutes
  - Keyed by event ID
  - Separate OWID data cache (large JSON files cached indefinitely per session)
- Cloudflare Cache API in Worker (`workers/rss-proxy/src/index.js`)
  - TTL: 600 seconds (configurable via `CACHE_TTL` env var in `wrangler.toml`)

## CORS Strategy

**Primary:** Cloudflare Worker RSS proxy (if `VITE_WORKER_URL` is set)
- Endpoint: `{WORKER_URL}/api/feeds`
- Handles all RSS fetching server-side, bypassing browser CORS
- Also proxies FRED, Finnhub, World Bank, and Marketaux API calls (keeps API keys server-side)

**Fallback:** Browser-side CORS proxy chain (tried in order)
1. `https://api.allorigins.win/raw?url=`
2. `https://corsproxy.io/?url=`
3. `https://api.codetabs.com/v1/proxy?quest=`
- Defined in both `src/services/feedService.js` and `src/services/ingestionEngine.js`
- 12-second timeout per proxy attempt

**Ultimate Fallback:** Curated demo data
- Generated in `src/services/feedService.js` (`generateDemoData()`) and `src/services/ingestionEngine.js`
- 16+ hardcoded demo events covering all categories and regions
- Ensures the app always displays content even when offline

## Authentication & Identity

**Auth Provider:**
- None - No user authentication
- No login, no sessions, no user accounts
- All data is public or accessed via free-tier API keys

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, no external error tracking)

**Logs:**
- Browser `console.warn()` and `console.info()` throughout service layer
- Pattern: `[serviceName] message` (e.g., `[feedService] Federal Reserve: timeout`, `[ingestion] Worker returned 42 items`)
- All API failures wrapped in `safeCall()` helper that catches and logs errors without crashing

## CI/CD & Deployment

**Hosting:**
- GitHub Pages at `https://theshumba.github.io/macro-intel/`
- Static build output from `vite build` to `dist/`
- Base path configured as `/macro-intel/` in `vite.config.js`

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)
- Manual deployment via `npm run build` + push to GitHub Pages

**Worker Deployment:**
- Cloudflare Workers via Wrangler CLI
- `cd workers/rss-proxy && npm run deploy`
- Secrets managed via `npx wrangler secret put <KEY_NAME>`

## Environment Configuration

**Required env vars:**
- None are strictly required (all gracefully degrade)

**Optional env vars (enhance functionality):**
- `VITE_WORKER_URL` - Enables server-side RSS proxy (most impactful)
- `VITE_FRED_API_KEY` - Enables FRED economic data
- `VITE_ALPHA_VANTAGE_KEY` - Enables stock/FX/crypto data
- `VITE_FINNHUB_KEY` - Enables real-time quotes and economic calendar
- `VITE_TWELVE_DATA_KEY` - Enables additional market data
- `VITE_MARKETAUX_KEY` - Enables financial news with sentiment
- `VITE_NEWSAPI_KEY` - Enables general news search

**Worker secrets (set via Wrangler CLI):**
- `FRED_API_KEY` - For server-side FRED proxy
- `FINNHUB_KEY` - For server-side Finnhub proxy
- `MARKETAUX_KEY` - For server-side Marketaux proxy

**Secrets location:**
- `.env` file (local development, gitignored)
- Cloudflare Worker secrets (production, via `wrangler secret put`)
- `.env.example` documents all variables with descriptions and signup URLs

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Aggregated Fetch Pattern

The app uses a comprehensive parallel-fetch pattern in `src/services/dataApis.js`:

```js
// fetchMacroSnapshot() fires all available APIs in parallel
const [...results] = await Promise.all([
  safeCall(() => fetchWorldBank(...), 'WorldBank GDP'),
  safeCall(() => fetchFRED(...), 'FRED Funds'),
  safeCall(() => fetchFinnhub(...), 'Finnhub Calendar'),
  safeCall(() => fetchMarketaux(), 'Marketaux News'),
  // ... more
]);
```

- `safeCall()` wraps each fetch in a `.catch()` that logs and returns `null`
- Unconfigured APIs return `null` immediately (no key = no request)
- All API responses normalized to consistent shapes before consumption

## News Ingestion Pipeline

The primary data flow for news (`src/services/ingestionEngine.js`):

1. Try Cloudflare Worker (`VITE_WORKER_URL/api/feeds`)
2. Fallback to CORS proxy chain for each RSS feed
3. Fallback to curated demo data
4. Classify events: category, severity, confidence, tags (`src/services/classifier.js`)
5. Geolocate events: country, region, coordinates (`src/services/geolocation.js`)
6. Cluster related events: Jaccard similarity + union-find (`src/services/clustering.js`)
7. Deduplicate clusters: pick canonical representative, merge sources
8. Archive to IndexedDB (`src/services/archiveDb.js`)
9. Auto-refresh every 10 minutes (configured in `src/App.jsx`)

## Contextual Data Enrichment

The `src/services/contextDataService.js` matches events to relevant economic indicators:

1. `matchIndicators()` scores 200+ indicators from `src/services/indicatorCatalog.js` against event metadata
2. Top 8 matched indicators fetched in parallel from World Bank, FRED, or OWID
3. Results cached in-memory for 30 minutes
4. `extractDataCitations()` formats data for content enrichment

## Indicator Catalog

`src/services/indicatorCatalog.js` contains 200+ macro indicators across 3 sources:
- **World Bank (WB):** 50+ indicators (GDP, trade, debt, labor, energy, environment, demographics, military, financial, food, infrastructure)
- **FRED:** 25+ indicators (rates, inflation, employment, growth, markets, commodities, money supply, trade, credit)
- **OWID:** 10+ indicators (CO2, energy mix, GDP per capita, population)

---

*Integration audit: 2026-03-07*
