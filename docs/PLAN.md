# Calorie Tracker — Implementation Plan

## Overview

A simple, no-login, single-page calorie tracker. Users search or quick-pick from a built-in list of 20+ common foods, add them to a daily log, and see a running calorie/macro total. As shipped in Phases 0-4, everything persists locally across page refreshes via `localStorage` — no accounts, no backend, no database. **Phase 6 changes this**: a small FastAPI + SQLite backend takes over as the source of truth for the daily log, and the app requires that backend running from then on — see [Photo Upload Feature](#photo-upload-feature-phases-5-10) below.

**Status: Phases 0–7 complete** (Phases 0–2 in [PR #1](https://github.com/AntonyAjay123/Calorie-Tracker/pull/1), Phase 3 in [PR #2](https://github.com/AntonyAjay123/Calorie-Tracker/pull/2), Phase 4 in [PR #3](https://github.com/AntonyAjay123/Calorie-Tracker/pull/3), Phase 5 in [PR #4](https://github.com/AntonyAjay123/Calorie-Tracker/pull/4), Phases 6–7 together in a later PR). Phases 8–10 (photo upload frontend, food icons, polish) are planned but not yet built — see [Photo Upload Feature](#photo-upload-feature-phases-5-10) below.

## Tech Stack

**Frontend (Phases 0-4):**
- **React** + **TypeScript**
- **Vite** (build tooling / dev server)
- **Tailwind CSS** (styling)
- **localStorage** (persistence — no backend, no external database)

**Backend (Phase 5+):**
- **Python 3.12+**, managed by **uv** (no pip/poetry)
- **FastAPI** + **Pydantic v2** (fully typed request/response schemas and config)
- **SQLite** + **SQLModel** — persists the daily log, replacing `localStorage` (Phase 6 ✅)
- **Anthropic Python SDK** — vision-capable Claude model call for the (not-yet-frontend-wired) photo analysis endpoint (Phase 7 ✅)

**Containerization (optional, not a numbered phase) ✅ Complete:**
- **Docker** + **Docker Compose** — `docker compose up --build` runs both services (dev-oriented: hot reload via bind mounts, not a production build). See `CLAUDE.md` → How to Run for the commands and the gotchas hit while setting it up (Docker-network hostnames vs. `localhost`, the file-watcher-over-bind-mount issue).

## Data Model

```ts
interface Food {
  id: string;
  name: string;
  calories: number;    // per serving
  protein: number;     // grams, per serving
  carbs: number;        // grams, per serving
  fat: number;          // grams, per serving
  servingSize: string;  // e.g. "100g", "1 medium", "1 cup"
}

interface LogEntry {
  id: string;           // uuid
  foodId: string;
  foodName: string;     // snapshot, in case foods.ts changes later
  quantity: number;     // multiplier of servings, default 1
  calories: number;     // snapshot: food.calories * quantity
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string;          // "YYYY-MM-DD", local date — scopes entries to a day
  loggedAt: string;      // ISO timestamp
}
```

`localStorage` key: `calorie-tracker:log` → `LogEntry[]`. All dates are kept in storage, but the MVP UI only ever reads/writes today's date — this keeps the door open for a future "view past days" feature without a storage migration. *(As of Phase 6, this `localStorage` layer is retired entirely in favor of a SQLite-backed backend API — see Phase 6 below.)*

## Component Tree

```
App
├── Header               — sticky top bar; today's total calories (+ macros)
├── FoodSearchPanel
│   ├── SearchBar         — text input, filters by name (case-insensitive substring)
│   └── FoodGrid/FoodCard — 20+ common foods; each card shows macros + serving size + "Add" action
└── DailyLog
    ├── LogEntryList
    │   └── LogEntryRow   — food name, quantity, calories, macros, delete button
    └── DailyTotals       — recomputed sum of calories/protein/carbs/fat
```

## UI Flow

1. User lands on the page — sees the calorie/macro total header (starts at 0 for a fresh day) and the food search panel below it, pre-populated with the full quick-add list.
2. User types in the search bar — the food grid filters live to matching names. Clearing the search shows the full list again.
3. User clicks "Add" on a food card — it's appended to today's log with a default quantity of 1 serving (optionally adjustable via a quantity stepper).
4. The daily log updates immediately, showing the new entry with its calories/macros; the header total updates to match.
5. User can remove any entry from the daily log, which recomputes the total.
6. On page refresh, today's log is reloaded from `localStorage` and rendered exactly as left.

## Folder Structure (target end-state after all phases)

```
calorie_tracker/
├── docs/
│   └── PLAN.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Header/           # ✅ Header (sticky) + DailyTotals
│   │   ├── FoodSearch/       # ✅ built — FoodSearchPanel, SearchBar, FoodGrid, FoodCard
│   │   └── DailyLog/         # ✅ DailyLog + LogEntryList + LogEntryRow
│   ├── data/
│   │   └── foods.ts        # ✅ 24 common foods
│   ├── hooks/
│   │   └── useFoodLog.ts   # ✅ log state + localStorage sync
│   ├── lib/
│   │   └── storage.ts      # ✅ localStorage read/write helpers
│   ├── types/
│   │   └── index.ts        # ✅ Food, LogEntry
│   └── utils/
│       └── date.ts         # ✅ today's date helpers
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env
├── .gitignore
├── CLAUDE.md
└── README.md
```

**Implementation notes (post Phase 0–2):**
- No `tailwind.config.ts` — Tailwind v4 is configured via the `@tailwindcss/vite` plugin and a single `@import "tailwindcss"` in `index.css`, not a JS config file.
- `.oxlintrc.json` and `package-lock.json` exist too — `oxlint` ships bundled with the current Vite `react-ts` template's `npm run lint` script (kept as-is rather than stripped out).

## Phases

Each phase should be implemented and verified (in a browser) before moving to the next.

### Phase 0 — Project Scaffolding ✅ Complete

- Scaffold with Vite's `react-ts` template.
- Install and configure Tailwind CSS.
- Set up the `src/` folder structure above with empty placeholder files.

**Assumptions:**
- npm as the package manager.
- Tailwind CSS v4 (latest stable at install time).
- No test framework or linter configured unless requested later. *(Actual: the current Vite `react-ts` template bundles `oxlint` by default — kept rather than removed, since it's zero-config and catches real issues, e.g. a `set-state-in-effect` warning during Phase 2.)*

### Phase 1 — Static Food Database + Search UI ✅ Complete

- Define the `Food` type in `types/index.ts`.
- Populate `data/foods.ts` with 20+ common foods (chicken breast, rice, eggs, banana, oats, broccoli, salmon, etc.), each with calories/protein/carbs/fat/servingSize. *(Actual: 24 foods.)*
- Build `SearchBar` (filters by substring match on name) and `FoodGrid`/`FoodCard` (shows all foods by default, filters live as the user types).
- Purely presentational in this phase — no "Add" wiring yet, no persistence.

**Assumptions:**
- Nutrition values are approximate, typical per-serving figures — not pulled from a live nutrition API.
- Search is a simple case-insensitive substring match, not fuzzy/typo-tolerant.

### Phase 2 — Food Log Data Model + localStorage Persistence ✅ Complete

- Define the `LogEntry` type.
- Build `lib/storage.ts` with `getEntries()` / `saveEntries()` (JSON read/write to `localStorage`).
- Build `hooks/useFoodLog.ts` exposing today's entries plus `addEntry(food, quantity)` / `removeEntry(id)`, backed by `storage.ts`.
- Wire each `FoodCard`'s "Add" action to `addEntry`, defaulting `quantity = 1`. *(Actual: each card has a −/+ quantity stepper in 0.5 increments, per user decision when this phase was implemented.)*

**Assumptions:**
- "Today" is derived from the browser's local date (`date.ts` helper).
- No multi-device sync — data lives in one browser's `localStorage`.
- Entries persist indefinitely across all dates in storage even though only today's are shown.

**Verified:** `npm run build` and `npm run lint` pass clean; manually tested in a real browser — search filtering, quantity stepper, Add action, and that a logged entry survives a page refresh (read back correctly from `localStorage`).

The gap noted above (no visible log/feedback when adding) is resolved by Phase 3 below.

### Phase 3 — Daily Log Display + Calorie/Macro Totals ✅ Complete

- Build `DailyLog` / `LogEntryList` / `LogEntryRow` to render today's entries with a delete action per row.
- Build `Header` / `DailyTotals` to compute and display the running total (calories, protein, carbs, fat) from today's entries, updating reactively on add/delete.

**Assumptions:**
- No calorie goal/target — just a running total, since none was requested.
- Totals recompute client-side on every state change; no memoization needed at this scale.

**Decisions confirmed with the user before building (not fully specified in the original plan above):**
- Entries display **newest-added first**, not chronological/oldest-first.
- Delete requires an inline **confirm/cancel** step, not immediate deletion and not a native `window.confirm` (kept out as a blocking, legacy-feeling pattern).

**Verified:** `npm run build`, `npm run lint`, and `npm test` (48 tests) all pass; manually tested in a real browser — totals update correctly on add/remove, entries sort newest-first, delete requires confirm, and everything survives a page refresh. Writing the tests surfaced and fixed a real bug: two entries sharing an identical `loggedAt` (e.g. added in the same millisecond) weren't guaranteed to sort newest-first — `LogEntryList` now reverses before its stable sort to fix this.

### Phase 4 — Polish & Stretch ✅ Complete

Scope was narrowed down with the user before building (see decisions below) to: a responsive/mobile layout pass, a deliberate visual design refresh, and one stretch goal (multi-day history). Custom food entry and in-place quantity editing remain deferred/out of scope.

- Quantity editor refinement (numeric input/stepper) if not already solid from Phase 2. — *Already solid from Phase 2 (−/+ stepper in 0.5 increments, min 0.5); no changes needed.*
- Empty states (no foods match search; log empty for today) and a responsive layout pass. — *Empty states already existed from Phases 1/3. Responsive pass: verified at mobile width (~390px) — Header's macro row wraps via `flex-wrap`, FoodGrid was already single-column below the `sm:` breakpoint, DateNav and DailyLog rows fit without overflow.*
- Multi-day history — **done**: `DateNav` (‹ Today ›) lets the user page through previous days; `useFoodLog` now takes the target date as an argument instead of hardcoding `todayDateString()`. All dates were already retained in `localStorage` since Phase 2, so this needed no storage migration.
- Custom (non-list) foods, editing an already-logged entry's quantity, and a daily calorie goal — still **not in scope**, per the narrowed-down decision below.

**Decisions confirmed with the user before building:**
- Primary focus: "polish + a real visual design refresh" over "responsive/functional polish only" — the app had been using generic Tailwind slate/emerald defaults; Phase 4 replaced this with a deliberate "nutrition facts label" identity (bold black rules, tabular numerals, one accent color per macro used consistently as small markers, sharp-cornered bordered cards instead of rounded-shadow cards). Full token system documented in `CLAUDE.md` → Design System.
- Of the stretch goals offered (multi-day history, custom food entry, in-place quantity editing), only **multi-day history** was selected.
- Viewing a past day is not read-only: "Add Food" logs to whichever date is currently selected, not always today, so a forgotten meal can be logged retroactively. Navigating into the future is blocked (next-day button disabled while on today).

**Verified:** `npm run build`, `npm run lint`, and `npm test` (66 tests) all pass; manually tested in a real browser at both desktop and mobile (~390px, via an iframe since the browser tool's window resize wasn't taking effect) widths — date navigation, retroactive logging on a past day, totals resetting per selected date, and the visual redesign all confirmed working.

## Photo Upload Feature (Phases 5-10)

Adds the app's first real backend: a FastAPI service (managed with `uv`, fully typed Python) that (a) persists the daily log in a **SQLite** database — replacing `localStorage` entirely — and (b) keeps the Anthropic API key server-side to proxy a single "analyze this food photo" call. Also adds an icon to each of the 24 existing catalog foods.

**Decisions confirmed with the user before planning this feature:**
- **AI output shape**: one best-guess food item per photo (name + calories/protein/carbs/fat/serving size), not multiple detected items on a plate.
- **Photo persistence**: the uploaded photo is never stored anywhere — the backend holds it in memory only for the duration of the analysis request.
- **Existing food icons**: since real stock photos can't be sourced/licensed here, each of the 24 catalog foods gets a food emoji (🍗🍚🥚🍌 etc.) instead of a photographic image — fits the app's existing flat "nutrition label" design system and needs no asset pipeline.
- **Daily log persistence**: **SQLite replaces `localStorage` entirely** as the source of truth for the log (not a dual-store split between catalog and photo entries). The app now requires the backend running at all times, not just for the photo feature. **No data migration** — this is still a personal/dev-stage project with no real users to protect, so SQLite starts empty and any existing browser `localStorage` data is simply left behind, unused.
- **Food name & calories, made explicit**: the AI's returned `name` is saved verbatim as the log entry's `foodName` — no user renaming step. The AI's returned calories (and protein/carbs/fat) are shown to the user in `PhotoResultCard` *before* they click "Add to log", not just after.
- "Python-typescript" in the original request is interpreted as **fully-typed Python** (type hints throughout + Pydantic/SQLModel models) — what `uv` + FastAPI naturally support, not a literal TypeScript backend.

### Phase 5 — Backend Scaffolding (FastAPI + uv) ✅ Complete

- Created `backend/` (sibling to `src/`), scaffolded with `uv init --app`: `backend/pyproject.toml` (`fastapi[standard]`, `pydantic-settings`, `python-multipart`; dev: `pytest`), `backend/app/main.py` (FastAPI instance, CORS middleware restricted to `http://localhost:<any port>`, `GET /api/health`), `backend/app/config.py` (`Settings`/`get_settings()` loading `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` from the root `.env`).
- Added `server.proxy` for `/api` to `vite.config.ts` so the frontend can call same-origin `/api/...` in dev.
- No AI calls, no database yet — this phase only proves the two processes can talk to each other.

**Assumptions:**
- Local dev only (no deployment/hosting config in this phase).
- Python 3.12+ (`requires-python = ">=3.12"`; developed against 3.13.9), managed entirely by `uv` (`uv sync`, `uv run`) — no pip/poetry.
- App fails fast at startup if `ANTHROPIC_API_KEY` is missing (`Settings` has no default for it, so `pydantic-settings` raises immediately), rather than failing silently on first upload — verified by a test that clears the env var and asserts a `ValidationError`.

**Deviation from the plan — backend runs on port 8001, not 8000:** on this dev machine, port 8000 is already bound by Docker Desktop's WSL2 port-forwarding (`com.docker.backend.exe`/`wslrelay.exe`) for an unrelated project. Connecting to `localhost:8000` silently hit that container instead of this app (it returned a different JSON payload, `{"status":"ok","db":"ok"}`, which is how the conflict was caught). `vite.config.ts`'s proxy target and the documented run command both point at `:8001` instead — see the port note in `CLAUDE.md` → How to Run.

**Verified:** `uv run pytest` (5 tests: `Settings` fail-fast/defaults/override, `/api/health`) passes; `uv run fastapi dev app/main.py --port 8001` boots cleanly and `curl http://127.0.0.1:8001/api/health` returns `{"status":"ok"}`; with the frontend dev server also running, `curl http://localhost:5173/api/health` returns the same response, confirming the Vite proxy reaches the backend end-to-end. Frontend `npm run build`/`lint`/`test` (66 tests) still pass unaffected by the `vite.config.ts` change.

### Phase 6 — Daily Log Database (SQLite) ✅ Complete

- Add `sqlmodel` to `backend/pyproject.toml` (Pydantic + SQLAlchemy combined — one model class serves as both the DB table and the API schema; chosen over raw SQLAlchemy for less boilerplate and over plain `sqlite3` for actual type safety).
- `backend/app/models.py`: a `LogEntry` SQLModel table (id, foodId, foodName, quantity, calories, protein, carbs, fat, servingSize, date, loggedAt, source). `backend/app/db.py`: engine + session setup; tables created on startup (`SQLModel.metadata.create_all`) — no Alembic/migrations for this MVP.
- `backend/app/routers/log.py`: `GET /api/log?date=YYYY-MM-DD` (list for a date), `POST /api/log` (create — **server assigns `id` via `uuid.uuid4()` and stamps `loggedAt`**, so `id` stays a `string` end-to-end and the existing TS type barely changes), `DELETE /api/log/{id}`.
- SQLite file at `backend/data/calorie_tracker.db` — **new `.gitignore` entry needed** (`backend/data/`), since this is real user data, not source.
- **Frontend**: rewrite `src/lib/storage.ts` from a synchronous `localStorage` wrapper into an async `fetch`-based API client. `src/hooks/useFoodLog.ts` becomes async (loading/error state); business logic (quantity × macro scaling) stays client-side exactly as today — the backend just persists/returns already-computed entries. `App.tsx`/`DateNav` show a loading state per date change (was instant client-side filtering before) and a friendly "can't reach the server" state if the backend is down (a failure mode that didn't exist with pure `localStorage`).
- **This is the phase that replaces `localStorage`.** No migration of existing browser data, per the confirmed decision above.

**Assumptions:**
- Only the daily log moves to SQLite — the 24-item food catalog (`src/data/foods.ts`) stays a static frontend file; it doesn't change, so there's no reason to add DB complexity there.
- `GET /api/log` is scoped by a single `date` query param, matching how the frontend already only ever needs one date's entries at a time.

**Deviation from the plan — the frontend/backend field-name boundary:** rather than aliasing the backend's Pydantic models to emit camelCase JSON, the backend uses idiomatic Python `snake_case` field names throughout (`food_id`, `logged_at`, etc.), and `src/lib/storage.ts` (the API client) translates to/from the frontend's camelCase `LogEntry` type at the wire boundary. This keeps both sides idiomatic to their own language without alias-generator machinery, and centralizes the translation in exactly the file whose job is talking to the backend.

**Verified:** backend `pytest` (22 tests total, up from 5) — CRUD tests for `GET`/`POST`/`DELETE /api/log` against a fresh in-memory SQLite DB per test (via `app.dependency_overrides` + a `StaticPool`-backed engine, not the real `backend/data/` file). Frontend: `storage.test.ts` rewritten to mock `fetch` and assert the snake_case-to-camelCase translation; `useFoodLog.test.ts` rewritten to mock `lib/storage` and assert loading/error state transitions plus `waitFor`-based async flows; `App.test.tsx` rewritten around a small in-memory fake backend (a stubbed `fetch` implementing `/api/log`'s three endpoints) so the search-add-display-totals-delete-navigate flow is still exercised end-to-end, plus a new case for the backend-unreachable error state. 72 frontend tests total (up from 66). `npm run build` and `npm run lint` both pass (lint has one pre-existing-pattern `set-state-in-effect` warning in `useFoodLog.ts`'s data-fetching effect — a warning, not an error, same category already accepted as fine back in Phase 2).

### Phase 7 — Photo Analysis Endpoint (Anthropic Vision Integration) ✅ Complete

- `backend/app/schemas.py`: `FoodAnalysisResult` (name, calories, protein, carbs, fat, serving_size, disclaimer).
- `backend/app/vision.py`: one Anthropic Messages API call (`client.messages.create`, image passed as a base64 content block) with a strict-JSON system prompt; `_parse_result` validates/parses the response text into `FoodAnalysisResult`, raising `VisionAnalysisError` on any failure (bad JSON, missing fields, refusal, upstream error).
- `POST /api/analyze-food-image`: validates content-type (`image/jpeg`/`png`/`webp`) and size (8MB max) server-side, calls `vision.py`, returns the result (200) or a typed error (415 unsupported type, 413 too large, 502 on a `VisionAnalysisError`). Image is never written to disk or the database — this endpoint stays stateless even though Phase 6 added a database for the log.

**Assumptions:**
- One item per photo, per the confirmed decision above.
- No caching/deduplication of repeated uploads — acceptable for a single-user local app.
- No typed error *response body* beyond FastAPI's default `{"detail": "..."}` shape for `HTTPException` — simpler than a bespoke error schema, and the frontend (Phase 8) only needs the status code plus a message to show.

**Verified:** backend `pytest` — `test_vision.py` covers `_parse_result` directly (valid JSON, malformed JSON, missing fields) and `analyze_food_image` against a fake Anthropic client (`monkeypatch.setattr("app.vision.Anthropic", ...)`, so no real network/API-key use in tests); `test_analyze.py` covers the endpoint's content-type/size validation and both the success and `VisionAnalysisError`-to-502 paths by monkeypatching `app.routers.analyze.analyze_food_image`. No frontend changes yet — Phase 8 is what calls this endpoint from the UI.

### Phase 8 — Photo Upload Frontend ⬜ Not started

- `src/types/index.ts`: add `PhotoAnalysisResult`.
- `src/hooks/usePhotoAnalysis.ts`: `idle | uploading | success | error` state machine, POSTs the file as `multipart/form-data`, returns the typed result/error.
- `src/components/PhotoUpload/PhotoUploadPanel.tsx`: file input (`capture="environment"` for mobile camera), preview, Analyze action, loading/error states — reuses existing `ink`/`paper`/`line` design tokens, no new colors.
- `src/components/PhotoUpload/PhotoResultCard.tsx`: **displays the AI's returned name, calories, and macros before the user acts** (same macro-dot styling as `FoodCard`, plus a quantity stepper). On "Add to log", it calls `useFoodLog`'s `addEntry` with `foodName` set verbatim from the AI's `name` field (no rename step) and the displayed calories/macros scaled by the chosen quantity — which, since Phase 6 already made `useFoodLog`/`addEntry` a generic async log client, needs **no further changes to `useFoodLog` or `storage.ts`** at this point.
- `App.tsx`: a simple Search/Photo toggle inside "Add Food" — one integration point into `addEntry`, no new page.
- Client-side validation mirrors the backend's (type/size) for instant feedback before the round-trip.

**Assumptions:**
- No photo persisted anywhere, per the confirmed decision above — only the resulting `LogEntry` (via Phase 6's `POST /api/log`) is kept.
- The quantity stepper pattern from `FoodCard` is reused so a user can scale the AI's estimate (e.g. "1.5x this plate").

### Phase 9 — Existing Food Item Icons (emoji) ⬜ Not started

- Extend `Food` with a required `emoji: string`; add one to each of the 24 entries in `src/data/foods.ts`.
- Render it in `FoodCard.tsx` next to the food name.

**Assumptions:**
- OS/browser emoji font only — no image assets, no `public/` additions, no licensing concerns, per the confirmed decision above.

### Phase 10 — Polish & Guardrails (optional, discuss before building) ⬜ Not started

- Basic request throttling on `/api/analyze-food-image` to guard against runaway API cost during local dev.
- Client- or server-side image downscaling before sending to Anthropic (token cost + upload speed).
- Retry affordance in the UI if analysis fails (network error, AI couldn't identify the food).
- Surfacing `ANTHROPIC_MODEL` configurability more visibly (currently just an env var).
- Alembic migrations, if the `log_entries` schema needs to evolve beyond Phase 6's initial shape.

**Assumptions:**
- This phase is intentionally deferred/optional, same convention as Phase 4's polish phase — only pursued if requested after Phases 5-9 ship.
