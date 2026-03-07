# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**Dead Code: Legacy feedService.js and briefGenerator.js (1,373 lines)**
- Issue: `src/services/feedService.js` (938 lines) and `src/services/briefGenerator.js` (435 lines) are fully superseded by `src/services/ingestionEngine.js` and `src/services/summaryEngine.js` respectively. No file in `src/` imports from either. They remain in the codebase as dead weight.
- Files: `src/services/feedService.js`, `src/services/briefGenerator.js`
- Impact: Confusing for new contributors. Increases bundle size by ~1,373 lines. Creates ambiguity about which feed/classification system is canonical.
- Fix approach: Delete both files. Verify with `grep -r "feedService\|briefGenerator" src/` that nothing imports them (already confirmed: zero references).

**Dead Components: GlobeView, DashboardView, ViewSwitcher, NewsList (4 files)**
- Issue: `GlobeView.jsx`, `DashboardView.jsx`, `ViewSwitcher.jsx`, and `NewsList.jsx` are not imported anywhere in the app. They are remnants from previous versions. `GlobeView.jsx` pulls in `react-globe.gl` and `three` (heavy 3D libraries) as dependencies but is never rendered. `DashboardView.jsx`, `NewsList.jsx`, and `NewsCard.jsx` form a dependency chain that is only imported by each other, never by pages or `App.jsx`.
- Files: `src/components/GlobeView.jsx`, `src/components/DashboardView.jsx`, `src/components/ViewSwitcher.jsx`, `src/components/NewsList.jsx`, `src/components/NewsCard.jsx`
- Impact: `react-globe.gl` (2.37 MB) and `three` (183.2 KB) are in `package.json` dependencies but may only be used by dead code. If GlobeView is truly unused, these packages inflate the bundle significantly. Tree-shaking may not fully eliminate them since they are listed as dependencies.
- Fix approach: (1) Confirm GlobeView is intentionally deprecated. (2) Delete unused component files. (3) If `react-globe.gl` and `three` are not used elsewhere, remove from `package.json` and run `npm install`. (4) Remove `leaflet` if only the MapPage uses it (MapPage does use it, so keep `leaflet`).

**Duplicated XML Parsing Logic (3 locations)**
- Issue: XML/RSS parsing (`stripHtml`, `getTagText`, `parseXml`) is implemented three times: in `src/services/feedService.js`, `src/services/ingestionEngine.js`, and `workers/rss-proxy/src/index.js`. The first is dead code, but the ingestion engine and worker still duplicate the same logic.
- Files: `src/services/feedService.js` (lines 332-405), `src/services/ingestionEngine.js` (lines 26-78), `workers/rss-proxy/src/index.js` (lines 23-97)
- Impact: Bug fixes must be applied in multiple places. Inconsistency risk (the worker uses regex-based parsing since Workers lack DOMParser, which is fine, but the browser-side code is a straight copy-paste).
- Fix approach: Extract `stripHtml`, `getTagText`, and `parseXml` into a shared `src/services/xmlParser.js` module for the browser code. The worker version necessarily differs (no DOMParser in Cloudflare Workers) and can remain separate.

**Duplicated Country/Coordinate Lookup Data (2 locations)**
- Issue: Country coordinate data is defined in both `src/services/feedService.js` (the `COUNTRY_COORDS` object, ~50 entries) and `src/services/geolocation.js` (the `COUNTRIES` object, ~90 entries with richer data). The feedService version is dead code, but this pattern indicates data was copy-pasted rather than shared.
- Files: `src/services/feedService.js` (lines 71-119), `src/services/geolocation.js` (lines 12-93)
- Impact: Minimal since feedService is dead code, but cleanup would prevent future confusion.
- Fix approach: Delete feedService.js entirely (covers this).

**Duplicated Feed Source Lists (2 locations)**
- Issue: The RSS feed list is defined in both `src/services/feedService.js` (8 feeds) and `workers/rss-proxy/src/index.js` (8 feeds), plus the expanded `src/services/sourceRegistry.js` (22+ feeds). Changes to feeds must be synchronized manually.
- Files: `src/services/feedService.js` (lines 9-18), `workers/rss-proxy/src/index.js` (lines 6-15), `src/services/sourceRegistry.js`
- Impact: Worker and client may fetch different feed sets if not kept in sync. Adding a new source requires editing up to 3 files.
- Fix approach: Make the worker the single source of truth for feed URLs. The client should not maintain a separate feed list. Alternatively, have the worker expose an `/api/sources` endpoint that the client reads.

