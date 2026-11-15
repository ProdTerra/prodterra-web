# Rotation planner

Objective: let farmers build their own rotation timeline per lot, see it as a calendar, get an analyzed and recommended calendar, optionally save everything in an account and print both calendars as PDF.
Branches: one `feature/<stage>` per stage from develop, signed commits, PR into develop merged after green checks; never merge to main. Repos: prodterra-web (this document) and prodterra-api. Test runner: vitest in both.

## Specs

- S1 Planning start: "apartir de cuendo quiere planificar con un calendario con exelente UX y buenas validaciones apitr de hoy". Default today, no past dates, up to 12 months ahead (assumption).
- S2 Rotation timeline per lot: "que tenia antes si sabe, que va a semabra y depsue intercativamente hasta infito que pueda ir diciendo que planea rotar, nosotros sabemoslo ciclo pero el puede escojer otro si quiere sugerir que no termina en 3 meses la papa si no en dos, entonces depsue sdice que planea descansar el otro mes y depsue sque va a sembrar zanahoraia, etc ... hasy hasta que el quiera para". Blocks are crop or rest with editable duration; catalog cycle is the default.
- S3 Cycles in the model: "la idea es saber los ciclo de rotacion de los productos, si hoy no esta debemos incluirlo al modelos y los seeds de dummy data y volverlos a correr".
- S4 Farmer calendar: "depsue sya si presentamos el calendario actual plneado si datos de presipitacion ni nada".
- S5 Analysis: "Depseus generamos el analisis y presnetamos el calenrio nuevo con datos importnates".
- S6 Accounts: "Es imprtatne agragar lo de login con usuario contraseña y nombre, que al base por usuario guarde la info y icuso le permita ir guardando y anadiendo mas y biendo mas calendario tanto el de el como el reocmendado". "pero si par ahace rel estudio no se ocupa logeras solo si quiere gusrada al final las cosas".
- S7 Session UI: "desde fase uno se debe dectrar la cookie de secion y mostar el perfil avatar o login si se logea sigue en el mapa pero ya logeado, par que se interrumpa el flujo y ir como al home el usuario debe hacer dropdown de el perfil si no no y puede devolverse donde staba".
- S8 PDF: "que lso caledarios de el y el recomendado se pued eimprimir en PDF".
- S9 UX quality: "importante saber que herramientas y skills usar apra siempre hacerlo con buena UX/UI, aprender de lo que hemos corregido como leyendas feas o cosas acargadas".

### Design decisions (assumptions, numbered to the specs above)

