# Testing Patterns

**Analysis Date:** 2026-03-07

## Test Framework

**Runner:** None configured

No test framework is installed. There are:
- No test runner (no Vitest, Jest, or any other test library in `package.json`)
- No test configuration files
- No test files (`.test.js`, `.test.jsx`, `.spec.js`, `.spec.jsx`) anywhere in the codebase
- No `test` script in `package.json`

**Available Scripts:**
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Current State

The codebase has **zero automated tests**. All validation is manual:
- Run `npm run dev` and verify visually in browser
- Rely on ESLint for static analysis only
- No CI/CD pipeline detected (no `.github/workflows/`, no Vercel config)

## Recommended Test Setup

Based on the project stack (React 19, Vite 7, no TypeScript), the recommended test framework is **Vitest** with **React Testing Library**.

### Installation
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration
Create `vitest.config.js` (or add to `vite.config.js`):
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

Create `src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

Add script to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

## Test File Organization

**Recommended Location:** Co-located with source files

**Recommended Naming:** `{filename}.test.{ext}`

**Recommended Structure:**
```
src/
  services/
    classifier.js
    classifier.test.js
    clustering.js
    clustering.test.js
    eventModel.js
    eventModel.test.js
  components/
    EventCard.jsx
    EventCard.test.jsx
  test/
    setup.js
    fixtures/
      sampleEvents.js
      sampleFeeds.js
```

## Priority Test Targets

The following modules are pure logic with no UI dependencies, making them ideal first test targets:

### Tier 1: Core Business Logic (highest value)

**`src/services/classifier.js`** (203 lines)
- `classifyCategory(text, fallback)` — keyword-based classification into 12 categories
- `extractTags(text)` — secondary tag extraction
- `classifySeverity(text, sourceCount, crossRegion)` — 3-level severity scoring
- `classifyConfidence(sources)` — confidence level from source tiers
- All functions are pure (text in, classification out), no side effects

**`src/services/clustering.js`** (249 lines)
- `clusterEvents(events, threshold)` — Union-Find clustering algorithm
- `deduplicateClusters(events)` — canonical representative selection and source merging
- Helper functions: `wordSimilarity`, `geographyOverlap`, `withinTimeWindow`, `categoryOverlap`, `eventSimilarity`
- Pure logic, operates on arrays of event objects

**`src/services/eventModel.js`** (188 lines)
- `createEvent({...})` — factory function, returns structured event object
- `createSource({...})` — factory function for source references
- Exported constants: `SEVERITY`, `SOURCE_TIERS`, `CONFIDENCE`, `EVENT_STATUS`

### Tier 2: Data Processing

**`src/services/geolocation.js`** (290 lines)
- `geolocateEvent(text, sourceName)` — entity extraction and coordinate resolution
- `inferRegionFromSource(sourceFeed)` — fallback region detection
- Pure functions, large lookup tables for countries, institutions, waterways, cities

**`src/services/summaryEngine.js`** (190 lines)
- `generateSummary(event)` — severity-based summary generation
- Internal builders: `buildExecutiveSummary`, `buildWhatHappened`, `buildWhyThisMatters`
- Pure functions, template-based output

**`src/services/contentGenerator.js`** (966 lines)
- `generateContent(item)` — multi-format content generation
- `generateHashtags(item, count)` — hashtag generation
- `truncateToLimit(text, limit)` — text truncation
- `formatAsThread(points, maxPerPost)` — thread formatting
- Pure functions, template-based

### Tier 3: Components

**`src/components/EventCard.jsx`** (157 lines)
- Rendering based on severity levels
- Badge display logic
- Time formatting (`timeAgo` helper)

**`src/components/FilterBar.jsx`** (147 lines)
- Filter state toggling
- Active filter detection
- Clear all behavior

## Recommended Test Patterns

### Unit Test for Service Functions
```js
// src/services/classifier.test.js
import { describe, it, expect } from 'vitest'
import { classifyCategory, extractTags, classifySeverity, classifyConfidence } from './classifier'
import { SEVERITY, SOURCE_TIERS } from './eventModel'

describe('classifyCategory', () => {
  it('classifies monetary policy text correctly', () => {
    const text = 'Federal Reserve raises interest rate by 25 basis points'
    expect(classifyCategory(text)).toBe('Central Banks & Monetary Policy')
  })

  it('returns fallback when no keywords match', () => {
    expect(classifyCategory('lorem ipsum', 'Macroeconomics')).toBe('Macroeconomics')
  })
})

describe('classifySeverity', () => {
  it('returns MAJOR for crisis keywords with multiple sources', () => {
    const text = 'Emergency war crisis threatens global markets'
    expect(classifySeverity(text, 3)).toBe(SEVERITY.MAJOR)
  })

  it('returns ROUTINE for generic text', () => {
    expect(classifySeverity('quarterly report released')).toBe(SEVERITY.ROUTINE)
  })
})
```

### Unit Test for Factory Functions
```js
// src/services/eventModel.test.js
import { describe, it, expect } from 'vitest'
import { createEvent, createSource, SEVERITY, CONFIDENCE } from './eventModel'

describe('createEvent', () => {
  it('creates event with required fields and defaults', () => {
    const event = createEvent({ headline: 'Test Event' })
    expect(event.eventId).toBeDefined()
    expect(event.headline).toBe('Test Event')
    expect(event.severity).toBe(SEVERITY.ROUTINE)
    expect(event.confidence).toBe(CONFIDENCE.REPORTED)
    expect(event.sources).toEqual([])
  })
})
```

### Unit Test for Clustering
```js
// src/services/clustering.test.js
import { describe, it, expect } from 'vitest'
import { clusterEvents, deduplicateClusters } from './clustering'
import { createEvent, SEVERITY } from './eventModel'

