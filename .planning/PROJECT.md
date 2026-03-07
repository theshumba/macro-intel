# Macro Intel

## What This Is

A live macroeconomic and geopolitical intelligence terminal that aggregates news from tiered sources (official institutions, reputable outlets, discovery feeds), classifies events by severity/category/region, clusters duplicates, geolocates to a 2D interactive map, and presents plain-English intelligence summaries. Built as a React SPA deployed to GitHub Pages.

## Core Value

Deliver real-time, severity-ranked intelligence on global macroeconomic and geopolitical events with honest source attribution and no jargon — a single dashboard that replaces scanning 20+ news sources.

## Requirements

### Validated

- ✓ 4-tier source hierarchy (Official/Reputable/Discovery/Market) — v5
- ✓ 12-category event taxonomy — v5
- ✓ 12-region geopolitical framework — v5
- ✓ 3-tier severity model (Routine/Material/Major) — v5
- ✓ Event clustering via Union-Find with Jaccard similarity — v5
- ✓ Keyword-based classification, severity scoring, tag extraction — v5
- ✓ Entity-based geolocation (countries, institutions, waterways, cities) — v5
- ✓ Plain-English severity-based summaries — v5
- ✓ IndexedDB persistent archive with search/filter/pagination — v5
- ✓ 2D Leaflet map with event markers, strategic waterways, major ports — v5
- ✓ Multi-page routing: Dashboard, Events, Map, Markets, Archive — v5
- ✓ Region, Country, Theme drill-down pages with cross-linking — v5
- ✓ RSS ingestion via Cloudflare Worker with CORS proxy fallback — v5
- ✓ Strategic data layers with "dataset required" flags — v5
- ✓ Source lineage preservation on every event — v5

### Active

- [ ] Context engine — auto-attach structured context to events (water stress, energy dependency, trade openness, shipping exposure, sanctions risk)
- [ ] Market linking — connect events to relevant market instruments (currencies, commodities, indices, bonds)
- [ ] Data Explorer page — browse economic indicators and country-level data
- [ ] Event log UI — display event lifecycle changes (status transitions, source additions)
- [ ] Dashboard market snapshot — key market data widget on homepage
- [ ] Dashboard map preview — small interactive map widget on homepage
- [ ] Tiered polling intervals — 10min news, 15min official, 1-5min market data
- [ ] Dead code cleanup — remove legacy feedService.js, briefGenerator.js, GlobeView, unused components
- [ ] Fix IMF/World Bank region misclassification in sourceRegistry.js

### Out of Scope

- 3D globe (replaced with 2D Leaflet, react-globe.gl is dead code) — performance, bundle size
- Real-time WebSocket feeds — GitHub Pages static hosting constraint
- User accounts / authentication — single-user intelligence terminal
- Backend server — pure SPA with edge worker for RSS proxy
- AI/LLM-powered summarization — keyword-based classification is sufficient for v5

## Context

- Deployed to GitHub Pages: https://theshumba.github.io/macro-intel/
- React 19 + Vite 7 + Tailwind CSS v4 + Recharts + Leaflet
- HashRouter for GitHub Pages compatibility
- Cloudflare Worker at `macro-intel-rss.theshumba.workers.dev` for RSS proxy
- 22+ RSS feeds across 4 tiers in sourceRegistry.js
- 80+ countries, 25+ institutions, 18 waterways, 20 cities in geolocation engine
- ~980KB production bundle (down from 2,561KB after removing 3D globe)
- Significant dead code: ~1,373 lines in feedService.js + briefGenerator.js, plus 5 unused components

## Constraints

- **Hosting**: GitHub Pages (static only, no server-side logic)
- **Data**: RSS feeds + public APIs only (no paid data subscriptions)
- **Bundle**: Keep under 1.5MB, avoid heavy 3D libraries
- **Tech stack**: React 19, Vite 7, Tailwind CSS v4 (already established)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 2D Leaflet over 3D globe | 62% smaller bundle, better UX for data density | ✓ Good |
| HashRouter over BrowserRouter | GitHub Pages has no server-side routing | ✓ Good |
| Client-side NLP over server LLM | No backend needed, works on static hosting | ✓ Good |
| Dexie.js for archive | IndexedDB wrapper, persistent across sessions | ✓ Good |
| Union-Find clustering | Efficient O(n²) dedup without external service | ✓ Good |
| Demo data fallback | App works even when RSS feeds fail | ✓ Good |

---
*Last updated: 2026-03-07 after v5 refactor completion*
