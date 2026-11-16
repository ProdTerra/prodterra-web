# ProdTerra

**ProdTerra** helps small and medium farmers decide what to plant, in which lot and when. The farmer marks the farm on a satellite map, splits it into lots and builds a crop rotation. ProdTerra checks it against the typical climate from NASA data, warns about frost, drought, excess rain, pests and diseases, and recommends a better rotation for each lot.

ProdTerra was built by team ProdTerra for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/find-a-team/prodterra/), "Field Shift" challenge.

- Live app: [app.prodterra.earth](https://app.prodterra.earth)
- API: [prodterra-api](https://github.com/ProdTerra/prodterra-api)

## Features

- Find the farm on satellite imagery and draw its edge and lots, or split it into equal lots.
- Plan each lot as a list of crops and rests, with drag and drop.
- See the plan as a month calendar, and the recommended plan with the climate and alarms of each month.
- Download both calendars as a PDF.
- Works in Spanish and English, on phones and desktops, anywhere in the world.
- No account needed to plan. An account (email or Google) is only needed to save farms.

## Data

| Data | Source |
|---|---|
| Typical monthly climate | NASA POWER |
| Elevation | NASADEM (NASA), through Microsoft Planetary Computer |
| Satellite imagery and place search | Esri World Imagery and ArcGIS |
| Crops, pests and diseases | ProdTerra team catalog |

## Tech stack

Next.js · React · TypeScript · next-intl · MapLibre GL · react-pdf · Vitest · deployed on Vercel.

## Quick start

Requires Node.js 22 or newer and the [API](https://github.com/ProdTerra/prodterra-api) running on `http://localhost:4000`.

```bash
npm install
cp .env.example .env.local   # add the ArcGIS key
npm run dev                  # http://localhost:3000
```

## Documentation

| Document | Contents |
|---|---|
| [Getting started](docs/getting-started.md) | Setup, environment variables, scripts and tests. |
| [User flow](docs/user-flow.md) | The six steps of the planner, accounts and PDF export. |
| [Architecture](docs/architecture.md) | Feature folders, layers and browser storage. |
| [Data sources](docs/data-sources.md) | Where each piece of data comes from and how it is used. |
| [Deployment and releases](docs/deployment.md) | Hosting, branches, versioning and release steps. |

## License

All rights reserved by team ProdTerra. No license is granted to reuse this code.
