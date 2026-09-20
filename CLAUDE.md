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

## How to Run

```bash
npm install
npm run dev       # start local dev server (http://localhost:5173)
npm run build     # type-check (tsc -b) + production build
npm run lint      # oxlint
npm run preview   # preview the production build locally
```

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
│   │   └── FoodSearch/
│   │       ├── FoodSearchPanel.tsx   # owns search query state + filtering
│   │       ├── SearchBar.tsx         # controlled text input
│   │       ├── FoodGrid.tsx          # renders FoodCard list / empty state
│   │       └── FoodCard.tsx          # macros + quantity stepper + Add button
│   │   # Header/ and DailyLog/ land in Phase 3 (not built yet)
│   ├── data/
│   │   └── foods.ts                  # static list of 24 common foods
│   ├── hooks/
│   │   └── useFoodLog.ts             # today's entries + addEntry/removeEntry, backed by storage.ts
│   ├── lib/
│   │   └── storage.ts                # localStorage getEntries/saveEntries
│   ├── types/
│   │   └── index.ts                  # Food, LogEntry types
│   └── utils/
│       └── date.ts                   # todayDateString() (local date, not UTC)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                    # registers @vitejs/plugin-react + @tailwindcss/vite
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

Phases 0–2 are implemented (see `docs/PLAN.md` for full phase definitions):

- ✅ **Phase 0** — Vite + React + TypeScript + Tailwind CSS v4 scaffolding
- ✅ **Phase 1** — static food list + live search + quick-add cards
- ✅ **Phase 2** — `localStorage`-backed log persistence, quantity stepper wired to `addEntry`
- ⬜ **Phase 3** — daily log display + running calorie/macro totals (not built — entries persist but aren't rendered back in the UI yet)
- ⬜ **Phase 4** — optional polish / stretch goals

Known gap: since Phase 3 hasn't landed, clicking "Add" saves the entry to `localStorage` but there's currently no visible confirmation or log view in the UI — verify via browser devtools (`localStorage.getItem('calorie-tracker:log')`) until Phase 3 ships.

## Coding Guidelines

### Testing

Always write unit, component, and integration tests for new code — a feature or phase isn't done until it's tested, not just manually clicked through.

- **Unit tests** — pure logic in `lib/`, `utils/`, and hooks in isolation (e.g. `storage.ts`'s read/write, `date.ts`'s `todayDateString`, `useFoodLog`'s `addEntry`/`removeEntry` behavior).
- **Component tests** — individual React components rendered and interacted with via Testing Library (e.g. `SearchBar` calls `onChange` as the user types, `FoodCard`'s quantity stepper and Add button behave correctly, `FoodGrid` shows the empty state when nothing matches).
- **Integration tests** — multiple units/components working together end-to-end within the app (e.g. typing a search query filters the visible cards, then clicking Add on a filtered card writes the correct entry to `localStorage` and it survives a simulated reload).

Recommended stack (not yet installed as of Phase 0–2): **Vitest** + **React Testing Library** + `jsdom`, since it integrates natively with the existing Vite config with minimal setup. Playwright is a reasonable addition later if true browser e2e coverage is wanted, but Vitest + RTL should cover unit/component/integration needs for an app this size.

Conventions once the framework is added:
- Test files live next to the code they cover, as `*.test.ts` / `*.test.tsx`.
- Run the suite with `npm test`.
- New PRs should include tests for the code they add; retrofitting tests for already-merged code is also expected, not optional.
