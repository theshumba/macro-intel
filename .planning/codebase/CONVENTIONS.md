# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- Components: PascalCase `.jsx` files — `EventCard.jsx`, `DashboardView.jsx`, `FilterBar.jsx`
- Services: camelCase `.js` files — `feedService.js`, `classifier.js`, `eventModel.js`
- Pages: PascalCase `.jsx` files with `Page` suffix — `DashboardPage.jsx`, `EventsPage.jsx`, `MapPage.jsx`
- Charts: PascalCase `.jsx` in `charts/` subdirectory — `MiniChart.jsx`, `SparkLine.jsx`, `MacroCard.jsx`

**Functions:**
- Use camelCase for all functions: `fetchAllFeeds`, `classifyCategory`, `scoreImpact`
- React components use PascalCase function declarations: `function EventCard(...)`, `function FilterBar(...)`
- Private/internal helper functions use camelCase: `stripHtml`, `getTagText`, `resolveCoordinates`
- Factory functions use `create` prefix: `createEvent()`, `createSource()`
- Fetch functions use `fetch` prefix: `fetchFRED()`, `fetchWorldBank()`, `fetchContextData()`

**Variables:**
- camelCase for all variables and state: `filteredEvents`, `lastUpdated`, `filtersOpen`
- UPPER_SNAKE_CASE for constants and enums: `SEVERITY`, `SOURCE_TIERS`, `CATEGORIES`, `CORS_PROXIES`
- Boolean state uses `is`/`has` prefix or clear adjective: `isSelected`, `hasActiveFilters`, `filtersOpen`, `collapsed`

**Types/Enums:**
- Enum-like objects use UPPER_SNAKE_CASE keys: `SEVERITY.MAJOR`, `SOURCE_TIERS.OFFICIAL`, `CONFIDENCE.CONFIRMED`
- Export as `const` objects with string or number values

**Props:**
- Event handlers use `on` prefix: `onSelect`, `onClose`, `onFilterChange`, `onRefresh`, `onToggleFilters`
- Boolean props use adjectives or `is` prefix: `isSelected`, `collapsed`, `filtersOpen`
- Data props use descriptive nouns: `events`, `filters`, `lastUpdated`, `itemCount`

## Code Style

**Formatting:**
- No Prettier configured. No `.prettierrc` or `.editorconfig` present.
- Indentation: 2 spaces (consistent across all files)
- Semicolons: inconsistent — some files use them (services), some omit (main.jsx). Prefer including semicolons.
- Single quotes for strings in imports and JS logic
- Double quotes in JSX attributes (`className="..."`) and some inline objects
- Trailing commas in multi-line arrays, objects, and function parameters

