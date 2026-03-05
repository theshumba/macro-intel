# Contextual Data Engine + Interactive Charts — v4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a contextual data engine that auto-matches events to relevant open-data indicators, displays interactive Recharts charts in the BriefPanel, enriches briefs and content with real data citations, and adds a Markets view with live macro data.

**Architecture:** Event items are matched against a 200+ indicator catalog (keyed by category, region, and keywords). A `contextDataService` fetches matched indicators from World Bank, FRED, OWID, and Eurostat APIs in parallel. Chart data flows into a new "Data" tab in BriefPanel, into enriched brief text, and into data-backed content generation. A new Markets view surfaces the aggregated macro snapshot.

**Tech Stack:** React 19, Recharts (new dep), existing dataApis.js functions, Tailwind CSS v4

---

## Task 1: Install Recharts

**Files:**
- Modify: `package.json`

**Step 1: Install recharts**

```bash
npm install recharts
```

**Step 2: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts for interactive charts"
```

---

## Task 2: Build the Indicator Catalog

**Files:**
- Create: `src/services/indicatorCatalog.js`

This is the brain of the matching system. Each indicator has: id, name, source (worldbank/fred/owid), fetchParams, tags (category + region + keyword tags), unit, description.

**Step 1: Create the catalog**

The catalog maps categories and regions to relevant indicators. When an event about "Energy Markets" in "Middle East" arrives, the catalog returns indicators like oil production, energy use per capita, crude oil price, OPEC spare capacity, etc.

Structure:
```js
// Each entry:
// { id, name, source, fetchKey, tags[], unit, description, chartType }

// Sources: 'worldbank', 'fred', 'owid'
// chartType: 'line', 'area', 'bar'
// tags: array of lowercase strings matching categories, regions, keywords

export const INDICATOR_CATALOG = [ ... ];  // 200+ entries

// Matching function: takes an event item, returns ranked indicator IDs
export function matchIndicators(item, maxResults = 8) { ... }
```

Tags system: each indicator gets tagged with relevant categories, regions, and keywords. The matcher scores each indicator by counting tag overlaps with the event's category, region, and extracted keywords. Higher overlap = higher rank.

The catalog covers:
- **World Bank (no key):** GDP growth, CPI inflation, trade/GDP, current account, FDI, external debt, reserves, unemployment, population, energy use, CO2, water stress, food imports, military spending, internet users, life expectancy, poverty rate — for all regions
- **FRED (key optional):** Fed funds, CPI, core CPI, 10Y yield, 2Y yield, dollar index, unemployment, GDP growth, S&P 500, VIX, WTI oil, gold, M2, breakeven inflation, yield spread, consumer sentiment, industrial production, housing starts, retail sales, PCE
- **OWID (no key):** CO2 emissions, energy mix, population, GDP per capita

**Step 2: Build the matcher function**

The matcher:
1. Lowercases the event's category, region, headline, and keywords
2. Scores each catalog entry by counting how many of its tags match
3. Bonus points: exact category match (+3), exact region match (+2), keyword match (+1 each)
4. Returns top N indicators sorted by score descending
5. Deduplicates by source+fetchKey

**Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add src/services/indicatorCatalog.js
git commit -m "feat: add 200+ indicator catalog with smart event matching"
```

---

## Task 3: Build the Contextual Data Service

**Files:**
- Create: `src/services/contextDataService.js`

This service takes an event item, calls `matchIndicators()` to find relevant indicators, then fetches data from the appropriate APIs in parallel.

**Step 1: Create the service**

```js
// Main function:
export async function fetchContextData(item) {
  // 1. Match indicators to event
  // 2. Group by source (worldbank, fred, owid)
  // 3. Fetch all in parallel using existing dataApis.js functions
  // 4. Return { indicators: [...], fetchedAt, eventId }
  // Each indicator result: { id, name, data: [{date, value}], unit, description, chartType, source }
}

// Cache layer: simple in-memory Map keyed by event.id
// Avoids re-fetching when user switches tabs back and forth
const cache = new Map();
```

Uses existing functions from `dataApis.js`:
- `fetchWorldBank(indicator, country, dateRange)`
- `fetchFRED(seriesId, limit)`
- `fetchOWID(dataset)`

Graceful fallback: if an API call fails, that indicator is skipped (not the whole batch). Returns whatever succeeded.

