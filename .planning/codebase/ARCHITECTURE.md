# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Data ingestion pipeline feeding a React SPA with client-side intelligence processing

**Key Characteristics:**
- Three-tier data acquisition: Cloudflare Worker (preferred) -> CORS proxy fallback -> demo data
- Client-side NLP pipeline: classification, geolocation, clustering, deduplication
- Event-driven data model with severity-based progressive disclosure
- IndexedDB archive for persistent event history
- No server-side application logic beyond the RSS proxy worker
- No state management library; React `useState`/`useMemo` at `App.jsx` level, prop-drilled to pages

## Layers

**Presentation Layer (Pages):**
- Purpose: Route-level views that compose components and filter event data
- Location: `src/pages/`
- Contains: 8 page components, each receiving events and callbacks via props from `App.jsx`
- Depends on: Components (`src/components/`), Services (`src/services/eventModel.js`)
- Used by: `src/App.jsx` via React Router `<Routes>`

**Presentation Layer (Components):**
- Purpose: Reusable UI elements for displaying events, charts, navigation, and filters
- Location: `src/components/`
- Contains: 15 components (EventCard, EventDetailPanel, FilterBar, Navigation, GlobeView, MarketsView, ContentStudio, charts/*)
- Depends on: Services (eventModel, summaryEngine, contentGenerator, briefGenerator, contextDataService)
- Used by: Pages and `App.jsx`

**Ingestion & Processing Layer:**
- Purpose: Fetch RSS feeds, parse XML, classify, geolocate, cluster, deduplicate events
- Location: `src/services/ingestionEngine.js` (orchestrator)
- Contains: Pipeline orchestration, XML parsing, proxy fallback logic, demo data generation
- Depends on: `sourceRegistry.js`, `eventModel.js`, `geolocation.js`, `classifier.js`, `clustering.js`, `archiveDb.js`
- Used by: `App.jsx` via `ingestAll()`

**Domain Model Layer:**
- Purpose: Canonical event schema, taxonomy constants (12 categories, 12 regions, severity/confidence/status enums)
- Location: `src/services/eventModel.js`
- Contains: Factory functions `createEvent()`, `createSource()`, enums (SEVERITY, SOURCE_TIERS, CONFIDENCE, EVENT_STATUS, LOCATION_CONFIDENCE), taxonomy arrays (REGIONS, CATEGORIES, SECONDARY_TAGS)
- Depends on: `uuid` package
- Used by: Every other service and most components

**Classification Layer:**
- Purpose: Keyword-based event classification, severity scoring, tag extraction, confidence assessment
- Location: `src/services/classifier.js`
- Contains: Category rules (weighted keyword matching), severity indicators, tag extraction rules
- Depends on: `eventModel.js` (enums)
- Used by: `ingestionEngine.js`

**Geolocation Layer:**
- Purpose: Resolve text mentions to geographic coordinates using entity dictionaries
- Location: `src/services/geolocation.js`
- Contains: Country/city/institution/waterway coordinate dictionaries, resolution hierarchy (waterway -> institution -> city -> country)
- Depends on: `eventModel.js` (LOCATION_CONFIDENCE enum)
- Used by: `ingestionEngine.js`

**Clustering Layer:**
- Purpose: Group related articles about the same real-world event, deduplicate
- Location: `src/services/clustering.js`
- Contains: Jaccard word similarity, Union-Find clustering, canonical event selection, source merging
- Depends on: Nothing (pure logic)
- Used by: `ingestionEngine.js`

**Source Registry:**
- Purpose: Define all RSS feed sources across 4 tiers (Official, Reputable, Discovery, Market)
- Location: `src/services/sourceRegistry.js`
- Contains: 22+ active feeds, missing source report, feed lookup helpers
- Depends on: `eventModel.js` (SOURCE_TIERS)
- Used by: `ingestionEngine.js`

**Persistence Layer:**
- Purpose: IndexedDB event archive with full lifecycle tracking
- Location: `src/services/archiveDb.js`
- Contains: Dexie.js database schema, CRUD operations, event log, statistics, pagination, purge
- Depends on: `dexie` package
- Used by: `ingestionEngine.js` (write), `ArchivePage` (read)

**Contextual Data Layer:**
- Purpose: Fetch macro indicators from open APIs, match them to events, produce chart-ready data
- Location: `src/services/contextDataService.js`, `src/services/dataApis.js`, `src/services/indicatorCatalog.js`
- Contains: 200+ indicator definitions, smart matching algorithm, World Bank/FRED/OWID fetchers, in-memory cache (30 min TTL), data citation extraction
- Depends on: External APIs (World Bank, FRED, OWID, Alpha Vantage, Finnhub, Twelve Data, Marketaux, NewsAPI)
- Used by: Components that display contextual data (EventDetailPanel, MarketsView)

**Content Generation Layer:**
- Purpose: Template-based content production (social posts, video scripts, threads, newsletters, analytical briefs)
- Location: `src/services/contentGenerator.js`, `src/services/briefGenerator.js`, `src/services/summaryEngine.js`
- Contains: Multi-tone (analyst/casual/hot-take) generators, severity-based progressive disclosure, category-specific templates
- Depends on: `eventModel.js`
- Used by: `ContentStudio` component, `EventDetailPanel`

**Strategic Data Layer:**
- Purpose: Static geographic reference data for map overlays
- Location: `src/services/strategicData.js`
- Contains: Strategic waterway coordinates (13), major port locations (18), dataset-required layer definitions (11)
- Depends on: Nothing
- Used by: `MapPage`

**Edge Worker (Cloudflare):**
- Purpose: Server-side RSS fetching (bypass CORS), API key proxying (FRED, Finnhub, World Bank, Marketaux)
- Location: `workers/rss-proxy/`
- Contains: RSS/Atom parsing via regex, feed aggregation, response caching (10 min TTL), API proxy routes
- Depends on: Cloudflare Workers runtime, Wrangler CLI
- Used by: Frontend via `VITE_WORKER_URL` environment variable

**Legacy Layer (deprecated):**
- Purpose: Original feed service before the v5 ingestion engine rewrite
- Location: `src/services/feedService.js`
- Contains: Simpler classification, flat event model, same proxy/demo pattern
- Depends on: Nothing imports it
- Used by: Nothing (superseded by `ingestionEngine.js`)

## Data Flow

**Primary Ingestion Pipeline:**

1. `App.jsx` calls `ingestAll()` on mount and every 10 minutes
2. `ingestionEngine.js` tries Cloudflare Worker first (`/api/feeds`)
3. If worker unavailable, falls back to CORS proxy chain (3 proxies tried per feed)
4. If all feeds fail, generates curated demo data (16 events)
5. Raw items are enriched: `createSource()` -> `geolocateEvent()` -> `classifyCategory()` -> `extractTags()` -> `classifySeverity()` -> `classifyConfidence()` -> `createEvent()`
6. Events are clustered via Union-Find with Jaccard similarity (threshold 0.35)
7. Clusters are deduplicated: highest severity/most sources becomes canonical representative, sources merged
8. Deduplicated events stored to IndexedDB archive (non-blocking)
9. Events returned to `App.jsx` -> set in `useState` -> filtered by `useMemo` -> passed to routes

**State Management:**

- Global state lives in `App.jsx` via `useState`: `events`, `loading`, `error`, `filters`, `selectedEvent`, `lastUpdated`, `filtersOpen`
- Filtering is computed via `useMemo` in `App.jsx` and passed as `filteredEvents` to all page routes
- Event selection is managed via callbacks (`onSelectEvent`, `onClose`) prop-drilled to pages
- No Context API, no Redux, no Zustand
- Archive page has its own local state for IndexedDB queries

**Contextual Data Flow (on demand):**

1. Component calls `fetchContextData(item)` with an event
2. `indicatorCatalog.js` scores 200+ indicators against event tags/category/region
3. Top-ranked indicators are fetched in parallel from World Bank, FRED, or OWID
4. Results cached in-memory for 30 minutes
5. Returns chart-ready time series data

## Key Abstractions

**Event (canonical data model):**
- Purpose: Every piece of intelligence flowing through the system
- Examples: `src/services/eventModel.js` -> `createEvent()`
- Pattern: Factory function producing a flat object with UUID, content fields, severity/confidence, temporal fields, geographic fields, classification fields, lifecycle fields

**Source (provenance tracking):**
- Purpose: Track where each piece of information came from
- Examples: `src/services/eventModel.js` -> `createSource()`
- Pattern: Factory function with name, URL, tier, timestamps

**Feed (RSS source definition):**
- Purpose: Define an RSS feed to ingest from
- Examples: `src/services/sourceRegistry.js` -> `ACTIVE_FEEDS`
- Pattern: Object with name, URL, tier, region, defaultCategory, pollMinutes

**Indicator (macro data definition):**
- Purpose: Define a fetchable economic indicator with matching tags
- Examples: `src/services/indicatorCatalog.js` -> `INDICATOR_CATALOG` (200+ entries)
- Pattern: Object with id, name, source, fetchKey, unit, chartType, tags array for matching

## Entry Points

**Browser Entry:**
- Location: `index.html` -> `src/main.jsx`
- Triggers: Page load
- Responsibilities: Mount React app inside `HashRouter` (GitHub Pages compatible)

**Application Shell:**
- Location: `src/App.jsx`
- Triggers: Mounted by `main.jsx`
- Responsibilities: Data loading (ingestion engine), global state, filtering, routing, layout (Header + Navigation + FilterBar + Routes + EventDetailPanel + Toast)

**Ingestion Engine:**
- Location: `src/services/ingestionEngine.js` -> `ingestAll()`
- Triggers: App mount, 10-minute interval
- Responsibilities: Full pipeline: fetch -> enrich -> cluster -> deduplicate -> archive -> return

**Cloudflare Worker:**
- Location: `workers/rss-proxy/src/index.js`
- Triggers: HTTP requests to worker URL
- Responsibilities: Server-side RSS fetching, API key proxying, response caching

## Error Handling

**Strategy:** Graceful degradation with console warnings, never crash the UI

**Patterns:**
- **Ingestion:** `Promise.allSettled` for parallel feed fetches; failed feeds produce empty arrays, not errors. If zero events, falls back to demo data.
- **CORS proxies:** Sequential fallback through 3 proxies with 12s timeout each. Collect errors, throw only if all fail.
- **Worker:** Returns null on any failure, letting the frontend fall back to CORS proxies.
- **Archive writes:** Fire-and-forget with `.catch()` to avoid blocking the UI.
- **External APIs:** `safeCall()` wrapper catches all errors and returns null. Each API function guards on missing API keys.
- **UI:** Error state in `App.jsx` shows retry button. Loading skeleton on initial load.

## Cross-Cutting Concerns

**Logging:** `console.info` for ingestion stats, `console.warn` for non-critical failures, no structured logging framework.

**Validation:** No runtime schema validation. Factory functions provide defaults for all fields. No TypeScript (JSX only).

**Authentication:** None. All data sources are public RSS feeds or free-tier APIs with optional API keys.

**Caching:** In-memory Map cache in `contextDataService.js` (30 min TTL). Cloudflare Worker uses edge cache (`s-maxage=600`). No browser-level HTTP caching strategy.

**Routing:** HashRouter (`/#/path`) for GitHub Pages compatibility. 8 routes defined in `App.jsx`.

---

*Architecture analysis: 2026-03-07*