- D1 (S1) Flow steps become: locate, boundary, lots, plan ("Tu rotación": start date screen, then the per-lot timeline), myCalendar ("Tu calendario", no climate), analysis ("Recomendado", NASA data). Step indicator shows 6 steps. The old `crops` and `calendar` steps and the `lot-plantings` feature are replaced; the old `prodterra.lotPlantings` storage key is no longer read.
- D2 (S1) Start date: custom month calendar (buttons per day, prev/next month with lucide chevrons, keyboard friendly), quick choices "Hoy", "Próximo lunes", "Inicio del próximo mes". Valid range: today to today + 365 days; past and too-far days disabled with a plain explanation. Chosen date shown in words ("viernes 14 de noviembre de 2026"). Dates are `YYYY-MM-DD` strings computed in UTC.
- D3 (S2) Per lot: previous use (crop chips + "Descanso" + "No sé"), irrigation (Sí/No), then an ordered list of blocks. Block = crop (cropKey, durationInDays) or rest (durationInDays). New crop blocks take the catalog `referenceCycleInDays` (fallback 90); rest blocks default to 28 days. Duration edited in weeks (stepper ±1 week) and shown also as approximate months; a crop whose duration differs from its reference shows "Lo cambiaste" with a reset action, otherwise "Ciclo de referencia". Limits: block 14 to 730 days, whole lot plan up to 730 days (24 months) from the start date; adding is disabled when no room remains. Each block shows its start and end dates. Actions: add crop, add rest, remove block, copy this lot's rotation to all lots, next lot. A lot is complete with previous use, irrigation and at least one block. Continue ("Ver mi calendario") only when every lot is complete. Plan persisted in localStorage key `prodterra.rotationPlan` (version 1).
- D4 (S4) Farmer calendar: month navigation strip over the plan horizon (start month to the last block end), one row per lot with day cells colored by the crop of that day (categorical colors per crop, rest drawn neutral with a pattern, empty days blank), sowing and harvest markers, a legend with crop names (no numbers), and a per-lot summary list "Papa: 14 nov 2026 a 13 mar 2027". No climate data. Buttons: "Cambiar mi rotación", "Analizar con datos de la NASA".
- D5 (S5) API `POST /plans/evaluate`: body {startDate, lots:[{lotId, boundary, previousUse, hasIrrigation, blocks:[{kind, cropKey?, durationInDays}]}]}. Returns per lot: the farmer plan assessed month by month (status ok/watch/risk with alerts: frost, drought/irrigation, temperature, pests, sameFamilyInARow, shorterThanReference, altitudeOutOfRange) and a recommended rotation (same horizon) built with the existing recommendation rules, also assessed. Web analysis step shows "Tu plan" and "Recomendado" with the existing day-grid calendar, alarms and month navigation, toggle between both on mobile and side by side on desktop.
- D6 (S6) Accounts: name, email (username) and password (min 8 chars). Passwords hashed with argon2id. Sessions are random 32-byte tokens; only their SHA-256 hash is stored in Mongo with expiry (30 days). Cookie `prodterra_session`: httpOnly, SameSite=Lax, Secure in production, Path=/, optional Domain from env `SESSION_COOKIE_DOMAIN`. CORS with credentials. Login throttled. Endpoints: POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/me. Generic error for wrong email or password.
- D7 (S6, S7) Session UI: header shows "Iniciar sesión" or avatar (initials) from step 1. Login/register in a dialog that never leaves the current step. Avatar dropdown: "Mis fincas", "Cerrar sesión". The draft in localStorage stays, so returning from "Mis fincas" resumes where the farmer was. Saving is offered at the end ("Guardar mi plan"); it asks to log in only then.
- D8 (S6) Saved farms: per user collection with farm boundary, lots, rotation plan, farmer assessment and recommendation snapshot, name and dates. Endpoints under /farms scoped to the session user (list, create, get, update, delete). "Mis fincas" page lists them and opens both calendars; a saved farm can be opened back into the flow to add or change plans.
- D9 (S8) PDF: "Descargar PDF" on both calendars opens a print layout (all months of the horizon, one table per lot, legend, farm name and dates) and calls `window.print()`; print CSS hides the app chrome.

## Tasks

| ID | Specs | Stage | Repo | Route | Status | Commit / PR |
|---|---|---|---|---|---|---|
| T0 | S3 | Crop cycle days for all 10 crops in model and demo seed; rerun dev seed | api | inline | done | api PR #1 (0bc4fd7) |
| T1 | S1 | Planning start step with date picker and validations | web | inline | pending | |
| T2 | S2 | Rotation timeline builder per lot (domain + UI) | web | inline | pending | |
| T3 | S4 | Farmer calendar without climate | web | inline | pending | |
| T4 | S5 | POST /plans/evaluate + recommended vs farmer calendar | api+web | inline | pending | |
| T5 | S6 | Accounts API: users, argon2, httpOnly session cookie, throttling (Risk item 2, 5) | api | inline + verifier | pending | |
| T6 | S7 | Session UI: avatar/login, dialog without leaving flow, profile dropdown | web | inline | pending | |
| T7 | S6 | Saved farms and plans per user, "Mis fincas" page (Risk item 1, 2) | api+web | inline + verifier | pending | |
| T8 | S8 | Print/PDF views of both calendars | web | inline | pending | |
| T9 | S9 | READMEs, CHANGELOG, i18n, final screenshots pass | both | inline | pending | |

## Log

- L1 (2026-11-14, user, verbatim excerpt): "Esta app es par aayudarle a planificar rotaciones eficientemente a los granjerons ... puedes genrar un plan estructurado para hacer esto spor stages en aouto pilot ?"
- L2 (2026-11-14, user): "ok si todo el plan debes hace ren auto no voy a estar ... puedes firmar PGP por muchas horas, tienes full autorizaicon de corre los seed, al final acutalmente sta todo en develop, no merges a main pero si has comits y prs rpeiriodicos develop"
- L3 Decisions: the duplicated "¿Qué siembras en cada lote?" is read as one step (the timeline). PDF via print stylesheet and the browser's save-as-PDF (no new dependency). Sessions as opaque tokens stored in Mongo behind an httpOnly SameSite=Lax cookie; app and api share the site prodterra.earth. Seeds run only against the development database, never `production`. UX checklist lives in agent memory `prodterra-ux-lessons`.
