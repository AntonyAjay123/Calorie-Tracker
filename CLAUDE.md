# Calorie Tracker

## What This Is

A simple, single-page calorie tracker web app. No login, no accounts. Users search or quick-pick from a built-in list of 20+ common foods (chicken, rice, eggs, banana, etc.), add them to a daily log, and see a running calorie and macro (protein/carbs/fat) total. The log persists locally across page refreshes via `localStorage` — there is no backend or external database.

See [docs/PLAN.md](docs/PLAN.md) for the full architecture and phased build plan.

## Tech Stack

- **React** + **TypeScript**
- **Vite** — build tooling and dev server
- **Tailwind CSS** — styling
- **localStorage** — client-side persistence (no backend)

## How to Run

> Not yet scaffolded — this section will be filled in once Phase 0 (project scaffolding) is complete.

Once scaffolded, the standard Vite workflow applies:

```bash
npm install
npm run dev      # start local dev server
npm run build    # production build
```

## Folder Structure

```
calorie_tracker/
├── docs/
│   └── PLAN.md              # architecture + phased implementation plan
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Header/           # sticky calorie/macro total bar
│   │   ├── FoodSearch/       # search bar + quick-add food grid
│   │   └── DailyLog/         # today's logged entries + totals
│   ├── data/
│   │   └── foods.ts          # static list of 20+ common foods
│   ├── hooks/
│   │   └── useFoodLog.ts     # log state + localStorage sync
│   ├── lib/
│   │   └── storage.ts        # localStorage read/write helpers
│   ├── types/
│   │   └── index.ts          # Food, LogEntry types
│   └── utils/
│       └── date.ts           # today's-date helpers
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── .env
├── .gitignore
└── CLAUDE.md
```

(Most of the above does not exist yet — it's the target structure once scaffolding lands.)

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

Stored under the `calorie-tracker:log` key in `localStorage` as a `LogEntry[]`.

## Build Status

Documentation and planning only — no application code has been written yet. Implementation proceeds phase by phase per `docs/PLAN.md` (Phase 0: scaffolding → Phase 1: food search UI → Phase 2: log persistence → Phase 3: totals display → Phase 4: optional polish).