**Step 2: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add src/services/contextDataService.js
git commit -m "feat: add contextual data service with parallel API fetching and caching"
```

---

## Task 4: Build Reusable Chart Components

**Files:**
- Create: `src/components/charts/MiniChart.jsx`
- Create: `src/components/charts/SparkLine.jsx`
- Create: `src/components/charts/MacroCard.jsx`

**Step 1: Create MiniChart**

A responsive, dark-themed Recharts wrapper used in BriefPanel's Data tab. Supports line, area, and bar chart types. Emerald/amber/red color scheme. Shows tooltip on hover with date + value + unit. Title bar with indicator name and latest value.

Props: `{ title, data, unit, chartType, color, height }`

Data format: `[{ date: '2024-01', value: 3.5 }, ...]`

Styles: dark bg (#12121A), emerald line/fill, gray grid lines, custom tooltip matching app theme.

**Step 2: Create SparkLine**

Tiny inline chart (no axes, no tooltip) used in summary cards. Just the trend line. ~40px tall.

Props: `{ data, color, width, height }`

**Step 3: Create MacroCard**

A summary card with: title, current value (large), change indicator (arrow + percentage), SparkLine, and unit label. Used in the Markets view.

Props: `{ title, value, change, changeDirection, sparkData, unit, color }`

**Step 4: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 5: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add MiniChart, SparkLine, and MacroCard chart components"
```

---

## Task 5: Add Data Tab to BriefPanel

**Files:**
- Modify: `src/components/BriefPanel.jsx`

**Step 1: Add "Data" tab to TabBar**

Add a third tab alongside "Brief" and "Content Studio":
- Icon: chart/graph icon
- Label: "Data"
- When clicked, triggers data fetch via `fetchContextData(item)`

**Step 2: Add DataContext panel content**

When the Data tab is active, show:
1. A loading skeleton while indicators are being fetched
2. A grid of MiniChart components (2-col on desktop, 1-col on mobile)
3. Each chart shows: indicator name, source badge, latest value, and the interactive Recharts chart
4. A "Browse More Indicators" button at the bottom (for manual indicator search — future)
5. Empty state: "No data available for this event" with retry button

**Step 3: Wire up state management**

- Add `contextData` state (null | loading | data object)
- Fetch on tab switch to "data" (similar to how content is fetched on studio tab)
- Cache: if contextData already exists for this item, don't re-fetch

**Step 4: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 5: Commit**

```bash
git add src/components/BriefPanel.jsx
git commit -m "feat: add interactive Data tab to BriefPanel with contextual charts"
```

---

## Task 6: Enrich Brief Generator with Real Data

**Files:**
- Modify: `src/services/briefGenerator.js`
- Modify: `src/components/BriefPanel.jsx`

**Step 1: Add data enrichment to briefGenerator**

Add a new export function `enrichBriefWithData(brief, contextData)` that:
1. Takes the existing brief object and the fetched context data
2. Adds a new section `dataInsights` with 2-3 sentences citing real numbers
3. Enhances `whyItMatters` with a data citation paragraph
4. Enhances `marketImplications` with relevant data points
5. Updates `wordCount`

Example output for the `dataInsights` section:
> "UAE's water withdrawal stands at 4,128% of available internal freshwater resources (World Bank, 2020), making it one of the most water-stressed nations globally. Energy consumption per capita is 7,520 kg oil equivalent, ranking among the highest worldwide. GDP growth averaged 3.4% over the past 5 years, indicating moderate economic resilience."

The function scans indicator names and values to construct contextual sentences using templates keyed by indicator type (GDP → growth language, CPI → inflation language, energy → consumption language, etc.).

**Step 2: Wire up in BriefPanel**

When contextData is fetched (from Data tab or automatically), call `enrichBriefWithData()` and update the brief state with the enriched version. Show a subtle "Data-enriched" badge on the Brief tab when enrichment is active.

**Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add src/services/briefGenerator.js src/components/BriefPanel.jsx
git commit -m "feat: enrich briefs with real data citations from contextual indicators"
```

---

## Task 7: Enrich Content Generator with Real Data

**Files:**
- Modify: `src/services/contentGenerator.js`

**Step 1: Add data-enriched content generation**

Add a new export function `generateDataEnrichedContent(item, contextData)` that:
1. Calls the existing `generateContent(item)` to get base content
2. Scans contextData indicators for the 2-3 most impactful data points
3. Injects data citations into social posts, video scripts, and threads

Data injection rules:
- **X posts:** Add one stat to the body (e.g., "UAE water stress: 4,128% of internal supply (World Bank)")
- **LinkedIn:** Add a "By the numbers" section with 3-4 key stats
- **Video scripts:** Add data point to the body section
- **Threads:** Add a dedicated data post (e.g., "3/7 The numbers tell the story: [stat1], [stat2], [stat3]")
- **Newsletter:** Add a "Key Data Points" section with source citations

Template for data citation: `{indicator.name}: {latestValue}{unit} ({source}, {year})`

**Step 2: Wire up in BriefPanel/ContentStudio**

When content is generated and contextData is available, use `generateDataEnrichedContent` instead of `generateContent`. Add a subtle indicator showing content is data-backed.

**Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add src/services/contentGenerator.js
git commit -m "feat: data-enriched content generation with real stat citations"
```

