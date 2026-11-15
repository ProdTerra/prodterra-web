# Changelog

## Unreleased

### Fixed
- Older satellite photos no longer log "Failed to fetch" at the closest zoom: Wayback has no level 19 photos, so the map enlarges the level 18 photo instead.

### Added
- "Otra foto" on the map: lists the dates when the satellite photo of that place changed (Esri World Imagery Wayback) and switches the map to an older photo, useful when clouds cover the farm; the choice is remembered in the browser.
- Phones: in steps 1 to 3 the panel has a handle; swipe it up to cover most of the map for comfortable reading, swipe down or tap to see the full map again. The map resizes with its container.
- Step 1: tapping or clicking the map moves the farm marker to that point and zooms in, so the farmer can mark the farm without dragging the map.

## 0.2.0 - 2026-11-15

### Added
- "Editar mi perfil" in the profile menu: change the account name (with inline validation) and the farmer avatar, saved together with "Guardar cambios".
- Illustrated icons for the 10 catalog crops (papa, cebolla, zanahoria, repollo, lechuga, chayote, tomate, brócoli, coliflor, fresa) in the crop picker, the previous use choices and the timeline blocks; new catalog crops fall back to a sprout icon.
- Farmer avatars: the header shows the account's farmer avatar (10 Open Peeps illustrations, CC0, stored in `public/avatars`), and "Cambiar mi granjero" in the profile menu opens a picker; accounts without one keep their initials.
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
- The farmer avatars include 5 women farmers (long, curly, gray bun, straight and bun hair under the brimmed hat) and 5 men farmers.
- All 10 farmer avatars now wear a brimmed farmer hat, with different skin tones, faces and shirt colors.
- Start date screen: one hint ("Puede ser hoy o cualquier día hasta el …") replaces the two repeated explanations.
- Crop choices scale to a larger catalog: "¿Qué sigue?" has a search box (accent-insensitive), the farm's crops first and then every crop; "¿Qué tenía antes este lote?" shows No sé, Descanso, the farm's crops and "Otro cultivo", which opens the same search.
- Shorter imagery credit under the lot cards: "Fotos satelitales © Esri y colaboradores".
- Lot cards in step 4 show the satellite image of each lot (Esri World Imagery export) with the lot outline on top and the surroundings dimmed; if the image fails, the colored shape is shown as before.
- A lot plan has no 24-month limit: it lasts as long as the farmer's crops and rests add up to (each one up to 2 years, up to 100 per lot). The strip caption reads "Tu lote mes a mes" and its scale and marks grow with the plan (every 6 months, then every year or two).
- Lot cards in step 4 show "Listo" for a complete lot instead of repeating its crop list.
- The 24-month strip shows thin dashed guides with a small notch at 6 meses, 1 año and 18 meses, so each mark lines up with the crops on the bar.
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
