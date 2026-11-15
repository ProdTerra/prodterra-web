# Crops step
Objective: summary of the farm with sources, then a "Tus cultivos" step that asks four questions per lot using the crop catalog from the API.
Branch: feature/crops-step (from feature/split-farm-into-lots). Delivery: ask-on-risk. Tests: vitest.

## Specs
- S1: "necesito tambien ya antes de pasar a la siguiente pantalla como presentar las estadisticas importantes y de donde bienen en un model" — summary modal before the next screen: area, lots, elevation, climate, each with its source.
- S2: "la siguiente pagina necesittamos un rediseño siguiendo el layout actual , pero manteniendo el prototipo" — crops step uses the current panel + map layout and keeps the prototype ideas (crop chips, season question, water).
- S3: per lot: current crop (or fallow), planting date, previous crop, irrigation. "ya no nos interesa el objetivo, siempre es el mismo" — no priority/objective question.
- S4: "ok usemos un DB en mongo ... vamos a poner los catalogos" — crop options come from GET /catalog/crops.

## Tasks
- T1 [S1] Continue button + farm summary dialog with sources — route: inline — status: done (browser: live NASADEM + NASA POWER data; step indicator and dialog scroll CSS pending visual check after dev server restart)
- T2 [S3] lot planting rules and state (tests) — route: inline — status: done (10 new tests)
- T3 [S2, S4] crops step UI without map, lot silhouettes, catalog chips from API, apply to all lots — route: inline — status: done (browser desktop + mobile)

## Log
- L1 (2026-11-14): "si ya no nos interesa el objetivo, siempre es el mismo y se entiende ese es el objetivo de la app" (answer to the four questions per lot).
- L2 (2026-11-14): user's `next dev` serves stale globals.css (served chunk keeps old rules after edits); style changes need a dev server restart to be verified. Pending visual checks: step indicator in 4 columns, wide dialog scroll, lot label containment.
