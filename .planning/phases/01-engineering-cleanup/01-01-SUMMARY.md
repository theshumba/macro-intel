---
phase: 01-engineering-cleanup
plan: 01
subsystem: codebase
tags: [dead-code, tree-shaking, react-globe.gl, three.js, source-registry, region-classification]

# Dependency graph
requires: []
provides:
  - Clean codebase with zero dead code files
  - Correct IMF/World Bank region classification ('Global')
  - Reduced dependency footprint (43 npm packages removed)
affects: [02-context-engine, 03-market-linking, 06-data-explorer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dead code identified by tracing import chains from App.jsx entry point

key-files:
  created: []
  modified:
    - package.json (removed react-globe.gl, three)
    - src/services/sourceRegistry.js (IMF/World Bank region fix)
    - src/services/ingestionEngine.js (removed dead code comment reference)
    - src/services/summaryEngine.js (removed dead code comment reference)

key-decisions:
  - "Set IMF/World Bank region to 'Global' as fallback default -- geolocation engine resolves specific regions from content"
  - "Removed comment references to deleted files to satisfy zero-reference requirement"

patterns-established:
  - "Import chain analysis: trace from App.jsx to identify unused modules before deletion"

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 1 Plan 1: Dead Code Removal and Region Fix Summary

**Deleted 7 dead files (2,487 lines), removed react-globe.gl/three (43 npm packages), and fixed IMF/World Bank misclassification from maritime to Global**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T01:30:15Z
- **Completed:** 2026-03-07T01:33:00Z
- **Tasks:** 2
- **Files modified:** 11 (7 deleted, 4 modified)

## Accomplishments
- Deleted 7 dead code files: feedService.js (938 lines), briefGenerator.js (435 lines), GlobeView.jsx, DashboardView.jsx, ViewSwitcher.jsx, NewsList.jsx, NewsCard.jsx
- Removed react-globe.gl and three from dependencies, eliminating 43 npm packages from node_modules
- Fixed IMF and World Bank region from 'Global Maritime / Strategic Waterways' to 'Global'
- CSS bundle reduced from 74.74 kB to 71.62 kB (3.12 kB savings)

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete dead code files and remove unused dependencies** - `97772e5` (chore)
2. **Task 2: Fix IMF and World Bank region misclassification** - `97a9f56` (fix)

## Files Created/Modified
- `src/services/feedService.js` - DELETED (938-line old feed service superseded by ingestionEngine)
- `src/services/briefGenerator.js` - DELETED (435-line old brief generator superseded by summaryEngine)
- `src/components/GlobeView.jsx` - DELETED (3D globe using react-globe.gl, never rendered)
- `src/components/DashboardView.jsx` - DELETED (old dashboard, never imported)
- `src/components/ViewSwitcher.jsx` - DELETED (unused view toggle)
- `src/components/NewsList.jsx` - DELETED (orphaned list component)
- `src/components/NewsCard.jsx` - DELETED (only used by dead NewsList)
- `package.json` - Removed react-globe.gl and three dependencies
- `src/services/sourceRegistry.js` - IMF and World Bank region corrected to 'Global'
- `src/services/ingestionEngine.js` - Updated header comment (removed dead code reference)
- `src/services/summaryEngine.js` - Updated header comment (removed dead code reference)

## Decisions Made
- Set IMF/World Bank region to 'Global' rather than adding 'Global' to REGIONS array in eventModel.js. The region value in sourceRegistry is a default/fallback; the geolocation engine resolves specific regions from content. Adding 'Global' to REGIONS is a separate decision for a future phase.
- Cleaned up comment references to deleted files in ingestionEngine.js and summaryEngine.js to satisfy the zero-reference requirement from must_haves.truths.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Cleaned comment references to deleted files**
- **Found during:** Task 1 (Dead code deletion)
- **Issue:** ingestionEngine.js and summaryEngine.js had comments referencing "feedService" and "briefGenerator" -- the plan's must_haves.truths requires zero references to these names in src/
- **Fix:** Updated comments to remove references to deleted file names
- **Files modified:** src/services/ingestionEngine.js, src/services/summaryEngine.js
- **Verification:** grep -r returns zero results for all dead code file names
- **Committed in:** 97772e5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Minor comment cleanup to satisfy the must_haves.truths zero-reference requirement. No scope creep.

## Build Size Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| JS bundle | 979.94 kB | 979.88 kB | -0.06 kB |
| CSS bundle | 74.74 kB | 71.62 kB | -3.12 kB |
| npm packages | 264 | 221 | -43 |
| Source files | 7 dead files | 0 dead files | -7 files |
| Lines of dead code | ~2,487 | 0 | -2,487 lines |

Note: JS bundle size barely changed because Vite's tree-shaking already excluded the dead code from builds. The real wins are: 43 fewer npm packages, 3.12 kB CSS reduction, and a cleaner codebase with no orphaned files.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Codebase is clean with zero dead code files
- IMF/World Bank events will be correctly classified going forward
- Ready for Plan 01-02 (remaining engineering cleanup tasks)
- Known blocker for Phase 2: contextDataService cache key bug (uses `item.id` instead of `item.eventId`) still present

## Self-Check: PASSED

All 7 deleted files confirmed missing. Both commits (97772e5, 97a9f56) verified in git log. All 4 modified files confirmed present. SUMMARY.md exists.

---
*Phase: 01-engineering-cleanup*
*Completed: 2026-03-07*
