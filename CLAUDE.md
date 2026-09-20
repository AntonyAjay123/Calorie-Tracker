# Calorie Tracker

## What This Is

A simple, single-page calorie tracker web app. No login, no accounts. Users search or quick-pick from a built-in list of 20+ common foods (chicken, rice, eggs, banana, etc.), add them to a daily log, and see a running calorie and macro (protein/carbs/fat) total. A date navigator (`‹ Today ›`) lets users page through and log food for previous days too, not just today. **The daily log is persisted server-side in a SQLite database — the backend must be running for the app to work at all**, not just for the photo feature below (see Phase 6 in Build Status).

⬜ **In progress (Phases 8-10):** upload a photo of food and have it automatically analyzed for calories/macros via the Anthropic API. The backend side of this is done — `POST /api/analyze-food-image` (Phase 7 ✅) calls a vision-capable Claude model and returns a typed result — but there's no frontend UI to call it yet. See **Photo Upload Feature (Technical Design)** below.

See [docs/PLAN.md](docs/PLAN.md) for the full architecture and phased build plan.

## Tech Stack

### Frontend

- **React 19** + **TypeScript**
- **Vite** — build tooling and dev server
- **Tailwind CSS v4** — styling, wired in via the `@tailwindcss/vite` plugin (no `tailwind.config.ts`/PostCSS config needed in v4)
- `src/lib/storage.ts` — `fetch`-based client for the backend's `/api/log` endpoints; no client-side persistence of its own (see Backend below)
- **oxlint** — linting (bundled by the Vite scaffold)
- **Vitest** + **React Testing Library** + `jsdom` — unit/component/integration testing
- **Archivo** (Google Fonts) — the app's one type family; see Design System below

### Backend (Phase 5+)

