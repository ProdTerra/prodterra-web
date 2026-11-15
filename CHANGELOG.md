# Changelog

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
