# User flow

The planner has six steps. "Empezar de cero" under the step bar clears everything and returns to step 1, after a warning.

| Step | What the farmer does |
|---|---|
| 1. Ubica tu finca | Searches a place, uses the device location or taps the map. |
| 2. Marca el borde | Draws the farm edge (0.01 ha to 1,000 ha). |
| 3. Divide en lotes | Draws lots, splits the farm into equal lots, or uses the whole farm as one lot. A summary shows the area, elevation and climate. |
| 4. Tu rotación | Picks the start date, then for each lot: previous use, irrigation and an ordered list of crops and rests. Each crop starts with its reference cycle. Blocks can be reordered by dragging. |
| 5. Tu calendario | Sees the plan as a month calendar, day by day. |
| 6. Recomendado | Compares the plan with the recommended one on the same calendar, with the month's typical climate and the alarms of each lot. "Crear un nuevo plan" starts again on the same farm. |

## Calendars

- Month grid with weeks from Monday. Each lot is a row; each crop is a bar with sowing and harvest marks.
- With up to 5 lots, the "Ver" selector can show all of them. With more than 5, the calendar shows one lot at a time and starts on the first one.
- In "Recomendado", each lot shows its status (Bien, Atención, Riesgo) with an icon and a word, and its alarms written as an action plus its cause.

## PDF export

"Descargar PDF" opens a dialog to choose:

- The calendar: "Tu calendario" or "Recomendado".
- The period: the whole plan or a range of months.
- The paper size: Letter or A4.
- Up to 5 lots. With more lots, the 5 with the most risk are preselected.

The PDF has one landscape page per month, with the grid as on screen and, for "Recomendado", the month's climate and alarms. It is generated in the browser.

## Accounts

An account is optional. It is only needed to save a farm ("Guardar mi plan") and open it later in "Mis fincas".

- Sign in with Google or with email and password.
- Password recovery by email; the link opens `/reset-password`.
- Each account has a farmer avatar and an editable name.