- **Python 3.12+**, dependency management + virtualenv via **uv** (`uv sync`, `uv run` — no pip/poetry)
- **FastAPI** — the HTTP API framework
- **Pydantic v2** + `pydantic-settings` — typed request/response schemas and typed env-var config
- **SQLite** + **SQLModel** (Phase 6 ✅) — persists the daily log; SQLModel combines a Pydantic schema and a SQLAlchemy table in one class, so there's no separate ORM-model/API-schema duplication
- **Anthropic Python SDK** (Phase 7 ✅) — calls a vision-capable Claude model to analyze uploaded food photos, via `POST /api/analyze-food-image` (not yet called from the frontend — that's Phase 8)
- **Uvicorn** — ASGI server for local dev

The backend keeps `ANTHROPIC_API_KEY` server-side (it can never safely live in browser code) and proxies the "analyze this photo" call. As of Phase 6, it is **not** stateless overall — it owns the SQLite database that the daily log lives in — but the photo-analysis endpoint specifically stays stateless (the image itself is never written to disk or the database). See **Photo Upload Feature (Technical Design)** below.

### Containerization (optional)

- **Docker** + **Docker Compose** — an alternative to running `npm`/`uv` directly on the host. Not part of any numbered phase (it's tooling, not a feature). Commands under How to Run below; design rationale in **Docker Containerization (Technical Design)**.

## How to Run

```bash
npm install
npm run dev         # start local dev server (http://localhost:5173)
npm run build       # type-check (tsc -b) + production build
npm run lint        # oxlint
npm run preview     # preview the production build locally
npm test            # run the test suite once (vitest run)
npm run test:watch  # run the test suite in watch mode
```

> Node note: Vitest 5 declares an engines range of `^22.12.0 || ^24.0.0 || >=26.0.0`. This project has been developed and verified on Node v23.11.0, which falls outside that range — `npm install` prints an `EBADENGINE` warning, but the full suite (`build`, `lint`, `test`) runs correctly on it in practice. If you hit real Vitest issues, try Node 22 or 24 LTS first.

**Backend (Phase 5+)** — runs as a second process, separate terminal:

```bash
cd backend
uv sync                                      # install backend dependencies
uv run fastapi dev app/main.py --port 8001   # start the backend dev server (http://localhost:8001)
uv run pytest                                # run the backend test suite
```

Both the frontend (`npm run dev`) and backend (`uv run fastapi dev ...`) need to be running simultaneously — as of Phase 6, the daily log itself lives in the backend's SQLite database, so the app can't add/view/remove log entries at all without it running, not just the not-yet-built photo-upload feature. The frontend's Vite dev server proxies `/api/...` requests to the backend (`vite.config.ts`'s `server.proxy`).

> Port note: the backend runs on **8001**, not FastAPI's usual default of 8000. On this dev machine, port 8000 is already occupied by Docker Desktop's WSL2 port-forwarding (`com.docker.backend.exe` / `wslrelay.exe`) for an unrelated project — connecting to `localhost:8000` silently hit that instead of this app, returning a different JSON payload. If you hit something similar on another machine, `uv run fastapi dev app/main.py --port <anything free>` plus updating `vite.config.ts`'s proxy target is all that needs to change.

**Docker (optional, all-in-one)** — runs both services without installing Node/Python/uv on the host:

```bash
docker compose up --build   # first run, or after changing a Dockerfile/dependency
docker compose up           # subsequent runs
docker compose down         # stop and remove the containers
```

Or via the convenience PowerShell scripts in `scripts/` (work from any directory, not just the repo root):

```powershell
./scripts/start-app.ps1          # docker compose up -d
./scripts/start-app.ps1 -Build   # docker compose up --build -d, after a Dockerfile/dependency change
./scripts/stop-app.ps1           # docker compose down
./scripts/stop-app.ps1 -Volumes  # docker compose down -v, also clears the node_modules/.venv volumes
```

This starts the frontend at `http://localhost:5173` and the backend at `http://localhost:8001`, same ports as running them directly. It's a **dev-oriented** setup, not a production build — see **Docker Containerization (Technical Design)** below for why it's built this way (bind mounts vs. named volumes, cross-container networking, secret handling, and two real gotchas hit while setting it up).

Run tests inside the containers with `docker compose exec backend uv run pytest` / `docker compose exec frontend npm test`.

## Folder Structure

```
calorie_tracker/
├── docs/
│   └── PLAN.md              # architecture + phased implementation plan
├── src/
│   ├── main.tsx
│   ├── App.tsx                       # owns selectedDate state; wires DateNav + useFoodLog(date) into Header/FoodSearchPanel/DailyLog
│   ├── index.css                     # Tailwind entry + `@theme` design tokens (colors, font)
│   ├── components/
│   │   ├── FoodSearch/
│   │   │   ├── FoodSearchPanel.tsx   # owns search query state + filtering
│   │   │   ├── SearchBar.tsx         # controlled text input
│   │   │   ├── FoodGrid.tsx          # renders FoodCard list / empty state
│   │   │   └── FoodCard.tsx          # macros (with color dots) + quantity stepper + Add button
│   │   ├── Header/
│   │   │   ├── Header.tsx            # sticky top bar; renders DailyTotals
│   │   │   └── DailyTotals.tsx       # calories + protein/carbs/fat, pure/presentational
│   │   ├── DateNav/
│   │   │   └── DateNav.tsx           # ‹ Today › control; disables "next" at today, shows a Today jump link otherwise
│   │   └── DailyLog/
│   │       ├── DailyLog.tsx          # static "Log" heading + LogEntryList (date-agnostic; DateNav carries date context)
│   │       ├── LogEntryList.tsx      # sorts entries newest-first, renders empty state
│   │       └── LogEntryRow.tsx       # one entry; delete needs an inline confirm/cancel
│   ├── data/
│   │   └── foods.ts                  # static list of 24 common foods
│   ├── hooks/
│   │   └── useFoodLog.ts             # useFoodLog(date) -> {entries, isLoading, error, addEntry, removeEntry}; async, backed by storage.ts
│   ├── lib/
│   │   └── storage.ts                # async fetch client for /api/log; translates snake_case backend JSON <-> camelCase LogEntry
│   ├── types/
│   │   └── index.ts                  # Food, LogEntry types
│   ├── utils/
│   │   ├── date.ts                   # todayDateString(), addDays(), isToday(), formatDateLabel() (all local-date, not UTC)
│   │   ├── totals.ts                 # calculateTotals(entries) -> {calories, protein, carbs, fat}
│   │   └── format.ts                 # round1() for display-rounding macros
│   ├── test/
│   │   └── setup.ts                  # jest-dom matchers + RTL auto-cleanup, loaded by vitest
│   ├── App.test.tsx                  # integration: search -> add -> log display -> totals -> confirm-delete -> date navigation
│   ├── lib/storage.test.ts           # unit
│   ├── utils/{date,totals,format}.test.ts  # unit
│   ├── hooks/useFoodLog.test.ts      # unit (includes date-rescoping behavior)
│   ├── components/FoodSearch/*.test.tsx    # component + FoodSearchPanel integration tests
│   ├── components/Header/*.test.tsx        # component
│   ├── components/DateNav/DateNav.test.tsx # component (today vs. past-date states, button handlers)
│   └── components/DailyLog/*.test.tsx      # component (LogEntryRow's confirm flow, LogEntryList's sort/tie-break)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                    # registers @vitejs/plugin-react + @tailwindcss/vite; `test` block configures Vitest (defineConfig imported from `vitest/config`, not `vite`); server.proxy forwards /api -> the backend (BACKEND_URL, default :8001); DOCKER=true enables polling for the watcher
├── .oxlintrc.json
├── Dockerfile                          # frontend image: npm install, bind-mount overrides source at runtime (dev-oriented, no prod build)
├── docker-compose.yml                  # orchestrates frontend + backend; see How to Run's Docker section
├── .dockerignore                       # excludes backend/, node_modules/, dist/, .git/, etc. from the frontend build context
├── scripts/
│   ├── start-app.ps1                   # docker compose up -d (or --build -d with -Build); works from any directory
│   └── stop-app.ps1                    # docker compose down (or down -v with -Volumes); works from any directory
├── backend/                           # ✅ Phase 5-7: scaffolding, log database, vision endpoint all done; ⬜ Phase 8 wires the frontend to it
│   ├── Dockerfile                     # backend image: uv sync, bind-mount overrides source at runtime (dev-oriented)
│   ├── .dockerignore                  # excludes .venv/, __pycache__/, data/, etc. from the backend build context
│   ├── pyproject.toml                 # uv-managed: fastapi[standard], pydantic-settings, python-multipart, sqlmodel, anthropic (dev: pytest)
│   ├── uv.lock
│   ├── .python-version                # 3.13 (requires-python = ">=3.12")
│   ├── data/                          # gitignored; holds calorie_tracker.db (SQLite file, real user data) once the app has run
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # ✅ FastAPI app w/ lifespan (creates DB tables on startup), CORS (any localhost port), GET /api/health, includes the log + analyze routers
│   │   ├── config.py                  # ✅ Settings/get_settings(): reads ANTHROPIC_API_KEY / ANTHROPIC_MODEL from the root .env; fails fast if the key is missing
│   │   ├── db.py                      # ✅ SQLite engine + get_session() dependency; create_db_and_tables() called from main.py's lifespan
│   │   ├── models.py                  # ✅ LogEntry (SQLModel table=True, doubles as the API response schema) + LogEntryCreate (POST body)
│   │   ├── routers/
│   │   │   ├── log.py                 # ✅ GET/POST /api/log, DELETE /api/log/{id} — server assigns id (uuid4) + logged_at
│   │   │   └── analyze.py             # ✅ POST /api/analyze-food-image — validates content-type/size, calls vision.py
│   │   ├── schemas.py                 # ✅ FoodAnalysisResult (Pydantic)
│   │   └── vision.py                  # ✅ builds the Anthropic vision call (base64 image content block), validates the strict-JSON response into FoodAnalysisResult
│   └── tests/                         # ✅ test_config.py, test_health.py, test_log.py (CRUD, in-memory SQLite via dependency_overrides), test_vision.py + test_analyze.py (mocked Anthropic client, no network)
├── .env                                # already holds ANTHROPIC_API_KEY, read by the backend
├── .gitignore                          # covers Python/uv artifacts from the original scaffold, plus backend/data/ (the real SQLite file)
└── CLAUDE.md
```

Note: Tailwind v4 needs no `tailwind.config.ts` — theme/config lives in CSS via the Vite plugin.

## Data Model

```ts
interface Food {
  id: string;
  name: string;
  calories: number;    // per serving
  protein: number;      // grams, per serving
  carbs: number;        // grams, per serving
  fat: number;          // grams, per serving
  servingSize: string;  // e.g. "100g", "1 medium", "1 cup"
  emoji: string;         // ⬜ Phase 9 — one per catalog food, e.g. "🍗"; no image assets
}

interface LogEntry {
  id: string;             // uuid; server-generated (Python uuid.uuid4()), not client-generated
  foodId: string;
  foodName: string;
  quantity: number;     // multiplier of servings
  calories: number;      // snapshot: food.calories * quantity
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string;           // "YYYY-MM-DD"
  loggedAt: string;       // ISO timestamp; stamped server-side, not client-side (avoids client clock skew)
  source?: 'catalog' | 'photo';  // ⬜ Phase 8 — distinguishes photo-analyzed entries; the DB column exists (Phase 6), but nothing sets it to 'photo' yet since the photo-upload UI isn't built
}

// ✅ Phase 7 — returned by the backend's POST /api/analyze-food-image, not persisted as-is.
// The frontend (⬜ Phase 8) will wrap this into a synthetic Food and pass it through the existing
// addEntry — since addEntry already talks to the Phase 6 backend API, it becomes a normal
// LogEntry (with source: 'photo', name saved verbatim from `name` below, calories/macros shown
// to the user before they submit) with no further changes needed to useFoodLog or storage.ts.
interface PhotoAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;   // the AI's own estimate of what it saw, e.g. "~1 cup"
  disclaimer: string;    // fixed note that this is an AI estimate, not a lab measurement
}
```

**As shipped in Phases 0–4**: stored under the `calorie-tracker:log` key in `localStorage` as a `LogEntry[]`. All dates were always kept in storage (even in Phases 0–3, when only "today" was ever read) — Phase 4's multi-day history was purely a UI change (`App.tsx` filters by a `selectedDate` state instead of hardcoding today), with no storage migration needed at the time.

**As of Phase 6 (✅ current)**: `localStorage` persistence for the log is retired entirely. `LogEntry`s live in a SQLite database behind the backend (`backend/app/models.py`'s `LogEntry` SQLModel table), accessed via `GET /api/log?date=...`, `POST /api/log`, `DELETE /api/log/{id}`. Per the confirmed decision, there was **no migration** of existing browser `localStorage` data — SQLite started empty. The food catalog (`Food[]` in `src/data/foods.ts`) is unaffected and stays a static frontend file. The backend's own field names are snake_case (`food_id`, `logged_at`, etc.) — `src/lib/storage.ts` translates to/from the frontend's camelCase `LogEntry` at the wire boundary, so nothing above the storage layer needs to know the backend's naming convention.

## Design System

Phase 4 replaced the initial generic Tailwind slate/emerald look with a deliberate "nutrition facts label" identity: bold black rules, tabular numerals, sharp-cornered bordered cards instead of rounded-shadow SaaS cards. Defined as Tailwind v4 `@theme` tokens in `src/index.css`:

- **Colors** (used as Tailwind utilities, e.g. `bg-ink`, `text-ink-muted`): `paper` #fbf8f3 (background), `ink` #1b1712 (text/rules), `ink-muted` #75695c (secondary text), `line` #e4ddd1 (hairline borders). Each macro has one fixed accent used only as a small dot/marker, never a large fill: `calorie` #c08a1e (gold), `protein` #9a3324 (brick red), `carb` #a67c3d (wheat), `fat` #5c6b3f (olive). The same four colors are reused everywhere a macro appears (Header, FoodCard, anywhere else one might be added) so they function as a consistent legend.
- **Type**: one family, **Archivo** (loaded via Google Fonts in `index.html`), varied by weight — `font-black` (900) for big numbers (calorie totals), regular/medium weights for body and UI text. `font-variant-numeric: tabular-nums` is set globally on `body` so numbers align.
- **Layout**: sharp corners (no `rounded-lg`/shadow "card kit" look), borders do the organizing work instead. `Header` is `position: sticky` with a 3px `border-ink` bottom rule; `DateNav` is a slim non-sticky strip directly below it; `DailyLog` renders as bordered ledger rows, not a boxed list.

**If extending the UI**, reuse these tokens rather than reaching for Tailwind's default palette (`slate-*`, `emerald-*`, etc.) or adding `rounded-lg`/`shadow-sm` card styling — that would reintroduce the generic look this phase deliberately moved away from.

## Photo Upload Feature (Technical Design)

✅ Phases 5–7 (backend: scaffolding, log database, vision endpoint) are complete. ⬜ Phases 8–10 (photo-upload frontend, catalog food-emoji icons, polish) are not yet built — see `docs/PLAN.md` for the full phase breakdown. This feature also carried the app's biggest architecture change to date: **Phase 6 moved the daily log's persistence from `localStorage` to a SQLite database behind the backend** — read that part carefully, since it affects every phase after it, not just the photo-upload UI.

**Daily log persistence (Phase 6 ✅):** `GET /api/log?date=...`, `POST /api/log`, `DELETE /api/log/{id}` (`backend/app/routers/log.py`) back onto a SQLite database via **SQLModel** (`backend/app/models.py`'s `LogEntry` class doubles as the DB table and the API schema). The backend assigns `id` (`uuid.uuid4()`) and stamps `logged_at` server-side. `src/lib/storage.ts` was rewritten from a synchronous `localStorage` wrapper into an async `fetch`-based API client (also translating snake_case<->camelCase at the wire boundary — see Data Model above); `src/hooks/useFoodLog.ts` became async and gained `isLoading`/`error` state, since every date change (via `DateNav`) and every add/remove now round-trips to the backend instead of touching an in-memory/localStorage array — `DailyLog` renders a "Loading…" message or the error text in place of the entry list while that's in flight. Quantity × macro scaling stays a frontend computation (in `useFoodLog.addEntry`) — the backend just stores/returns whatever entry it's given. **No migration** of pre-existing browser `localStorage` data (confirmed decision) — SQLite simply started empty. From this phase on, **the app requires the backend running** to function at all, not just for the photo feature.

**Photo analysis endpoint (Phase 7 ✅, backend only):** `POST /api/analyze-food-image` (`backend/app/routers/analyze.py`) accepts `multipart/form-data`, validates content-type (`image/jpeg`/`png`/`webp`, else 415) and size (8MB max, else 413), then calls `backend/app/vision.py`'s `analyze_food_image`, which sends the image to a vision-capable Claude model (`client.messages.create` with the image as a base64 content block) with a system prompt demanding strict JSON, and parses that JSON into a `FoodAnalysisResult` (`backend/app/schemas.py`) — raising `VisionAnalysisError` (-> 502) on malformed JSON, a missing field, or a refusal. Not yet called from anywhere in the frontend.

**Photo analysis data flow (⬜ Phase 8, not yet built):** the user will select or capture a photo in `PhotoUploadPanel` → it's POSTed to `/api/analyze-food-image` (same-origin in dev, via Vite's `server.proxy`, which forwards to the FastAPI backend on `:8001`) → the frontend will render the Phase 7 endpoint's result in `PhotoResultCard`, **showing the AI's returned name, calories, and macros to the user before they act** → on "Add to log", the result gets wrapped into a synthetic `Food` (using the AI's `name` verbatim as `foodName` — no rename step) and passed through `useFoodLog().addEntry`, which already talks to the Phase 6 backend API — so Phase 8 needs **no further changes** to `useFoodLog` or `storage.ts` beyond what Phase 6 already did. The result becomes a normal `LogEntry` (tagged `source: 'photo'`) in the same SQLite table as catalog-based entries.

**Statelessness (photo analysis only):** the backend holds the uploaded image in memory only for the duration of one `/api/analyze-food-image` request. Nothing is written to disk or the database for the image itself — per the confirmed decision, the photo is discarded after analysis; only the resulting `LogEntry` (via `POST /api/log`) will be kept once Phase 8 wires this up. This is narrower than it sounds: the backend as a whole is **not** stateless now that Phase 6 has landed (it owns the log's database), only this one endpoint is.

**Secret handling:** `ANTHROPIC_API_KEY` is read only by the backend process, from the existing repo-root `.env` (not a new `backend/.env` — no reason to duplicate the secret). It is never sent to, or readable by, the frontend bundle.

## Docker Containerization (Technical Design)

✅ Complete — optional tooling, not a numbered phase (see `docs/PLAN.md`). `docker compose up --build` (or `./scripts/start-app.ps1`) runs the whole app without installing Node/Python/uv on the host. Commands are under How to Run above; this section covers why it's built the way it is.

**Scope decision:** dev-oriented, not a production build. Both containers run their normal dev commands (`npm run dev`, `uv run fastapi dev --reload`) rather than a multi-stage build serving compiled output — chosen because the project has no deployment target yet and is still mid-development (Phases 8-10 of the photo-upload feature aren't built). A production Dockerfile would need revisiting once there's somewhere to actually deploy to.

**Bind mounts + named volumes:** each service's whole directory is bind-mounted into its container (`.:/app` for frontend, `./backend:/app` for backend) so host-side edits are visible inside immediately — that's what makes hot reload work without rebuilding. The catch: a bind mount at `/app` would also overwrite `/app/node_modules` or `/app/.venv` with whatever (or nothing) exists in that directory on the host, which is either empty or has host-platform-specific binaries incompatible with the Linux container. Each service gets its own **named volume** scoped to just that subdirectory (`frontend-node-modules:/app/node_modules`, `backend-venv:/app/.venv`), which Docker layers on top of the broader bind mount — the container's own build-time `npm install`/`uv sync` output survives, regardless of what's (or isn't) on the host.

**Cross-container networking:** `vite.config.ts`'s dev proxy target is configurable via a `BACKEND_URL` env var instead of being hardcoded to `localhost:8001`. Inside Docker Compose, `localhost` from the frontend container's perspective is the frontend container itself — the backend is a separate container, reachable only via Compose's internal DNS at its service name (`http://backend:8001`). `docker-compose.yml` sets `BACKEND_URL=http://backend:8001` for the frontend service; local (non-Docker) dev leaves it unset and falls back to `http://localhost:8001`, so the same `vite.config.ts` works in both contexts.

**Secret handling:** the backend container reads `ANTHROPIC_API_KEY` from the existing repo-root `.env` via Compose's `env_file:` directive — no separate `backend/.env`, consistent with local dev. (`backend/app/config.py`'s `ROOT_ENV_FILE` path, which walks up from `__file__` to find the repo root, doesn't actually resolve correctly inside the container's `/app` directory structure — but it doesn't need to: Compose injects the variable as a real process environment variable, and `pydantic-settings` reads directly from `os.environ` regardless of whether its configured `env_file` path exists. Verified by confirming the backend container's fail-fast startup check passed.)

**Two real issues found during manual verification, not assumed away:**
- **File-watching over bind mounts:** Docker Desktop doesn't reliably forward native filesystem change events into Linux containers for host-side edits. FastAPI's `watchfiles`-based reloader handled this fine (confirmed via a live edit to `app/main.py`), but Vite's default watcher silently missed changes — editing `src/App.tsx` on the host produced no visible update in the browser until a hard refresh happened to fetch the since-updated module directly. Fixed by gating Vite's `server.watch.usePolling` behind a `DOCKER=true` env var, set only by `docker-compose.yml`'s frontend service; local dev is unaffected.
- **Port 8000 conflict, reconfirmed:** this dev machine has an unrelated Docker container already bound to host port 8000 (a different, unrelated project) — the same conflict Phase 5 found when running the backend directly outside Docker. It's why the backend's container also maps to port 8001, not 8000.

## Build Status

Phases 0–7 are implemented (see `docs/PLAN.md` for full phase definitions):

- ✅ **Phase 0** — Vite + React + TypeScript + Tailwind CSS v4 scaffolding
- ✅ **Phase 1** — static food list + live search + quick-add cards
- ✅ **Phase 2** — `localStorage`-backed log persistence, quantity stepper wired to `addEntry`
- ✅ **Phase 3** — sticky `Header` with running calorie/macro totals, `DailyLog` listing today's entries newest-first with a confirm-before-delete action
- ✅ **Phase 4** — visual design refresh (see Design System above), a mobile/responsive pass, and multi-day history (`DateNav` + `useFoodLog(date)`)
- ✅ **Phase 5** — backend scaffolding: `backend/` (FastAPI + uv), `GET /api/health`, fail-fast `Settings`, Vite proxy for `/api`. No AI calls, no database yet. Runs on **port 8001**, not 8000 — see the port note above.
- ✅ **Phase 6** — daily log database (SQLite via SQLModel) — **retired `localStorage`**; `useFoodLog`/`storage.ts` are now an async API client with loading/error state; the app requires the backend running at all times from this phase on. 22 backend tests (up from 5), 72 frontend tests (up from 66).
- ✅ **Phase 7** — photo analysis endpoint (Anthropic vision integration): `POST /api/analyze-food-image`, backend-only (no frontend caller yet — that's Phase 8).
- ⬜ **Phase 8** — photo upload frontend (upload UI + review/add-to-log flow)
- ⬜ **Phase 9** — emoji icons for the 24 existing catalog foods
- ⬜ **Phase 10** — polish/guardrails (optional — rate limiting, image downscaling, retry UX)

See **Photo Upload Feature (Technical Design)** above and `docs/PLAN.md` for the full Phase 5-10 breakdown and the decisions confirmed with the user before planning them (one item per photo, no photo persistence, emoji instead of real photos, SQLite replaces `localStorage` with no data migration).

Notable Phase 6-7 decisions (not fully specified in the original plan, decided during implementation):
- The backend's JSON uses idiomatic Python `snake_case` field names (`food_id`, `logged_at`, `serving_size`, ...) rather than being aliased to emit camelCase — `src/lib/storage.ts` is the single place that translates to/from the frontend's camelCase `LogEntry`, so the boundary is explicit and both sides stay idiomatic to their own language.
- `main.py` uses FastAPI's `lifespan` context manager (not the deprecated `@app.on_event("startup")`) to call `create_db_and_tables()`.
- Backend tests never touch the real `backend/data/calorie_tracker.db` — `get_session` is overridden per-test to a fresh in-memory SQLite DB (`sqlite://` + `StaticPool`), and the vision/analyze tests monkeypatch the Anthropic client so no real network calls or API key are needed to run `uv run pytest`.
- `DailyLog` shows a "Loading…" message or the hook's error text in place of the entry list, rather than a spinner overlay or silently showing stale/empty data.

Notable Phase 3 decisions (confirmed with the user before building):
- Log entries display **newest-added first**. `LogEntryList` reverses the array before a stable sort by `loggedAt` so that two entries added in the same millisecond still resolve to newest-first (a real tie-breaking bug caught by the test suite while building this — see `LogEntryList.test.tsx`).
- Deleting a logged entry requires an inline **confirm/cancel** step (`LogEntryRow`'s own local state) rather than deleting immediately or using `window.confirm` (which the app avoids as a legacy/blocking pattern).
- `Header` is `position: sticky` and renders `DailyTotals`; there's no separate/duplicate totals display elsewhere on the page.

Notable Phase 4 decisions (confirmed with the user before building):
- Scope was narrowed from the plan's full "polish + stretch goals" list down to: a visual design refresh, a responsive/mobile pass, and just the **multi-day history** stretch goal (not custom foods or in-place quantity editing, which remain deferred).
- Viewing a previous day via `DateNav` is **not read-only** — the "Add Food" section still adds to whichever date is currently selected (`useFoodLog(selectedDate)`), so a forgotten meal from yesterday can be logged retroactively. The subtext under "Add Food" reflects this ("...log it for today" vs. "...for this day").
- Navigating into the future is prevented: `DateNav`'s next-day button is disabled while `selectedDate` is today.
- `useFoodLog` takes the target `date` as an argument rather than always reading `todayDateString()` internally; `App.tsx` holds a single `selectedDate` state and re-renders the same hook instance with a new date on navigation (entries re-filter; nothing is lost or remounted).

## Coding Guidelines

### Testing

Always write unit, component, and integration tests for new code — a feature or phase isn't done until it's tested, not just manually clicked through.

- **Unit tests** — pure logic in `lib/`, `utils/`, and hooks in isolation (e.g. `storage.ts`'s read/write, `date.ts`'s `todayDateString`, `useFoodLog`'s `addEntry`/`removeEntry` behavior).
- **Component tests** — individual React components rendered and interacted with via Testing Library (e.g. `SearchBar` calls `onChange` as the user types, `FoodCard`'s quantity stepper and Add button behave correctly, `FoodGrid` shows the empty state when nothing matches).
- **Integration tests** — multiple units/components working together end-to-end within the app (e.g. typing a search query filters the visible cards, then clicking Add on a filtered card sends the correct entry to the backend and it's still there after a simulated remount — see `App.test.tsx`'s in-memory stubbed-`fetch` backend).

Stack: **Vitest** + **React Testing Library** + `jsdom`, configured in `vite.config.ts`'s `test` block (`defineConfig` is imported from `vitest/config`, not `vite`, so the merged config type-checks — see gotchas below). Playwright is a reasonable addition later if true browser e2e coverage is wanted, but Vitest + RTL cover unit/component/integration needs for an app this size.

Conventions:
- Test files live next to the code they cover, as `*.test.ts` / `*.test.tsx`.
- Run the suite with `npm test` (once) or `npm run test:watch` (watch mode).
- New PRs should include tests for the code they add; retrofitting tests for already-merged code is also expected, not optional.
- `vitest.config` global mode is **off** (no `globals: true`) — import `describe`/`it`/`expect`/`vi` explicitly from `'vitest'` in each test file. `src/test/setup.ts` registers `afterEach(cleanup)` manually for this reason (React Testing Library's auto-cleanup normally relies on `globals: true`; without it, tests in the same file will see leftover DOM from previous tests unless this is wired up).

Gotchas hit while setting this up (worth knowing before touching `vite.config.ts` or writing time-sensitive tests):
- **Don't use the `/// <reference types="vitest/config" />` + `defineConfig` from `'vite'` pattern** to merge the `test` block into `vite.config.ts` — it fails to type-check under this project's `tsconfig.node.json` (`module: "nodenext"`). Import `defineConfig` from `'vitest/config'` instead.
- **Pin/verify the `vitest` version against the installed `vite` version.** A plain `npm install -D vitest` resolved to vitest 3.2.7, which bundles its own nested `vite@7.3.6` and produces incompatible `Plugin` types against this project's `vite@8.x`, breaking the build. Installing `vitest@latest` (5.x, which declares `vite: "^6.4.0 || ^7.0.0 || ^8.0.0"`) fixed it.
- **Fake timers + `userEvent` can hang/time out.** `vi.useFakeTimers()` (full fake timers) combined with `@testing-library/user-event` caused real test timeouts in `App.test.tsx`. Scope fake timers to just `Date` instead: `vi.useFakeTimers({ toFake: ['Date'] })` plus `vi.setSystemTime(...)`, leaving `setTimeout`/`setInterval` real so `userEvent` behaves normally.
