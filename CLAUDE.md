# Calorie Tracker

## What This Is

A simple, single-page calorie tracker web app. No login, no accounts. Users search or quick-pick from a built-in list of 20+ common foods (chicken, rice, eggs, banana, etc.), add them to a daily log, and see a running calorie and macro (protein/carbs/fat) total. The log persists locally across page refreshes via `localStorage` — there is no backend or external database.

See [docs/PLAN.md](docs/PLAN.md) for the full architecture and phased build plan.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tooling and dev server
- **Tailwind CSS v4** — styling, wired in via the `@tailwindcss/vite` plugin (no `tailwind.config.ts`/PostCSS config needed in v4)
- **localStorage** — client-side persistence (no backend)
- **oxlint** — linting (bundled by the Vite scaffold)
- **Vitest** + **React Testing Library** + `jsdom` — unit/component/integration testing

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

## Folder Structure

```
calorie_tracker/
├── docs/
│   └── PLAN.md              # architecture + phased implementation plan
├── src/
│   ├── main.tsx
│   ├── App.tsx                       # renders FoodSearchPanel, wires up useFoodLog
│   ├── index.css                     # Tailwind entry (`@import "tailwindcss"`)
│   ├── components/
│   │   ├── FoodSearch/
│   │   │   ├── FoodSearchPanel.tsx   # owns search query state + filtering
│   │   │   ├── SearchBar.tsx         # controlled text input
│   │   │   ├── FoodGrid.tsx          # renders FoodCard list / empty state
│   │   │   └── FoodCard.tsx          # macros + quantity stepper + Add button
│   │   ├── Header/
│   │   │   ├── Header.tsx            # sticky top bar; renders DailyTotals
│   │   │   └── DailyTotals.tsx       # calories + protein/carbs/fat, pure/presentational
│   │   └── DailyLog/
│   │       ├── DailyLog.tsx          # section heading + LogEntryList
│   │       ├── LogEntryList.tsx      # sorts entries newest-first, renders empty state
│   │       └── LogEntryRow.tsx       # one entry; delete needs an inline confirm/cancel
│   ├── data/
│   │   └── foods.ts                  # static list of 24 common foods
│   ├── hooks/
│   │   └── useFoodLog.ts             # today's entries + addEntry/removeEntry, backed by storage.ts
│   ├── lib/
│   │   └── storage.ts                # localStorage getEntries/saveEntries
│   ├── types/
│   │   └── index.ts                  # Food, LogEntry types
│   ├── utils/
│   │   ├── date.ts                   # todayDateString() (local date, not UTC)
│   │   ├── totals.ts                 # calculateTotals(entries) -> {calories, protein, carbs, fat}
│   │   └── format.ts                 # round1() for display-rounding macros
│   ├── test/
│   │   └── setup.ts                  # jest-dom matchers + RTL auto-cleanup, loaded by vitest
│   ├── App.test.tsx                  # integration: search -> add -> log display -> totals -> confirm-delete
│   ├── lib/storage.test.ts           # unit
│   ├── utils/{date,totals,format}.test.ts  # unit
│   ├── hooks/useFoodLog.test.ts      # unit
│   ├── components/FoodSearch/*.test.tsx    # component + FoodSearchPanel integration tests
│   ├── components/Header/*.test.tsx        # component
│   └── components/DailyLog/*.test.tsx      # component (LogEntryRow's confirm flow, LogEntryList's sort/tie-break)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                    # registers @vitejs/plugin-react + @tailwindcss/vite; `test` block configures Vitest (defineConfig imported from `vitest/config`, not `vite`)
├── .oxlintrc.json
├── .env
├── .gitignore
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
}

interface LogEntry {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;     // multiplier of servings
  calories: number;      // snapshot: food.calories * quantity
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string;           // "YYYY-MM-DD"
  loggedAt: string;       // ISO timestamp
}
```

Stored under the `calorie-tracker:log` key in `localStorage` as a `LogEntry[]` (all dates are kept; the app currently only reads/writes today's).

## Build Status

Phases 0–3 are implemented (see `docs/PLAN.md` for full phase definitions):

- ✅ **Phase 0** — Vite + React + TypeScript + Tailwind CSS v4 scaffolding
- ✅ **Phase 1** — static food list + live search + quick-add cards
- ✅ **Phase 2** — `localStorage`-backed log persistence, quantity stepper wired to `addEntry`
- ✅ **Phase 3** — sticky `Header` with running calorie/macro totals, `DailyLog` listing today's entries newest-first with a confirm-before-delete action
- ⬜ **Phase 4** — optional polish / stretch goals (see `docs/PLAN.md`)

Notable Phase 3 decisions (confirmed with the user before building):
- Log entries display **newest-added first**. `LogEntryList` reverses the array before a stable sort by `loggedAt` so that two entries added in the same millisecond still resolve to newest-first (a real tie-breaking bug caught by the test suite while building this — see `LogEntryList.test.tsx`).
- Deleting a logged entry requires an inline **confirm/cancel** step (`LogEntryRow`'s own local state) rather than deleting immediately or using `window.confirm` (which the app avoids as a legacy/blocking pattern).
- `Header` is `position: sticky` and renders `DailyTotals`; there's no separate/duplicate totals display elsewhere on the page.

## Coding Guidelines

### Testing

Always write unit, component, and integration tests for new code — a feature or phase isn't done until it's tested, not just manually clicked through.

- **Unit tests** — pure logic in `lib/`, `utils/`, and hooks in isolation (e.g. `storage.ts`'s read/write, `date.ts`'s `todayDateString`, `useFoodLog`'s `addEntry`/`removeEntry` behavior).
- **Component tests** — individual React components rendered and interacted with via Testing Library (e.g. `SearchBar` calls `onChange` as the user types, `FoodCard`'s quantity stepper and Add button behave correctly, `FoodGrid` shows the empty state when nothing matches).
- **Integration tests** — multiple units/components working together end-to-end within the app (e.g. typing a search query filters the visible cards, then clicking Add on a filtered card writes the correct entry to `localStorage` and it survives a simulated reload).

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
