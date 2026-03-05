# Macro Intel RSS Proxy

Cloudflare Worker that fetches RSS feeds server-side, bypassing CORS.

## Local Development

```bash
cd workers/rss-proxy
npm install
npm run dev
```

Worker runs at `http://localhost:8787`. Test: `http://localhost:8787/api/feeds`

## Deploy

```bash
npx wrangler deploy
```

## API

### GET /api/feeds

Returns all RSS feed items as JSON.

Optional: `?sources=fed,ecb,bbc` to filter by source name.

Response:
```json
{
  "items": [{ "title": "...", "description": "...", "link": "...", "pubDate": "...", "sourceName": "...", "sourceCategory": "...", "sourceRegion": "..." }],
  "fetchedAt": "2026-03-05T...",
  "feedCount": 8,
  "itemCount": 42,
  "errors": [{ "feed": "ECB", "error": "timeout" }]
}
```

## Connect to App

Set `VITE_WORKER_URL` in `.env`:
```
VITE_WORKER_URL=https://macro-intel-rss-proxy.<your-subdomain>.workers.dev
```