**Inconsistent Event Model Between Old and New Systems**
- Issue: The old system (`feedService.js`) used flat properties (`impactScore`, `lat`, `lng`, `inflationBias`, `growthBias`) while the new system (`eventModel.js` + `ingestionEngine.js`) uses structured properties (`severity`, `coordinates.lat`, `coordinates.lng`, `subcategoryTags`). Some components like `GlobeView.jsx` still reference the old model (`d.lat`, `d.lng`, `d.impactScore`), confirming they are dead code.
- Files: `src/services/eventModel.js`, `src/services/feedService.js`, `src/components/GlobeView.jsx`
- Impact: If anyone accidentally imports GlobeView, it will crash because the event shape changed.
- Fix approach: Delete all old-model components and services.

**IMF/World Bank Region Set to "Global Maritime / Strategic Waterways"**
- Issue: In `src/services/sourceRegistry.js`, the IMF and World Bank feeds have their `region` set to `'Global Maritime / Strategic Waterways'` (lines 39, 48). This is clearly incorrect -- they should be `'Global'` or similar. This was likely a copy-paste error.
- Files: `src/services/sourceRegistry.js` (lines 39, 48)
- Impact: Events from IMF/World Bank feeds get misclassified to the maritime region when the geolocation engine cannot resolve a country.
- Fix approach: Change both to an appropriate region like `'Global'` or leave region empty and let the geolocation engine resolve from text content.

## Known Bugs

**QuickActions Accesses Wrong Content Structure**
- Issue: In `BriefPanel.jsx`, the `QuickActions` component generates content via `generateContent()` but then tries to access `content.socialPosts.x`, `content.socialPosts.linkedin`, etc. (lines 269-291). However, `generateContent()` returns `content.social.x.analyst.text`, `content.social.linkedin.analyst.text`, etc. The property paths do not match, so quick action copy always copies an empty string.
- Files: `src/components/BriefPanel.jsx` (lines 267-292)
- Trigger: Click any quick action button (X Post, LinkedIn, Instagram, Script, Thread, Newsletter) in the BriefPanel
- Workaround: Use the Content Studio tab instead, which accesses the correct paths.

**contextDataService Cache Key Mismatch**
- Issue: `fetchContextData` in `src/services/contextDataService.js` creates cache keys using `item.id` (line 184), but the new event model uses `item.eventId` as the unique identifier. If `item.id` is undefined (which it is for events created by `createEvent()`), the cache key becomes `ctx:undefined`, meaning all events share the same cache entry.
- Files: `src/services/contextDataService.js` (lines 15-16, 184)
- Trigger: Open the Data tab for any event in the BriefPanel, then open a different event -- the data from the first event may be returned.
- Workaround: None. Must fix the cache key to use `item.eventId`.

## Security Considerations

**CORS Proxy Chain Exposes Feed URLs Through Third Parties**
- Risk: When the Cloudflare Worker is not configured, the app falls back to three public CORS proxies (`api.allorigins.win`, `corsproxy.io`, `api.codetabs.com`) in `src/services/ingestionEngine.js` (lines 18-20). These proxies see all outbound requests and could inject malicious content into RSS responses, perform MITM attacks, or track user behavior.
- Files: `src/services/ingestionEngine.js` (lines 18-20), `src/services/feedService.js` (lines 52-56)
- Current mitigation: The app only reads RSS XML (not executing scripts), and content is rendered as text. The worker is the preferred path.
- Recommendations: (1) Log a clear console warning when falling back to CORS proxies. (2) Consider removing CORS proxy fallback entirely in production builds since the Cloudflare Worker is free and reliable. (3) Add Content-Security-Policy headers.

**API Keys Embedded in Client-Side Code**
- Risk: `src/services/dataApis.js` reads API keys (`FRED_API_KEY`, `ALPHA_VANTAGE_KEY`, `FINNHUB_KEY`, etc.) from `import.meta.env.VITE_*` variables. Vite embeds these directly into the client bundle at build time, making them extractable by anyone viewing the deployed JavaScript.
- Files: `src/services/dataApis.js` (lines 9-14)
- Current mitigation: Functions gracefully return `null` when keys are not set. The Cloudflare Worker in `workers/rss-proxy/src/index.js` provides server-side proxy endpoints for FRED and Finnhub that keep keys secret.
- Recommendations: (1) Route ALL keyed API calls through the Cloudflare Worker proxy. (2) Remove `VITE_*` key variables from client-side code entirely. (3) Only expose the worker URL as the single env var.

**Wildcard CORS on Cloudflare Worker**
- Risk: The worker sets `Access-Control-Allow-Origin: *` (line 18 in `workers/rss-proxy/src/index.js`), allowing any website to call the RSS proxy and API proxy endpoints. This could be abused for quota exhaustion on upstream APIs.
- Files: `workers/rss-proxy/src/index.js` (lines 17-21)
- Current mitigation: Cache layer reduces upstream calls. Free-tier API rate limits provide a ceiling.
- Recommendations: Restrict CORS to the deployed domain (`https://theshumba.github.io`) or add a simple auth token header check.