---

## Task 8: Build Markets View

**Files:**
- Create: `src/components/MarketsView.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/ViewSwitcher.jsx`

**Step 1: Create MarketsView component**

A new 5th view showing live macro data from all configured APIs. Layout:

**Row 1: Macro Pulse Cards** (grid of MacroCards)
- Fed Funds Rate, CPI, 10Y Yield, 2Y-10Y Spread, VIX, WTI Oil, Gold, Dollar Index
- Each card: current value, trend arrow, SparkLine (30-day)
- Cards show "No API key" state gracefully when FRED key isn't set

**Row 2: Interactive Charts** (2x2 grid of MiniCharts)
- Yield curve spread (10Y-2Y over time)
- Oil + Gold price overlay
- VIX history
- CPI trend (12-month)

**Row 3: World Bank Macro Table**
- GDP growth, inflation, trade/GDP, unemployment for G20 economies
- Sortable columns, color-coded cells (green = positive, red = negative)
- Click a row to see that country's full indicator set

**Row 4: Economic Calendar** (Finnhub data)
- Upcoming + recent releases in timeline format
- Event name, country, actual vs expected, impact badge
- Empty state when no Finnhub key

Data fetching: uses `fetchMacroSnapshot()` from dataApis.js on mount. Loading skeletons while fetching. 15-min auto-refresh matching the RSS refresh cycle.

**Step 2: Add Markets to ViewSwitcher**

Add a 5th icon/label for "Markets" view. Update the desktop pills and mobile bottom tab bar.

**Step 3: Wire up in App.jsx**

Import MarketsView, add `{view === 'markets' && <MarketsView />}` to the view router.

**Step 4: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 5: Commit**

```bash
git add src/components/MarketsView.jsx src/App.jsx src/components/ViewSwitcher.jsx
git commit -m "feat: add Markets view with macro pulse cards, charts, calendar, and G20 table"
```

---

## Task 9: Indicator Search Browser

**Files:**
- Create: `src/components/IndicatorBrowser.jsx`
- Modify: `src/components/BriefPanel.jsx`

**Step 1: Create IndicatorBrowser**

A searchable modal/drawer that lets users manually find and add indicators to any event's data context. Accessible from the Data tab in BriefPanel via "Browse Indicators" button.

Features:
- Search input that fuzzy-matches against indicator catalog names/descriptions/tags
- Filter pills: by source (World Bank, FRED, OWID), by category
- Results list: indicator name, source badge, description, "Add" button
- When an indicator is added, it fetches the data and appends to the event's contextData
- Keyboard shortcut: Cmd+K opens the browser (when Data tab is active)

**Step 2: Wire into BriefPanel Data tab**

Add "Browse Indicators" button at bottom of Data tab. Opens the IndicatorBrowser modal.

**Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add src/components/IndicatorBrowser.jsx src/components/BriefPanel.jsx
git commit -m "feat: add searchable indicator browser for manual data exploration"
```

---

## Task 10: Final Polish + CSS

**Files:**
- Modify: `src/index.css`

**Step 1: Add chart-specific animations and styles**

- Recharts tooltip custom styling (dark theme, emerald accent)
- Chart container enter animations
- MacroCard pulse animation for live data
- Loading skeleton for chart areas
- Responsive breakpoints for chart grids

**Step 2: Verify full build**

```bash
npx vite build 2>&1 | tail -5
```

**Step 3: Final commit**

```bash
git add src/index.css
git commit -m "feat: add chart animations and dark-theme Recharts styling"
```

---

## Execution Order

Tasks 1-3 are foundation (must be sequential).
Tasks 4-5 can start after Task 3.
Tasks 6-7 can start after Task 5.
Task 8 can start after Task 4 (independent of BriefPanel work).
Task 9 depends on Task 5.
Task 10 is last.

```
Task 1 (Recharts) -> Task 2 (Catalog) -> Task 3 (Service)
                                              |
                                    +---------+---------+
                                    |                   |
                              Task 4 (Charts)     Task 8 (Markets View)
                                    |
                              Task 5 (Data Tab)
                                    |
                              +-----+-----+
                              |           |
                        Task 6 (Brief) Task 7 (Content)
                              |
                        Task 9 (Browser)
                              |
                        Task 10 (Polish)
```