describe('clusterEvents', () => {
  it('clusters similar headlines together', () => {
    const events = [
      createEvent({ headline: 'Fed raises rates to 5%', publishedAt: new Date().toISOString() }),
      createEvent({ headline: 'Federal Reserve raises rates to 5 percent', publishedAt: new Date().toISOString() }),
      createEvent({ headline: 'Oil prices surge on OPEC cuts', publishedAt: new Date().toISOString() }),
    ]
    const clustered = clusterEvents(events)
    // First two should share a clusterId, third should differ
    expect(clustered[0].clusterId).toBe(clustered[1].clusterId)
    expect(clustered[2].clusterId).not.toBe(clustered[0].clusterId)
  })
})
```

### Component Test Pattern
```jsx
// src/components/EventCard.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from './EventCard'
import { createEvent, SEVERITY } from '../services/eventModel'

describe('EventCard', () => {
  const mockEvent = createEvent({
    headline: 'Test Headline',
    executiveSummary: 'Test summary text',
    severity: SEVERITY.MATERIAL,
    category: 'Macroeconomics',
    sources: [{ name: 'Reuters', tier: 2, url: 'https://reuters.com' }],
  })

  it('renders headline and summary', () => {
    render(<EventCard event={mockEvent} onSelect={() => {}} />)
    expect(screen.getByText('Test Headline')).toBeInTheDocument()
    expect(screen.getByText('Test summary text')).toBeInTheDocument()
  })

  it('shows Material severity badge', () => {
    render(<EventCard event={mockEvent} onSelect={() => {}} />)
    expect(screen.getByText('Material')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(<EventCard event={mockEvent} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('article'))
    expect(onSelect).toHaveBeenCalledWith(mockEvent)
  })
})
```

## Mocking

**Recommended Framework:** Vitest built-in `vi.mock()` and `vi.fn()`

**What to Mock:**
- `fetch` calls (RSS feeds, API endpoints) — use `vi.fn()` or `msw`
- `crypto.randomUUID()` — for deterministic event IDs in tests
- `DOMParser` — for XML parsing tests (use jsdom environment)
- `Dexie` / IndexedDB — for `archiveDb.js` tests (use `fake-indexeddb`)
- `import.meta.env` — for environment variable tests

**What NOT to Mock:**
- `classifier.js` functions — test with real text inputs
- `clustering.js` algorithms — test with real event arrays
- `eventModel.js` factories — test with real parameters
- `geolocation.js` lookups — test with real text inputs
- Pure utility functions — always test directly

**Mocking Fetch Example:**
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  global.fetch = vi.fn()
})

it('handles fetch failure gracefully', async () => {
  global.fetch.mockRejectedValue(new Error('Network error'))
  // ... test that the function falls back to demo data
})
```

## Fixtures and Factories

**Recommended Test Data Location:** `src/test/fixtures/`

**Use the existing `createEvent` and `createSource` factories** from `src/services/eventModel.js` for generating test data:
```js
// src/test/fixtures/sampleEvents.js
import { createEvent, createSource, SEVERITY, SOURCE_TIERS } from '../../services/eventModel'

export const majorEvent = createEvent({
  headline: 'Federal Reserve Emergency Rate Cut',
  executiveSummary: 'The Fed cut rates by 50bps in an emergency session.',
  severity: SEVERITY.MAJOR,
  category: 'Central Banks & Monetary Policy',
  primaryCountry: 'US',
  primaryRegion: 'North America',
  sources: [
    createSource({ name: 'Federal Reserve', tier: SOURCE_TIERS.OFFICIAL, url: 'https://fed.gov' }),
  ],
})

export const routineEvent = createEvent({
  headline: 'Weekly jobs report released',
  severity: SEVERITY.ROUTINE,
  category: 'Official Data Releases',
})
```

The codebase also has extensive demo data in `src/services/ingestionEngine.js` (`generateDemoData()`) that can serve as realistic test fixtures.

## Coverage

**Requirements:** None enforced (no test infrastructure exists)

**Recommended Targets:**
- Services: 80%+ coverage (pure logic, easy to test)
- Components: 60%+ coverage (focus on render output and user interactions)
- Pages: 40%+ coverage (integration-level, test key user flows)

## Test Types

**Unit Tests:**
- All service functions in `src/services/` — pure logic, no side effects
- Isolated component rendering with mocked props

**Integration Tests:**
- `ingestionEngine.js` pipeline: fetch -> classify -> geolocate -> cluster -> deduplicate
- `contextDataService.js`: indicator matching -> API fetch -> data formatting
- App.jsx: routing, filtering, event selection flow

**E2E Tests:**
- Not used. Consider Playwright or Cypress for future browser-level testing of:
  - Full page load with demo data
  - Navigation between pages
  - Filter interactions
  - Event detail panel open/close

## Common Patterns

**Async Testing:**
```js
it('fetches and classifies events', async () => {
  // Mock the fetch response
  global.fetch.mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>'),
  })

  const result = await fetchAndEnrichFeed(mockFeed)
  expect(result).toHaveLength(1)
  expect(result[0].headline).toBe('Test')
})
```

**Error Testing:**
```js
it('returns empty array when feed fetch fails', async () => {
  global.fetch.mockRejectedValue(new Error('timeout'))
  const result = await fetchAndEnrichFeed(mockFeed)
  expect(result).toEqual([])
})
```

**Snapshot Testing (for content generation):**
```js
it('generates consistent content structure', () => {
  const content = generateContent(sampleEvent)
  expect(content.social.x.analyst).toHaveProperty('text')
  expect(content.social.x.analyst).toHaveProperty('charCount')
  expect(content.social.x.analyst.charCount).toBeLessThanOrEqual(280)
})
```

---

*Testing analysis: 2026-03-07*