## Performance Bottlenecks

**O(n^2) Event Clustering Algorithm**
- Problem: `clusterEvents()` compares every pair of events using nested loops (lines 124-134 in `src/services/clustering.js`). For N events, this is O(n^2) comparisons. Each comparison involves `wordSimilarity()` which itself creates Set objects and iterates word lists.
- Files: `src/services/clustering.js` (lines 100-142)
- Cause: Brute-force pairwise comparison without spatial/temporal indexing.
- Improvement path: (1) Pre-sort events by timestamp and only compare within the 48-hour window (partially done). (2) Use locality-sensitive hashing (MinHash) for approximate similarity. (3) For the current feed count (~22 feeds, ~100-200 items), the O(n^2) is acceptable. Only becomes a problem if feed count or batch size grows significantly.

**OWID JSON Datasets Fetched In Full Without Size Limits**
- Problem: `fetchOWID()` in `src/services/dataApis.js` fetches entire OWID JSON datasets (e.g., `owid-co2-data.json` at ~25MB, `owid-energy-data.json` at ~30MB) into the browser as a single JSON blob with a 30-second timeout.
- Files: `src/services/dataApis.js` (lines 135-144), `src/services/contextDataService.js` (lines 31-42)
- Cause: OWID provides no query API; the data is hosted as static files. The `owidCache` Map prevents re-fetching but never evicts, so the data persists in memory for the session lifetime.
- Improvement path: (1) Only fetch OWID data on explicit user request (not automatic). (2) Add a `MAX_OWID_CACHE_SIZE` limit. (3) Consider proxying through the worker with server-side filtering.

**getEvents() Loads Entire IndexedDB Table Into Memory**
- Problem: `getEvents()` in `src/services/archiveDb.js` (line 91) calls `collection.toArray()` to load ALL events, then applies filters in JavaScript. As the archive grows over 90 days of ingestion (every 10 minutes), this could become thousands of records loaded into memory on every archive page visit.
- Files: `src/services/archiveDb.js` (lines 77-139)
- Cause: Dexie supports indexed queries, but the filtering is done in JS after a full table scan.
- Improvement path: Use Dexie's `.where()` and `.filter()` chain to push filtering into IndexedDB. For example, use the `category` and `primaryRegion` indexes that are already defined in the schema.

**Auto-Refresh Creates New RegExp Objects Per Country Per Event Every 10 Minutes**
- Problem: `geolocateEvent()` creates `new RegExp(...)` for every country/institution/waterway/city entry on every call. With ~90 countries, ~20 institutions, ~17 waterways, and ~20 cities, that is ~147 regex compilations per event. The 10-minute auto-refresh ingests all feeds and runs geolocation on every item.
- Files: `src/services/geolocation.js` (lines 206-258)
- Cause: Regex objects are created inline rather than pre-compiled.
- Improvement path: Pre-compile all regexes at module load time into a `Map<string, RegExp>` and reuse them. This is a straightforward optimization.

## Fragile Areas

**Event Detail Panel Props Mismatch**
- Files: `src/components/BriefPanel.jsx`, `src/components/EventDetailPanel.jsx`
- Why fragile: BriefPanel expects both a `brief` prop (generated by the old briefGenerator) and an `item` prop (raw event). The ContentStudio and Data tab consume the `item` prop. EventDetailPanel wraps BriefPanel and calls `generateBriefing()` from `briefGenerator.js`. Since briefGenerator is the OLD system and the event model has changed, the brief generation may fail or produce incorrect output for new-model events.
- Safe modification: Verify that EventDetailPanel correctly bridges the new event model to BriefPanel. Consider replacing the briefGenerator call with the summaryEngine.
- Test coverage: None.

**Content Generator Assumes Old Event Model**
- Files: `src/services/contentGenerator.js` (lines 777-870)
- Why fragile: `generateContent()` destructures `impactScore`, `keywords`, `inflationBias`, `growthBias` from the input item. The new event model uses `severity` (1-3 scale) instead of `impactScore` (1-10 scale), `subcategoryTags` instead of `keywords`, and does not have inflation/growth bias fields. If the caller passes a new-model event, the content generator falls back to defaults which produces generic content.
- Safe modification: Add an adapter function that converts new-model events to the shape contentGenerator expects, or update contentGenerator to accept both models.
- Test coverage: None.

