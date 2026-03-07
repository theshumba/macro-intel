# Requirements: Macro Intel v5.1

**Defined:** 2026-03-07
**Core Value:** Deliver real-time, severity-ranked intelligence on global macroeconomic and geopolitical events with honest source attribution and no jargon.

## v1 Requirements

### Context Engine

- [x] **CTX-01**: Events display relevant country-level context data (water stress, energy dependency, trade openness) when available
- [x] **CTX-02**: Context data is auto-attached during ingestion based on event's primary country
- [x] **CTX-03**: Context data source is clearly attributed (World Bank, WRI Aqueduct, etc.)
- [x] **CTX-04**: EventDetailPanel shows structured context section for events with context data

### Market Linking

- [x] **MKT-01**: Events are linked to relevant market instruments (currencies, commodities, indices, bonds) based on category and country
- [x] **MKT-02**: Linked instruments display on EventDetailPanel with instrument name and type
- [x] **MKT-03**: Market linking rules are configurable per category (e.g., "Central Banks" links to currency + bond instruments)

### Data Explorer

- [x] **EXP-01**: User can browse country-level economic indicators on a dedicated Data Explorer page
- [x] **EXP-02**: User can search and filter indicators by country and category
- [x] **EXP-03**: Data Explorer shows indicator values with source attribution
- [x] **EXP-04**: Data Explorer is accessible from main navigation

### Event Log

- [x] **LOG-01**: User can view event lifecycle history (status changes, source additions) in EventDetailPanel
- [x] **LOG-02**: Event log entries show timestamp and change description
- [x] **LOG-03**: Archive stores event log entries via existing archiveDb infrastructure

### Dashboard Enhancements

- [x] **DASH-01**: Dashboard shows a market snapshot widget with key market indicators
- [x] **DASH-02**: Dashboard shows a small interactive map preview widget with recent event locations
- [x] **DASH-03**: Market snapshot and map preview link to their full pages

### Engineering Cleanup

- [x] **ENG-01**: Dead code removed — feedService.js, briefGenerator.js, GlobeView.jsx, DashboardView.jsx, ViewSwitcher.jsx, NewsList.jsx, NewsCard.jsx
- [x] **ENG-02**: Unused dependencies removed from package.json (react-globe.gl, three)
- [x] **ENG-03**: IMF/World Bank region misclassification fixed in sourceRegistry.js
- [x] **ENG-04**: Tiered polling intervals implemented (10min news, 15min official, 1-5min market)
- [x] **ENG-05**: XML parsing extracted to shared module to eliminate duplication

## v2 Requirements

### Future Layers
- **FUT-01**: Pipeline route geometry on map
- **FUT-02**: Undersea cable routes on map
- **FUT-03**: Military bases layer
- **FUT-04**: Nuclear sites layer
- **FUT-05**: AI/semiconductor hub layer

### Advanced Intelligence
- **ADV-01**: AI-powered event summarization
- **ADV-02**: Predictive severity scoring
- **ADV-03**: Cross-event correlation analysis

## Out of Scope

| Feature | Reason |
|---------|--------|
| 3D globe | Replaced with 2D Leaflet — performance, bundle size |
| User accounts | Single-user terminal, no auth needed |
| Backend server | Static hosting on GitHub Pages |
| Real-time WebSocket | GitHub Pages constraint |
| Paid data APIs | Free/public sources only |
| Mobile app | Web-first, responsive design sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENG-01 | Phase 1 | Complete |
| ENG-02 | Phase 1 | Complete |
| ENG-03 | Phase 1 | Complete |
| ENG-04 | Phase 1 | Complete |
| ENG-05 | Phase 1 | Complete |
| CTX-01 | Phase 2 | Complete |
| CTX-02 | Phase 2 | Complete |
| CTX-03 | Phase 2 | Complete |
| CTX-04 | Phase 2 | Complete |
| MKT-01 | Phase 3 | Complete |
| MKT-02 | Phase 3 | Complete |
| MKT-03 | Phase 3 | Complete |
| LOG-01 | Phase 4 | Complete |
| LOG-02 | Phase 4 | Complete |
| LOG-03 | Phase 4 | Complete |
| DASH-01 | Phase 5 | Complete |
| DASH-02 | Phase 5 | Complete |
| DASH-03 | Phase 5 | Complete |
| EXP-01 | Phase 6 | Complete |
| EXP-02 | Phase 6 | Complete |
| EXP-03 | Phase 6 | Complete |
| EXP-04 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 22 total
- Complete: 22
- Remaining: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 — all v1 requirements complete*
