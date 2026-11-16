# Architecture

## Features

Code is organized by feature under `src/features`.

| Feature | Responsibility |
|---|---|
| `farm-mapping` | Map, location, farm edge, lots, equal split and the farm summary. |
| `rotation-plan` | Start date, rotation editor per lot and the farmer calendar (step 5). |
| `calendar` | Shared month grid and the "Recomendado" step (step 6). |
| `calendar-export` | PDF export dialog and PDF document. |
| `account` | Session, sign in and registration, profile and password reset. |
| `saved-farms` | "Guardar mi plan" and the "Mis fincas" page. |

Shared UI pieces (dialog, notices, language switcher, brand) live in `src/shared/components`.

## Layers

Each feature is split into the same layers:

| Layer | Contents |
|---|---|
| `domain` | Pure rules, with unit tests. |
| `application` | State and use cases. |
| `infrastructure` | API clients, map services and browser storage. |
| `components` | React components. |

## Internationalization

Texts live in `messages/es.json` and `messages/en.json` (next-intl). Spanish is the default.

## Browser storage

The plan in progress is kept in the browser, so it survives a page reload without an account.

| Key | Contents |
|---|---|
| `prodterra.farmDraft` | Current step, farm edge and lots. |
| `prodterra.rotationPlan` | Start date and the rotation of each lot. |
| `prodterra.mapView` | Last map position. |
| `prodterra.activeSavedFarm` | Saved farm currently open. |

## PDF

PDFs are built with `@react-pdf/renderer`. The library and its fonts load only when the farmer exports, so they do not slow down the app.
