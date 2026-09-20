# Calorie Tracker — Implementation Plan

## Overview

A simple, no-login, single-page calorie tracker. Users search or quick-pick from a built-in list of 20+ common foods, add them to a daily log, and see a running calorie/macro total. Everything persists locally across page refreshes — no backend, no accounts.

## Tech Stack

- **React** + **TypeScript**
- **Vite** (build tooling / dev server)
- **Tailwind CSS** (styling)
- **localStorage** (persistence — no backend, no external database)

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

`localStorage` key: `calorie-tracker:log` → `LogEntry[]`. All dates are kept in storage, but the MVP UI only ever reads/writes today's date — this keeps the door open for a future "view past days" feature without a storage migration.

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
│   │   ├── Header/
│   │   ├── FoodSearch/
│   │   └── DailyLog/
│   ├── data/
│   │   └── foods.ts        # static list of 20+ common foods
│   ├── hooks/
│   │   └── useFoodLog.ts   # log state + localStorage sync
│   ├── lib/
│   │   └── storage.ts      # localStorage read/write helpers
│   ├── types/
│   │   └── index.ts        # Food, LogEntry
│   └── utils/
│       └── date.ts         # today's date helpers
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── .env
├── .gitignore
├── CLAUDE.md
└── README.md
```

## Phases

Each phase should be implemented and verified (in a browser) before moving to the next.

### Phase 0 — Project Scaffolding

- Scaffold with Vite's `react-ts` template.
- Install and configure Tailwind CSS.
- Set up the `src/` folder structure above with empty placeholder files.

**Assumptions:**
- npm as the package manager.
- Tailwind CSS v4 (latest stable at install time).
- No test framework or linter configured unless requested later.

### Phase 1 — Static Food Database + Search UI

- Define the `Food` type in `types/index.ts`.
- Populate `data/foods.ts` with 20+ common foods (chicken breast, rice, eggs, banana, oats, broccoli, salmon, etc.), each with calories/protein/carbs/fat/servingSize.
- Build `SearchBar` (filters by substring match on name) and `FoodGrid`/`FoodCard` (shows all foods by default, filters live as the user types).
- Purely presentational in this phase — no "Add" wiring yet, no persistence.

**Assumptions:**
- Nutrition values are approximate, typical per-serving figures — not pulled from a live nutrition API.
- Search is a simple case-insensitive substring match, not fuzzy/typo-tolerant.

### Phase 2 — Food Log Data Model + localStorage Persistence

- Define the `LogEntry` type.
- Build `lib/storage.ts` with `getEntries()` / `saveEntries()` (JSON read/write to `localStorage`).
- Build `hooks/useFoodLog.ts` exposing today's entries plus `addEntry(food, quantity)` / `removeEntry(id)`, backed by `storage.ts`.
- Wire each `FoodCard`'s "Add" action to `addEntry`, defaulting `quantity = 1`.

**Assumptions:**
- "Today" is derived from the browser's local date (`date.ts` helper).
- No multi-device sync — data lives in one browser's `localStorage`.
- Entries persist indefinitely across all dates in storage even though only today's are shown.

### Phase 3 — Daily Log Display + Calorie/Macro Totals

- Build `DailyLog` / `LogEntryList` / `LogEntryRow` to render today's entries with a delete action per row.
- Build `Header` / `DailyTotals` to compute and display the running total (calories, protein, carbs, fat) from today's entries, updating reactively on add/delete.

**Assumptions:**
- No calorie goal/target — just a running total, since none was requested.
- Totals recompute client-side on every state change; no memoization needed at this scale.

### Phase 4 — Polish & Stretch (optional, discuss before building)

- Quantity editor refinement (numeric input/stepper) if not already solid from Phase 2.
- Empty states (no foods match search; log empty for today) and a responsive layout pass.
- Possible future extensions **not otherwise in scope**: viewing/navigating previous days' logs, adding custom (non-list) foods, editing an already-logged entry's quantity, setting a daily calorie goal.

**Assumptions:**
- This phase is intentionally deferred/optional — only pursued if the user wants to extend past the MVP described in Phases 1–3.
