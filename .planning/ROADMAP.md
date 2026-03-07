# Roadmap: Macro Intel v5.1

## Overview

Macro Intel v5.1 transforms the existing intelligence terminal from a read-only event dashboard into an enriched analytical platform. The work spans 6 phases: first cleaning up significant tech debt (1,373 lines of dead code, unused 3D dependencies, region misclassification), then layering on event enrichment (country-level context data, market instrument linking, lifecycle logging), enhancing the dashboard with preview widgets, and finally adding a dedicated Data Explorer page for browsing economic indicators.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Engineering Cleanup** - Remove dead code, fix bugs, improve polling, extract shared XML parsing
- [ ] **Phase 2: Context Engine** - Auto-attach country-level context data to events during ingestion
- [ ] **Phase 3: Market Linking** - Connect events to relevant market instruments based on category and country
- [ ] **Phase 4: Event Lifecycle** - Track and display event status changes and source additions over time
- [ ] **Phase 5: Dashboard Enhancements** - Add market snapshot and map preview widgets to the homepage
- [ ] **Phase 6: Data Explorer** - Dedicated page for browsing country-level economic indicators

## Phase Details

### Phase 1: Engineering Cleanup
**Goal**: The codebase is free of dead code, unused dependencies, and known bugs -- providing a clean, smaller foundation for all feature work that follows
**Depends on**: Nothing (first phase)
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04, ENG-05
**Success Criteria** (what must be TRUE):
  1. Production bundle no longer includes react-globe.gl or three.js code, and bundle size drops measurably
  2. Running a project-wide search for feedService, briefGenerator, GlobeView, DashboardView, ViewSwitcher, NewsList, or NewsCard returns zero results in src/
  3. IMF and World Bank feed events are classified to correct regions (not "Global Maritime / Strategic Waterways")
  4. News feeds poll at 10-minute intervals, official feeds at 15-minute intervals, and market data at 1-5 minute intervals (observable in console logs)
  5. XML parsing functions (stripHtml, getTagText, parseXml) exist in a single shared module with no duplication in browser-side code
**Plans**: TBD

Plans:
- [ ] 01-01: Dead code removal and dependency cleanup
- [ ] 01-02: Bug fixes, tiered polling, and XML extraction

### Phase 2: Context Engine
**Goal**: Events automatically display relevant country-level context (water stress, energy dependency, trade openness) with clear source attribution, giving the user immediate analytical depth without leaving the event view
**Depends on**: Phase 1
**Requirements**: CTX-01, CTX-02, CTX-03, CTX-04
**Success Criteria** (what must be TRUE):
  1. Opening an event about a specific country (e.g., "Turkey raises interest rates") shows structured context data relevant to that country in the EventDetailPanel
  2. Context data attaches automatically during ingestion without user action -- events arrive pre-enriched
  3. Every context data point displays its source (e.g., "World Bank 2023", "WRI Aqueduct") so the user knows where the number comes from
  4. Events that cannot be resolved to a specific country show no context section (graceful absence, not errors or empty boxes)
**Plans**: TBD

Plans:
- [ ] 02-01: Context data model and ingestion integration
- [ ] 02-02: EventDetailPanel context display

### Phase 3: Market Linking
**Goal**: Events display the market instruments they are most likely to affect, letting the user immediately understand the financial relevance of geopolitical developments
**Depends on**: Phase 2
**Requirements**: MKT-01, MKT-02, MKT-03
**Success Criteria** (what must be TRUE):
  1. Opening a "Central Banks" category event shows linked currency and bond instruments for the relevant country
  2. Opening an "Energy & Resources" category event shows linked commodity instruments (e.g., Brent Crude, Natural Gas)
  3. Market linking rules are defined per category so that adding or changing instrument mappings does not require code changes to the linking engine
  4. Linked instruments display on EventDetailPanel with instrument name and type (currency, commodity, index, bond)
**Plans**: TBD

Plans:
- [ ] 03-01: Market linking rules engine and EventDetailPanel integration

### Phase 4: Event Lifecycle
**Goal**: Users can trace how an event evolved over time -- when it was first ingested, when new sources confirmed it, when its severity changed -- providing an audit trail for intelligence analysis
**Depends on**: Phase 1
**Requirements**: LOG-01, LOG-02, LOG-03
**Success Criteria** (what must be TRUE):
  1. Opening an event in EventDetailPanel shows a chronological log of lifecycle entries (e.g., "Created from Reuters", "Source added: BBC News", "Severity upgraded to Major")
  2. Each log entry displays a timestamp and human-readable description of the change
  3. Event log entries persist across browser sessions via IndexedDB (closing and reopening the app preserves the log)
**Plans**: TBD

Plans:
- [ ] 04-01: Event log data model, archiveDb integration, and UI

### Phase 5: Dashboard Enhancements
**Goal**: The homepage dashboard provides at-a-glance market context and geographic awareness, reducing the need to navigate to separate pages for quick situational checks
**Depends on**: Phase 3 (market snapshot benefits from market linking)
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Dashboard shows a market snapshot widget displaying key market indicators (currencies, commodities, indices)
  2. Dashboard shows a small interactive map preview with markers for recent event locations
  3. Clicking the market snapshot navigates to the full Markets page, and clicking the map preview navigates to the full Map page
**Plans**: TBD

Plans:
- [ ] 05-01: Market snapshot and map preview widgets

### Phase 6: Data Explorer
**Goal**: Users can browse and search country-level economic indicators on a dedicated page, turning Macro Intel from a news terminal into an analytical research tool
**Depends on**: Phase 2 (uses context data infrastructure)
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04
**Success Criteria** (what must be TRUE):
  1. A "Data Explorer" link appears in the main navigation and routes to a dedicated page
  2. User can browse indicators organized by country and category (e.g., Turkey > Trade > Trade Openness)
  3. User can search for a country or indicator name and see filtered results
  4. Each indicator displays its value, unit, and source attribution (e.g., "GDP Growth: 4.2% -- World Bank 2023")
**Plans**: TBD

Plans:
- [ ] 06-01: Data Explorer page with search, filter, and source attribution

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

Note: Phase 4 depends on Phase 1 (not Phase 3), so it could theoretically run in parallel with Phases 2-3. However, sequential execution keeps the workflow simple for a solo developer.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Engineering Cleanup | 0/2 | Not started | - |
| 2. Context Engine | 0/2 | Not started | - |
| 3. Market Linking | 0/1 | Not started | - |
| 4. Event Lifecycle | 0/1 | Not started | - |
| 5. Dashboard Enhancements | 0/1 | Not started | - |
| 6. Data Explorer | 0/1 | Not started | - |

---
*Roadmap created: 2026-03-07*
