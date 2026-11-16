# Getting started

## Requirements

- Node.js 22 or newer.
- The [ProdTerra API](https://github.com/ProdTerra/prodterra-api) running locally on `http://localhost:4000`.
- An ArcGIS Location Platform key with Basemaps and Geocoding privileges.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ARCGIS_API_KEY` | ArcGIS key for the map and place search. Add every site that uses it as an allowed referrer. |
| `NEXT_PUBLIC_API_URL` | API base URL. Defaults to `http://localhost:4000`. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server. Also copies the MapLibre worker to `public/vendor`. |
| `npm run build` | Production build. |
| `npm test` | Unit tests with Vitest. |
| `npm run typecheck` | Type check. |
| `npm run lint` | ESLint. |

Tests cover the pure rules in each feature's `domain` and `application` folders.