**Linting:**
- ESLint 9 with flat config: `eslint.config.js`
- Extends: `@eslint/js` recommended, `react-hooks` flat recommended, `react-refresh` vite config
- Custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]` — allows unused uppercase/underscore vars (constants, React imports)
- ECMAScript 2020 target, browser globals, JSX enabled, ES modules

## Import Organization

**Order:**
1. React/framework imports (`import { useState, useMemo } from 'react'`)
2. Third-party libraries (`import { NavLink } from 'react-router-dom'`, `import Dexie from 'dexie'`)
3. Local components (`import EventCard from '../components/EventCard.jsx'`)
4. Local services (`import { ingestAll } from './services/ingestionEngine'`)

**Path Style:**
- Relative paths throughout: `'../services/eventModel.js'`, `'./components/Header'`
- No path aliases configured (no `@/` prefix)
- Extension usage is inconsistent: some imports include `.js`/`.jsx` extension, some omit it. Prefer including extensions for service imports (`.js`) and component imports (`.jsx`).

## Component Patterns

**Component Declaration:**
- Use `function` declarations, not arrow functions, for top-level components:
  ```jsx
  function EventCard({ event, onSelect, isSelected, index }) {
    // ...
  }
  export default EventCard;
  ```
- One component per file for primary components
- Small helper components (sub-components) defined in the same file above the main component:
  ```jsx
  // In EventCard.jsx
  function SeverityBadge({ severity }) { ... }
  function CategoryTag({ category }) { ... }
  function EventCard({ event, onSelect }) { ... }
  export default EventCard;
  ```
- In DashboardPage.jsx: `StatCard`, `SectionHeader`, `CompactEventRow` are co-located helpers

**State Management:**
- No global state library (no Redux, Zustand, Context API)
- All state lives in `App.jsx` and is passed down via props
- `useState` for local state, `useMemo` for derived/computed data, `useCallback` for stable function references
- `useEffect` for side effects (data loading, keyboard listeners, body scroll lock)

**Props Pattern:**
- Destructure props in function signature: `function Header({ lastUpdated, itemCount, onRefresh })`
- Pass callbacks directly: `onRefresh={loadEvents}`, `onFilterChange={setFilters}`
- Spread is avoided; props are explicit

## File Header Comments

**Every service file** starts with a standardized block comment:
```js
// ---------------------------------------------------------------------------
// fileName.js — Short description of module purpose
// Additional context about what it replaces or how it works.
// ---------------------------------------------------------------------------
```

**Every component file** uses the same pattern:
```jsx
// ---------------------------------------------------------------------------
// ComponentName.jsx — Short description
// Additional design notes.
// ---------------------------------------------------------------------------
```

Use this pattern for all new files.

## Section Comments

Within files, use dashed section separators to organize code blocks:
```js
// ---- Section Name ---------------------------------------------------
```
or
```js
// ---- Section Name -------------------------------------------------------
```

This is used extensively across all service files. Maintain this convention.

## Error Handling

**Async/Await Pattern:**
- Use try/catch/finally blocks in async functions
- `setLoading(true)` before try, `setLoading(false)` in `finally`
- Store error message in state: `setError(err.message)`
- Log warnings with contextual prefix: `console.warn('[feedService] ${feed.name}: ${err.message}')`

**Graceful Degradation:**
- All external API calls have fallback behavior
- If worker fails, fall back to CORS proxy chain
- If all proxies fail, fall back to curated demo data
- Non-critical async operations (like archive writes) use `.catch()` to avoid blocking:
  ```js
  storeEvents(deduplicated).catch(err =>
    console.warn('[ingestion] Archive write failed:', err.message)
  );
  ```

**Safe API Calls:**
- Wrap optional API calls with `safeCall()` helper:
  ```js
  function safeCall(fn, label) {
    return fn().catch((err) => {
      console.warn(`[dataApis] ${label}: ${err.message}`);
      return null;
    });
  }
  ```
- Check for API key existence before making calls: `if (!FRED_API_KEY) return null;`
- Use `AbortSignal.timeout()` for all fetch calls (12-20 second timeouts)

**Null Guards:**
- Check for null/undefined before accessing nested properties: `event.sources?.map(s => s.name) || []`
- Optional chaining used extensively: `event.subcategoryTags?.length > 0`
- Default values in destructuring: `const { severity = SEVERITY.ROUTINE, sources = [] } = event;`

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- `console.info` for successful operations: `console.info('[ingestion] Worker returned 15 items')`
- `console.warn` for recoverable failures: `console.warn('[feedService] ECB: timeout')`
- Always prefix with module name in brackets: `[feedService]`, `[ingestion]`, `[dataApis]`
- Never use `console.error` — all errors are handled gracefully as warnings

## JSDoc

**Usage:** Present on all public/exported functions in service files. Use `/** */` style:
```js
/**
 * Fetch contextual data for an event item.
 * Matches indicators, fetches in parallel, returns chart-ready results.
 *
 * @param {object} item - Event with headline, summary, category, region, keywords
 * @param {object} options - { maxIndicators, forceRefresh }
 * @returns {Promise<object>} { indicators: [...], fetchedAt, matchedCount }
 */
```

Private/helper functions use single-line `/** */` comments or inline `//` comments:
```js
/**
 * Strip HTML tags and decode common entities from a string.
 */
function stripHtml(html) { ... }
```

Components do NOT use JSDoc. Component purpose is described in the file header comment.

## Tailwind CSS Patterns

**Color Palette:**
- Background: `bg-[#0A0A0F]` (darkest), `bg-[#12121A]` (cards/panels)
- Accent: `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`
- Severity colors: Red (`text-red-400`), Amber (`text-amber-400`), Gray (`text-gray-400`)
- Source tier colors: Sky (`text-sky-400` for Tier 1), Gray (`text-gray-300` for Tier 2), Yellow (`text-yellow-400` for Tier 3), Purple (`text-purple-400` for Tier 4)

**Responsive:**
- Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Mobile bottom tab bar, desktop horizontal nav
- `hidden sm:block` / `hidden md:flex` pattern for responsive visibility
- `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for consistent page width

**Transitions:**
- `transition-colors duration-200` on interactive elements
- `transition-all duration-300` on cards
- Custom CSS animations in `src/index.css` for enter/exit effects

**Component Patterns:**
- Cards: `bg-[#12121A] border border-gray-800/60 rounded-xl`
- Buttons: `cursor-pointer` always included, hover state changes color/border
- Badges: `px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border`

## Module Design

**Exports:**
- Components use `export default ComponentName` at bottom of file
- Services use named exports for functions and constants: `export function classifyCategory(...)`, `export const CATEGORIES = [...]`
- Some services also export a default (e.g., `export default db` in `archiveDb.js`, `export default generateContent` in `contentGenerator.js`)

**Barrel Files:** Not used. All imports reference specific files directly.

**Module Boundaries:**
- Services never import components
- Components import from services via `../services/`
- Pages import from components via `../components/`
- No circular dependencies observed

---

*Convention analysis: 2026-03-07*
