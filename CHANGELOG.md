# Changelog

## Unreleased

### Added
- "Continuar con Google" in the login and registration dialog; it returns to the same page and shows a plain message when Google sign in is cancelled or fails.
- "¿Olvidaste tu contraseña?": the dialog sends a reset link by email, and the `/reset-password` page sets the new password with inline validation, signs the farmer in and leads back to the plan.
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
- The 24-month strip marks Inicio, 6 meses, 1 año, 18 meses and 2 años with the month and full year (only Inicio, 1 año and 2 años on phones), and "Usar N días" sits next to the duration field.
- The 24-month strip now sits above the blocks at full width with crop names inside and month labels underneath; the "Quedan … meses" line was removed.
- Timeline editor: blocks are reordered by dragging the handle (mouse, touch or keyboard), and new blocks are added only at the end; crop rows read "Siembra … · cosecha …" and the duration editor asks "¿Cuánto tiempo pasa de la siembra a la cosecha?"; the time left is shown in whole months; each crop keeps the same color when blocks are reordered.
- Rotation timeline editor: durations in days, weeks or months with a typed field and quick rest choices (3, 7, 14, 30 days); blocks from 1 day; "Agregar aquí" between blocks opens a crop or rest picker (bottom sheet on mobile); each block has Subir, Bajar, Duplicar and Quitar with Deshacer; a sticky strip shows the whole 24 months and what is left (right column on desktop). Removed the reference badges, min/max hints and the separate capacity bar.
- Step 4 always opens with "¿Desde cuándo quieres planificar?", and a new farm no longer reuses the start date of the previous one.
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