**Cloudflare Worker Feed List Synchronization**
- Files: `workers/rss-proxy/src/index.js` (lines 6-15), `src/services/sourceRegistry.js`
- Why fragile: The worker has 8 hardcoded feeds, but the client-side source registry has 22+ feeds. When the worker is active, only 8 feeds are fetched. When it is down, the client fetches 22+ via CORS proxies. This means the app's behavior changes significantly based on whether the worker is online.
- Safe modification: Update the worker feed list to match sourceRegistry.js, or have the worker accept feed URLs as parameters.
- Test coverage: None.

## Scaling Limits

**IndexedDB Archive Growth**
- Current capacity: Purges events older than 90 days (configurable in `archiveDb.js`).
- Limit: IndexedDB storage varies by browser (Chrome: ~80% of disk, Firefox: ~50% of disk, Safari: 1GB default). With ~200 events/day at ~2KB each, 90 days = ~36MB. Well within limits.
- Scaling path: The 90-day purge prevents unbounded growth. If event volume increases dramatically, reduce the purge window or add pagination to `getEvents()`.

**In-Memory Caches Never Evict (contextDataService)**
- Current capacity: `cache` Map and `owidCache` Map in `src/services/contextDataService.js` grow without bound within a session. The `cache` has a 30-minute TTL but only checks on read, never proactively evicts.
- Limit: In long-running sessions (dashboard left open), these caches accumulate. OWID datasets are particularly large (25-30MB each).
- Scaling path: Add a max cache size (LRU eviction) or periodic sweep.

## Dependencies at Risk

**Public CORS Proxies (allorigins, corsproxy.io, codetabs)**
- Risk: These are free, community-run services with no SLA. They frequently go down, change URLs, or add rate limits. The app already handles failure gracefully (fallback chain), but if all three fail simultaneously, only demo data is shown.
- Impact: No real data available when worker is not configured and all proxies fail.
- Migration plan: Deploy the Cloudflare Worker (free tier, 100K requests/day) and deprecate CORS proxy fallback.

**react-globe.gl / three.js (Possibly Unused)**
- Risk: `react-globe.gl` (v2.37) and `three` (v0.183) are heavy 3D rendering dependencies (~3MB combined). If `GlobeView.jsx` is confirmed dead code, these inflate the bundle unnecessarily.
- Impact: Significantly larger bundle size and longer initial load time.
- Migration plan: Confirm GlobeView is deprecated, delete the component, remove both packages.

## Missing Critical Features

**No Error Boundary**
- Problem: The app has no React Error Boundary. If any component throws during render (e.g., accessing `.coordinates.lat` on an event with `coordinates: null`), the entire app crashes to a white screen.
- Blocks: Production reliability. One bad event can take down the whole dashboard.

**No Rate Limiting for API Calls**
- Problem: `dataApis.js` functions have no client-side rate limiting. Alpha Vantage allows only 25 requests/day on the free tier. Rapidly switching between events in the Data tab or opening the Markets page repeatedly can exhaust the daily quota.
- Blocks: Consistent access to market data throughout the day.

## Test Coverage Gaps

**Zero Test Files**
- What's not tested: The entire application. There are no test files (`*.test.*`, `*.spec.*`), no test configuration (`jest.config.*`, `vitest.config.*`), and no test runner in `package.json` scripts.
- Files: All files in `src/services/` and `src/components/`
- Risk: Every code change is deployed without automated verification. The clustering algorithm, classifier, geolocation engine, and content generator all contain nuanced logic (keyword matching, similarity scoring, coordinate resolution) that is highly testable but entirely untested.
- Priority: High. Start with unit tests for the pure-logic services:
  1. `src/services/classifier.js` - `classifyCategory()`, `classifySeverity()`, `extractTags()`
  2. `src/services/clustering.js` - `clusterEvents()`, `deduplicateClusters()`
  3. `src/services/geolocation.js` - `geolocateEvent()`
  4. `src/services/contentGenerator.js` - `generateContent()`, `truncateToLimit()`, `generateHashtags()`
  5. `src/services/summaryEngine.js` - `generateSummary()`

**Deprecated `document.execCommand('copy')` Used as Clipboard Fallback**
- What's not tested: The clipboard fallback path in `BriefPanel.jsx` (lines 130-137, 298-305) and `ContentStudio.jsx` (line 40) uses the deprecated `document.execCommand('copy')` method. This is a silent failure risk in modern browsers.
- Files: `src/components/BriefPanel.jsx`, `src/components/ContentStudio.jsx`
- Risk: Clipboard operations may silently fail on newer browser versions that remove `execCommand` support.
- Priority: Low. The primary `navigator.clipboard.writeText()` path works in all modern browsers. The fallback is only for very old browsers.

---

*Concerns audit: 2026-03-07*
