# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- JavaScript (ES2020+, JSX) - All frontend and worker source code

**Secondary:**
- CSS - Custom animations and Tailwind directives (`src/index.css`)
- HTML - Single entry point (`index.html`)

## Runtime

**Environment:**
- Node.js v24.13.0
- Browser (ES modules, `type: "module"` in `package.json`)
- Cloudflare Workers runtime (for RSS proxy worker)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (158KB)

## Frameworks

**Core:**
- React 19.2.0 - UI framework (`src/main.jsx`, `src/App.jsx`)
- React DOM 19.2.0 - DOM rendering
- React Router DOM 7.13.1 - Client-side routing via `HashRouter` (GitHub Pages compatible)

**Visualization:**
- Recharts 3.7.0 - Charts, sparklines, area/line/bar charts (`src/components/charts/`)
- react-globe.gl 2.37.0 - 3D globe visualization (`src/components/GlobeView.jsx`)
- Three.js 0.183.2 - WebGL engine (peer dependency of react-globe.gl)
- Leaflet 1.9.4 + react-leaflet 5.0.0 - 2D map views (`src/pages/MapPage.jsx`)

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server (`vite.config.js`)
- @vitejs/plugin-react 5.1.1 - React Fast Refresh and JSX transform
- @tailwindcss/vite 4.2.1 - Tailwind CSS v4 Vite plugin

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework (v4 with `@import "tailwindcss"` syntax)

**Linting:**
- ESLint 9.39.1 - Linting with flat config (`eslint.config.js`)
- eslint-plugin-react-hooks 7.0.1 - React hooks rules
- eslint-plugin-react-refresh 0.4.24 - React Refresh boundary checks
- globals 16.5.0 - Browser globals

**Worker Tooling:**
- Wrangler 3.x - Cloudflare Workers CLI (`workers/rss-proxy/`)

## Key Dependencies

**Critical:**
- `dexie` 4.3.0 - IndexedDB wrapper for event archive database (`src/services/archiveDb.js`)
- `date-fns` 4.1.0 - Date manipulation utilities
- `uuid` 13.0.0 - UUID v4 generation for event IDs (`src/services/eventModel.js`)

**Visualization (Critical):**
- `recharts` 3.7.0 - All chart components in `src/components/charts/`
- `react-globe.gl` 2.37.0 - 3D globe on dashboard and map pages
- `three` 0.183.2 - WebGL rendering (required by react-globe.gl)
- `leaflet` 1.9.4 - 2D map tiles and markers
- `react-leaflet` 5.0.0 - React bindings for Leaflet

## Configuration

**Environment:**
- `.env` file present (contains API keys - never read contents)
- `.env.example` present - documents all available env vars
- All env vars prefixed with `VITE_` for Vite exposure to client:
  - `VITE_WORKER_URL` - Cloudflare Worker RSS proxy URL
  - `VITE_FRED_API_KEY` - Federal Reserve Economic Data API
  - `VITE_ALPHA_VANTAGE_KEY` - Alpha Vantage market data
  - `VITE_FINNHUB_KEY` - Finnhub real-time market data
  - `VITE_TWELVE_DATA_KEY` - Twelve Data market data
  - `VITE_MARKETAUX_KEY` - Marketaux financial news
  - `VITE_NEWSAPI_KEY` - NewsAPI general news
- All API keys are optional - app works without them via graceful fallback pattern

**Build:**
- `vite.config.js` - Vite config with `base: '/macro-intel/'` for GitHub Pages
- `eslint.config.js` - ESLint flat config targeting `**/*.{js,jsx}`
- `workers/rss-proxy/wrangler.toml` - Cloudflare Worker config

**Vite Config Details:**
```js
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/macro-intel/',
  server: { port: 5176 },
})
```

**ESLint Config Details:**
- ECMAScript 2020 target
- Browser globals
- JSX enabled
- Rule: `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` (allows unused uppercase/underscore vars)

## Scripts

```bash
npm run dev        # Start Vite dev server on port 5176
npm run build      # Production build to dist/
npm run lint       # ESLint check
npm run preview    # Preview production build
```

**Worker Scripts:**
```bash
cd workers/rss-proxy
npm run dev        # Local Wrangler dev server (port 8787)
npm run deploy     # Deploy to Cloudflare Workers
```

## Platform Requirements

**Development:**
- Node.js 24+ (currently using v24.13.0)
- npm (lockfile present)
- No TypeScript - pure JavaScript with JSX

**Production:**
- GitHub Pages (static hosting)
- Base path: `/macro-intel/`
- HashRouter for client-side routing (no server-side routing needed)
- Cloudflare Workers (optional, for RSS proxy)

**Browser Requirements:**
- Modern browsers with ES module support
- WebGL support for 3D globe (react-globe.gl)
- IndexedDB support for event archive (Dexie.js)
- `crypto.randomUUID()` support (or uuid package fallback)
- `AbortSignal.timeout()` support

## Testing

- No test framework configured
- No test files present
- No test scripts in `package.json`

---

*Stack analysis: 2026-03-07*
