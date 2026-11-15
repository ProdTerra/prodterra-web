# ProdTerra web

ProdTerra helps farmers plan crop rotations with NASA data. The farmer marks the farm on satellite imagery, splits it into lots, builds a rotation per lot and compares it with a recommended rotation based on the farm's climate. Built for the NASA Space Apps Challenge 2026 ("Field Shift").

Spanish and English. The API lives in a separate repository: `prodterra-api`.

## The flow

| Step | What the farmer does |
|---|---|
| 1. Ubica tu finca | Search a place (ArcGIS geocoding) or use the device location. |
| 2. Marca el borde | Draw the farm boundary (0.01 ha to 1,000 ha). |
| 3. Divide en lotes | Draw lots or split the farm into equal lots (lengthwise, crosswise or grid). A summary shows land, elevation (NASADEM) and climate (NASA POWER). |
| 4. Tu rotación | Pick the start date, then per lot: previous use, irrigation and a list of crop and rest blocks. Each crop starts with its reference cycle; the farmer can change it. |
| 5. Tu calendario | The farmer's plan day by day, without climate data. |
| 6. Recomendado | The farmer's plan and a recommended rotation, colored by NASA climate risk, with monthly alarms and a per-lot comparison. |

An account is optional. It is only needed to save a farm ("Guardar mi plan") and to see it later under "Mis fincas". Both calendars can be downloaded as PDF.

## Run locally

Requirements: Node.js 22 or newer and the API running on `http://localhost:4000`.

```bash
npm install
cp .env.example .env.local   # then add the ArcGIS key
npm run dev                  # http://localhost:3000
```

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ARCGIS_API_KEY` | ArcGIS Location Platform key with Basemaps and Geocoding privileges. Add every site that uses it as an allowed referrer. |
| `NEXT_PUBLIC_API_URL` | ProdTerra API base URL. Defaults to `http://localhost:4000`. |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (also copies the MapLibre worker to `public/vendor`). |
| `npm test` | Unit tests with Vitest. |
| `npm run typecheck` | TypeScript check. |
| `npm run lint` | ESLint. |
| `npm run build` | Production build. |

## Code layout

Each feature under `src/features` is split into `domain` (pure rules), `application` (state), `infrastructure` (API clients and browser storage) and `components` (React).

| Feature | Responsibility |
|---|---|
| `farm-mapping` | Map, boundary, lots, equal split and the farm summary. |
| `rotation-plan` | Start date, per-lot rotation timeline and the farmer calendar. |
| `calendar` | Analysis step: farmer plan vs recommended, alarms and comparison. |
| `account` | Session in the header, login and registration dialog. |
| `saved-farms` | "Guardar mi plan" and the "Mis fincas" page. |

Browser storage keys: `prodterra.farmDraft`, `prodterra.mapView`, `prodterra.rotationPlan`, `prodterra.activeSavedFarm`.

## Data sources

- Satellite imagery and place search: Esri World Imagery and ArcGIS geocoding.
- Elevation: NASADEM through Microsoft Planetary Computer.
- Climate: NASA POWER monthly climatology, adjusted to the lot elevation with the U.S. Standard Atmosphere 1976 lapse rate.
- Crop cycles: MAG/SEPSA Infoagro cost models (Costa Rica). Lettuce and chayote still use development values.
