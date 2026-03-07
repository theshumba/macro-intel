---
phase: 01-engineering-cleanup
plan: 02
subsystem: ingestion
tags: [xml-parsing, polling, rss, dom-parser, feed-ingestion]

# Dependency graph
requires:
  - phase: none
    provides: existing ingestionEngine.js with inline XML parsing
provides:
  - Shared xmlParser.js module (stripHtml, getTagText, parseXml)
  - Tiered polling via ingestByPollInterval(maxPollMinutes)
  - Merge strategy for incremental event updates by eventId
affects: [02-context-engine, data-explorer, any future feed/polling work]

# Tech tracking
tech-stack:
  added: []
  patterns: [shared-module-extraction, tiered-polling, event-merge-by-id]

key-files:
  created:
    - src/services/xmlParser.js
  modified:
    - src/services/ingestionEngine.js
    - src/App.jsx

key-decisions:
  - "XML parsing extracted to standalone module; Worker regex-based parser intentionally kept separate (no DOMParser in Workers)"
  - "Tiered polling uses separate setInterval per tier rather than a single smart scheduler -- simpler, no added dependency"
  - "Merge strategy uses Map keyed by eventId -- updates existing events, appends new ones, no redundant re-dedup"

patterns-established:
  - "Shared module extraction: browser-side utilities in src/services/ as named exports"
  - "Tiered polling: ingestByPollInterval(minutes) filters feeds by pollMinutes, merges results into state"

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 1 Plan 2: XML Parser Extraction + Tiered Polling Summary

**Shared xmlParser.js module eliminating duplicate XML parsing, plus tiered feed polling (10min news, 15min official) with eventId-based merge strategy**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T01:30:21Z
- **Completed:** 2026-03-07T01:32:49Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extracted stripHtml, getTagText, parseXml into shared src/services/xmlParser.js module
- Removed duplicate XML parsing from ingestionEngine.js, replaced with import
- Implemented ingestByPollInterval() for tiered feed refresh (worker-path filtering + CORS-proxy-path selective fetch)
- Replaced single 10-min refresh in App.jsx with tiered intervals: 10min (news) + 15min (official)
- Added mergeEvents() callback using Map-based eventId merge for incremental updates
- Architecture ready for future market tier (1-5 min) with placeholder comment

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract XML parsing to shared module** - `71d0a6e` (refactor)
2. **Task 2: Implement tiered polling intervals** - `050dfbc` (feat)

## Files Created/Modified
- `src/services/xmlParser.js` - Shared browser-side XML parsing module (stripHtml, getTagText, parseXml)
- `src/services/ingestionEngine.js` - Removed inline XML parsing, added import, added ingestByPollInterval()
- `src/App.jsx` - Tiered polling with mergeEvents callback, 10min + 15min intervals, market tier placeholder

## Decisions Made
- Kept Worker regex-based parser separate from browser DOMParser-based xmlParser.js (Workers lack DOMParser)
- Used separate setInterval per tier instead of a smart scheduler -- simpler approach, no additional dependencies
- Merge strategy uses Map keyed on eventId -- avoids redundant deduplication since ingestByPollInterval already deduplicates internally
- Worker path filters by source name after full fetch (worker always fetches all feeds); CORS path only fetches eligible feeds

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- XML parsing consolidated -- safe to modify parsing logic in one place
- Tiered polling active -- sourceRegistry pollMinutes values now drive actual refresh rates
- Ready for Phase 2 (Context Engine) which will build on ingestion pipeline
- Known concern: Worker feed list (8 feeds) still out of sync with sourceRegistry (22+ feeds) -- not in scope but will matter when worker is updated

## Self-Check: PASSED

All files exist. All commits verified.

---
*Phase: 01-engineering-cleanup*
*Completed: 2026-03-07*
