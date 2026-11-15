# Changelog

## Unreleased

### Added
- Saving a farm with a name the user already uses shows "Ya tienes una finca con ese nombre" under the name field.
- New "exceso de agua" alarm when the month's rain goes above the crop's maximum water need.
- Rotation plan step: choose the start date on a month calendar (today up to one year ahead) with quick picks and plain messages for days that cannot be picked.
- Per-lot rotation timeline: previous use, irrigation and an ordered list of crops and rest periods with week steppers, start and end dates, the usual cycle from the crop catalog and a reset when it was changed. Blocks last 2 weeks to 24 months and the whole lot plan up to 24 months; adding stops with an explanation when the plan is full.
- Copy one lot's rotation to every lot, lot cards that say what is missing, and "Ver mi calendario" enabled only when every lot is complete.
- Farmer calendar without climate data: month navigation over the plan, one row per lot colored by crop, rest drawn with a pattern, sowing and harvest markers, a legend and the dates of each lot.
- The rotation plan is kept in the browser under `prodterra.rotationPlan`.
- Recommended step: the farmer's rotation and a recommended one from `POST /plans/evaluate`, colored by NASA climate risk, with exact sowing and harvest days, monthly alarms and a per-lot comparison with rotation warnings and reasons.
- Optional accounts: "Iniciar sesión" or the profile avatar in the header from the first step, a login and registration dialog with inline field validation that never leaves the current step, and a profile menu with "Mis fincas" and "Cerrar sesión".
- "Guardar mi plan" on the recommended step (asks to log in only when needed) and the "Mis fincas" page to open or delete saved farms.
- "Descargar PDF" on both calendars with a print layout of every month and the dates of each block.
- Place search with the ArcGIS geocoder, the split panel with lengthwise, crosswise and grid layouts aligned to the farm's long axis.

### Changed
- The flow now has six steps: locate, boundary, lots, your rotation, your calendar and recommended. The recommended step evaluates the whole rotation plan.

### Removed
- The old crops step and its `prodterra.lotPlantings` storage.

## 0.1.0 - 2026-11-14

### Added
- Spanish and English interface with the language kept in a cookie, so switching keeps the page state.
- Locate the farm with place search or the device location over ArcGIS satellite imagery.
- Draw the farm boundary and its lots, with a close button, undo, and validation that lots stay inside the farm and do not overlap.
- Split the farm into N equal-area lots in vertical or horizontal strips, with numbered badges on the map.
- Areas shown in square meters for small lots and hectares for large ones.
- Map center chip with latitude, longitude and NASADEM elevation from the ProdTerra API.
- Farm summary with land, elevation (NASADEM) and climate (NASA POWER) figures and their sources.
- Crops step entry and per-lot planting rules (current crop or rest, planting month, previous crop, irrigation).
- Progress saved in the browser so a reload or language change keeps the farm and lots.

### Configuration
- `NEXT_PUBLIC_ARCGIS_API_KEY`: ArcGIS Location Platform key (basemaps and geocoding).
- `NEXT_PUBLIC_API_URL`: ProdTerra API base URL (defaults to `http://localhost:4000`).
