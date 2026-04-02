# Macro Intel

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed](https://img.shields.io/badge/Live-GitHub_Pages-brightgreen)](https://theshumba.github.io/macro-intel/)

**A real-time global macro intelligence dashboard.** Aggregates 30+ RSS feeds from central banks, international institutions, and news outlets, then classifies, geolocates, deduplicates, and visualises events on an interactive map with market data overlays.

[**Live Demo**](https://theshumba.github.io/macro-intel/)

---

## What It Does

Macro Intel ingests live data from the Federal Reserve, ECB, Bank of England, IMF, World Bank, OECD, US Treasury, and dozens of reputable news sources. Each item passes through a classification pipeline that assigns severity, category, region, confidence level, and geolocation -- then clusters related stories and merges duplicate reports from different outlets. The result is a single-pane-of-glass view of what is happening in the global economy right now.

## Features

- **Multi-source ingestion engine** -- 30+ feeds across 4 tiers (Official, Reputable, Discovery, Market) with tiered polling intervals
- **Automatic classification** -- severity scoring (Routine / Material / Major), 12 macro categories, 12 world regions, confidence tracking
- **Content fingerprinting and deduplication** -- same story from different sources gets merged, not duplicated
- **Interactive map** -- Leaflet-based with event markers, strategic waterway overlays, major port layers, and a timeline slider
- **Markets view** -- G20 macro table, live market instruments (equities, FX, commodities, crypto), BIS policy rates, Fear & Greed index
- **World Monitor** -- earthquakes, natural disasters, conflict, displacement, maritime, cyber threats, crypto markets, prediction markets
- **Data Explorer** -- country-level economic indicators from World Bank, WITS tariff data, UN Comtrade trade flows
- **Dashboard** -- regional breakdown, category heatmap, severity distribution, top market instruments, and a mini-map preview
- **Event detail panel** -- executive summary, linked context, market impact, source attribution with tier badges
- **Offline persistence** -- IndexedDB via Dexie.js for event archival and page-refresh resilience
- **Region & country drill-downs** -- dedicated pages for any region or country with filtered event streams
- **Content Studio** -- built-in intelligence brief generator for exporting analysis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Maps | Leaflet + React Leaflet |
| Charts | Recharts |
| Offline storage | Dexie.js (IndexedDB) |
| Data sources | FRED, World Bank, BIS, USGS, GDELT, ACLED, Yahoo Finance, CoinGecko, and more |
| Deployment | GitHub Pages |

## Screenshots

> To add screenshots, place them in a `docs/screenshots/` directory and update the paths below.

```
![Dashboard](docs/screenshots/dashboard.png)
![Map Explorer](docs/screenshots/map.png)
![Markets View](docs/screenshots/markets.png)
![World Monitor](docs/screenshots/world-monitor.png)
```

## Getting Started

```bash
# Clone
git clone https://github.com/theshumba/macro-intel.git
cd macro-intel

# Install dependencies
npm install

# Start dev server (port 5176)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Optional API Keys

The dashboard works out of the box with public APIs. For enhanced data coverage, add keys to a `.env` file:

```
VITE_FRED_API_KEY=       # FRED economic data
VITE_ALPHA_VANTAGE_KEY=  # Live market quotes
VITE_FINNHUB_KEY=        # Market data
VITE_TWELVE_DATA_KEY=    # Market data
VITE_MARKETAUX_KEY=      # News sentiment
VITE_NEWSAPI_KEY=        # News aggregation
```

## Architecture

```
src/
  services/
    sourceRegistry.js      # 30+ feed definitions across 4 tiers
    ingestionEngine.js     # Fetch, parse, classify, geolocate, cluster, deduplicate
    eventModel.js          # Canonical event schema, severity/confidence/category enums
    classifier.js          # Category, severity, and confidence classification
    geolocation.js         # Country/region inference and coordinate resolution
    clustering.js          # Event similarity scoring and cluster merging
    contextEngine.js       # Country-level indicator enrichment
    marketLinker.js        # Links events to affected market instruments
    archiveDb.js           # IndexedDB persistence layer (Dexie)
    worldMonitorApis.js    # 15+ global monitoring APIs (seismic, conflict, cyber, etc.)
    dataApis.js            # FRED, World Bank, Alpha Vantage, Finnhub integrations
    tradeApis.js           # WITS, UN Comtrade, UK Trade Tariff
  components/
    EventCard.jsx          # Severity-coded event cards with source badges
    EventDetailPanel.jsx   # Full event detail slide-out
    MarketsView.jsx        # G20 macro table + live market instruments
    BriefPanel.jsx         # Intelligence brief generator
    FilterBar.jsx          # Category, region, severity, date, search filters
    charts/                # MacroCard, MiniChart, SparkLine
  pages/
    DashboardPage.jsx      # Homepage with regional + category breakdowns
    MapPage.jsx            # Leaflet map with layer controls and timeline
    WorldMonitorPage.jsx   # Natural events, conflict, cyber, maritime, crypto
    DataExplorerPage.jsx   # Country-level indicator browser + trade data
    ArchivePage.jsx        # Historical event archive from IndexedDB
    RegionPage.jsx         # Per-region event stream
    CountryPage.jsx        # Per-country event stream
    ThemePage.jsx          # Per-category event stream
```

The ingestion pipeline runs entirely client-side: RSS feeds are fetched through CORS proxies, parsed from XML, classified by a rule-based engine, geolocated to one of 12 world regions, deduplicated via content fingerprinting, and stored in IndexedDB. Tiered polling (10-minute and 15-minute intervals) keeps the feed current without hammering sources.

## License

MIT
