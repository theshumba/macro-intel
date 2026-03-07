# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
macro-intel/
├── src/                    # Application source code
│   ├── assets/             # Static assets (currently empty)
│   ├── components/         # Reusable UI components
│   │   └── charts/         # Chart-specific components (MacroCard, MiniChart, SparkLine)
│   ├── pages/              # Route-level page components
│   ├── services/           # Business logic, data fetching, classification, models
│   ├── main.jsx            # Application entry point (React root + HashRouter)
│   ├── App.jsx             # Application shell (state, routing, layout)
│   └── index.css           # Global styles (Tailwind import + custom animations)
├── workers/                # Edge infrastructure
│   └── rss-proxy/          # Cloudflare Worker for RSS fetching + API proxying
│       ├── src/
│       │   └── index.js    # Worker handler
│       ├── wrangler.toml   # Worker config
│       └── package.json    # Worker dependencies (wrangler)
├── docs/                   # Design documents and plans
│   └── plans/              # Architecture decision records
├── dist/                   # Build output (Vite)
├── .planning/              # GSD workflow files
│   ├── codebase/           # Codebase analysis documents (this file)
│   └── phases/             # Phase planning documents
├── index.html              # HTML shell (Vite entry)
├── vite.config.js          # Vite config (React plugin, Tailwind, base path, port 5176)
├── eslint.config.js        # ESLint config
├── package.json            # Dependencies and scripts
└── package-lock.json       # Lockfile
```

## Directory Purposes

**`src/`:**
- Purpose: All frontend application code
- Contains: JSX components, service modules, CSS
- Key files: `main.jsx` (entry), `App.jsx` (shell), `index.css` (global styles)

**`src/pages/`:**
- Purpose: One component per route, each receives props from `App.jsx`
- Contains: 8 page components
- Key files:
  - `DashboardPage.jsx`: Homepage with stats, major events, official statements, regional/category breakdowns
  - `EventsPage.jsx`: Full event grid with filtering
  - `MapPage.jsx`: Leaflet 2D map with event markers, waterways, ports, layer toggles, timeline slider
  - `MarketsPage.jsx`: Market monitor (wraps MarketsView component)
  - `ArchivePage.jsx`: IndexedDB-backed searchable event history with pagination
  - `RegionPage.jsx`: Filtered view for a single geopolitical region (`/region/:region`)
  - `CountryPage.jsx`: Filtered view for a single country (`/country/:country`)
  - `ThemePage.jsx`: Filtered view by category/theme (`/theme/:category`)

**`src/components/`:**
- Purpose: Reusable UI elements composed by pages
- Contains: 15 component files
- Key files:
  - `EventCard.jsx`: Severity-based event card (routine/material/major progressive disclosure)
  - `EventDetailPanel.jsx`: Slide-in panel with full event detail, uses `summaryEngine.js`
  - `Navigation.jsx`: Desktop horizontal nav + mobile bottom tab bar (NavLink-based)
  - `Header.jsx`: Top bar with branding, event count, refresh button, last-updated timestamp
  - `FilterBar.jsx`: Category/region/severity/dateRange/search filters
  - `GlobeView.jsx`: 3D globe view using react-globe.gl
  - `MarketsView.jsx`: Market data display with charts
  - `ContentStudio.jsx`: Multi-format content generator UI (social, scripts, threads, newsletters)
  - `BriefPanel.jsx`: Analytical brief display (older, uses briefGenerator.js)
  - `Toast.jsx`: Notification toast system
  - `ViewSwitcher.jsx`: View mode toggle
  - `NewsList.jsx`, `NewsCard.jsx`: Older news display components
  - `CategoryBadge.jsx`, `ImpactBadge.jsx`: Small badge components
  - `TimelineView.jsx`: Chronological event timeline

**`src/components/charts/`:**
- Purpose: Chart components for data visualization
- Contains: 3 chart components
- Key files:
  - `MacroCard.jsx`: Macro indicator card with Recharts chart
  - `MiniChart.jsx`: Small inline chart for compact display
  - `SparkLine.jsx`: Sparkline chart component

**`src/services/`:**
- Purpose: All business logic, data models, external API integrations, NLP processing
- Contains: 14 service modules (no classes, all functional exports)
- Key files:
  - `ingestionEngine.js`: Main pipeline orchestrator (`ingestAll()` is the single entry point)
  - `eventModel.js`: Canonical data model, factory functions, all taxonomy constants
  - `sourceRegistry.js`: 22+ RSS feed definitions across 4 tiers
  - `classifier.js`: Category classification, severity scoring, tag extraction, confidence assessment
  - `geolocation.js`: Text-to-coordinates resolution (90+ countries, 20+ cities, 20+ institutions, 15+ waterways)
  - `clustering.js`: Jaccard similarity clustering + Union-Find deduplication
  - `archiveDb.js`: Dexie.js IndexedDB wrapper (events table + eventLog table)
  - `contextDataService.js`: Smart indicator matching + parallel API fetching + caching
  - `dataApis.js`: API client functions for World Bank, FRED, OWID, Alpha Vantage, Finnhub, Twelve Data, Marketaux, NewsAPI, DB.nomics
  - `indicatorCatalog.js`: 200+ indicator definitions with tag-based matching
  - `strategicData.js`: Static waterway/port/layer data for map overlays
  - `summaryEngine.js`: Severity-based event summarization (plain English)
  - `contentGenerator.js`: Multi-tone, multi-format content generation (social, scripts, threads, newsletters)
  - `briefGenerator.js`: Analytical macro briefing generator (template-based)
  - `feedService.js`: **Legacy** - original feed service, superseded by `ingestionEngine.js`

**`workers/rss-proxy/`:**
- Purpose: Cloudflare Worker that fetches RSS feeds server-side and proxies API requests
- Contains: Worker source, config, package
- Key files:
  - `src/index.js`: Request handler with RSS aggregation + API proxy routes (`/api/feeds`, `/api/fred/:id`, `/api/finnhub/:endpoint`, `/api/worldbank/:indicator`, `/api/marketaux`)
  - `wrangler.toml`: Worker name, compatibility date, CACHE_TTL var, secret references

**`docs/plans/`:**
- Purpose: Design documents for features
- Contains: 2 design documents
- Key files:
  - `2026-03-05-content-engine-ui-polish-design.md`
  - `2026-03-05-contextual-data-engine-design.md`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell, loads `src/main.jsx`
- `src/main.jsx`: React root mount with HashRouter
- `src/App.jsx`: Application shell (state, routing, data loading, layout)

**Configuration:**
- `vite.config.js`: Vite build config (React, Tailwind, base: `/macro-intel/`, port: 5176)
- `eslint.config.js`: ESLint rules
- `package.json`: Dependencies and scripts (`dev`, `build`, `lint`, `preview`)
- `workers/rss-proxy/wrangler.toml`: Cloudflare Worker config

**Core Logic:**
- `src/services/ingestionEngine.js`: Main data pipeline
- `src/services/eventModel.js`: Canonical data model and constants
- `src/services/classifier.js`: Event classification engine
- `src/services/geolocation.js`: Geographic resolution engine
- `src/services/clustering.js`: Event clustering and deduplication

**Data Access:**
- `src/services/archiveDb.js`: IndexedDB persistence via Dexie
- `src/services/dataApis.js`: External API client functions
- `src/services/contextDataService.js`: Contextual data orchestration with caching
- `src/services/indicatorCatalog.js`: Indicator definitions and matching logic

**Content Generation:**
- `src/services/contentGenerator.js`: Multi-format social/video content
- `src/services/briefGenerator.js`: Analytical brief generator
- `src/services/summaryEngine.js`: Event summarization

**Styling:**
- `src/index.css`: Tailwind import + 12 custom keyframe animations + scrollbar/tooltip overrides

## Naming Conventions

**Files:**
- Pages: `PascalCase` + `Page.jsx` suffix (e.g., `DashboardPage.jsx`, `RegionPage.jsx`)
- Components: `PascalCase.jsx` (e.g., `EventCard.jsx`, `Navigation.jsx`)
- Services: `camelCase.js` (e.g., `ingestionEngine.js`, `eventModel.js`)
- All source files use `.jsx` for React components, `.js` for pure logic

**Directories:**
- Lowercase, singular or descriptive (e.g., `pages/`, `components/`, `services/`, `charts/`)

**Functions:**
- `camelCase` for all functions and variables
- Factory functions: `createEvent()`, `createSource()`
- Fetch functions: `fetchWorldBank()`, `fetchFRED()`, `fetchContextData()`
- Classification: `classifyCategory()`, `classifySeverity()`, `extractTags()`
- Generators: `generateContent()`, `generateBrief()`, `generateSummary()`

**Constants:**
- `UPPER_SNAKE_CASE` for enums and configuration objects: `SEVERITY`, `SOURCE_TIERS`, `CATEGORIES`, `REGIONS`, `ACTIVE_FEEDS`, `INDICATOR_CATALOG`
- `camelCase` for keyword arrays and rule objects within services

**Components:**
- `PascalCase` for component names matching filenames
- Props use `camelCase`: `onSelectEvent`, `selectedEventId`, `filtersOpen`

## Where to Add New Code

**New Page/Route:**
- Create page component: `src/pages/NewFeaturePage.jsx`
- Add route in `src/App.jsx` inside `<Routes>`
- Add nav item in `src/components/Navigation.jsx` -> `NAV_ITEMS` array
- Page receives `events`, `onSelectEvent`, `selectedEventId` via props from App

**New Component:**
- Create in `src/components/NewComponent.jsx`
- Chart components go in `src/components/charts/`
- Import and use from pages or other components

**New Service/Business Logic:**
- Create in `src/services/newService.js`
- Export functions (no classes). Follow functional pattern.
- If it extends the ingestion pipeline, wire it into `src/services/ingestionEngine.js`
- If it's a new data source, add fetch function to `src/services/dataApis.js`

**New RSS Feed Source:**
- Add feed object to `src/services/sourceRegistry.js` in the appropriate tier array (`TIER_1_FEEDS`, `TIER_2_FEEDS`, `TIER_3_FEEDS`)
- Ensure `url` is set and `implemented` is not `false` for it to be included in `ACTIVE_FEEDS`
- Also add to `workers/rss-proxy/src/index.js` `FEEDS` array if it should be fetched server-side

**New Macro Indicator:**
- Add indicator definition to `src/services/indicatorCatalog.js` in the appropriate array (`WB`, `FRED`, or `OWID`)
- Include relevant `tags` for matching

**New Category or Region:**
- Add to `CATEGORIES` and/or `REGIONS` arrays in `src/services/eventModel.js`
- Add classification rules in `src/services/classifier.js` -> `CATEGORY_RULES`
- Update `CATEGORIES_COMPAT` and `REGIONS_COMPAT` exports in `src/services/ingestionEngine.js`

**New External API Integration:**
- Add fetch function to `src/services/dataApis.js`
- Use env var for API key: `import.meta.env.VITE_NEW_API_KEY`
- Add catalog entry to `API_CATALOG` in `dataApis.js`
- Optionally add proxy route to `workers/rss-proxy/src/index.js` for server-side key protection

**New Map Layer:**
- Add static data to `src/services/strategicData.js`
- Add layer toggle in `src/pages/MapPage.jsx`
- Add to `getMapLayers()` return object in `strategicData.js`

**Utilities:**
- No dedicated utils directory. Helper functions live in the service that uses them.
- Shared across services: only `eventModel.js` constants are shared; everything else is self-contained.

## Special Directories

**`dist/`:**
- Purpose: Vite build output for GitHub Pages deployment
- Generated: Yes (via `npm run build`)
- Committed: Yes (for GitHub Pages)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: GSD workflow planning documents
- Generated: By Claude during planning sessions
- Committed: Yes

**`docs/plans/`:**
- Purpose: Feature design documents
- Generated: Manually authored
- Committed: Yes

**`workers/rss-proxy/`:**
- Purpose: Independently deployable Cloudflare Worker
- Generated: No (manually authored)
- Committed: Yes
- Has its own `package.json` and `node_modules`
- Deploy: `cd workers/rss-proxy && npx wrangler deploy`

**`public/`:**
- Purpose: Static assets served as-is by Vite
- Generated: No
- Committed: Yes
- Currently empty

---

*Structure analysis: 2026-03-07*
