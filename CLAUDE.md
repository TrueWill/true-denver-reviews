# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (localhost:5173)
npm run build      # tsc type-check + Vite production build
npm run preview    # serve production build locally
npm test           # run tests in watch mode
npm test -- --run  # run tests once (CI mode)
npm run lint       # ESLint
npm run format     # Prettier (run after saving files)
```

Run a single test file:

```bash
npm test -- --run src/utils/__tests__/rating.test.ts
```

Edit reviews by opening `db/places.csv` in any spreadsheet app (Excel, Numbers,
Google Sheets). Use text names for category/cuisine/area — see the other CSVs for
valid values. Then regenerate the site data:

```bash
npm run seed
```

Lookup tables (`db/categories.csv`, `db/cuisines.csv`, `db/areas.csv`) rarely need
editing but follow the same pattern. The build script is `db/build.sql`.

## Git

Run `npm run format` on any changed source files before committing.

## Architecture

This is a **read-only SPA** — all data lives in a generated static file (`public/places.json`) committed to the repo. There is no backend and no write path.

### Data flow

```
npm run seed (build time)
  └─ DuckDB CLI runs db/build.sql
       └─ validates db/*.csv, writes public/places.json

Browser
  └─ fetch places.json
       └─ filter and sort in JS
```

1. `db/build.sql` — validates `db/places.csv` against the lookup CSVs, failing with every bad row listed, then writes `public/places.json`. A failed seed leaves the existing file untouched.
2. `src/data/fetchPlaces.ts` — fetches `places.json` under `BASE_URL` and rejects on an HTTP error, malformed JSON, or a non-array body.
3. `src/hooks/usePlaces.ts` — fetches once on mount. Filtering and sorting happen entirely in JS via `useMemo`.
4. `src/utils/valuesInUse.ts` — derives the category, cuisine, and area filter options from the loaded places, so only values in use appear.
5. `src/utils/filterPlaces.ts` — pure `filterAndSortPlaces(places, filters)` function; this is the sole filtering path.

### Key constraints

- DuckDB is a build-time tool only. It is not a project dependency and never runs in the browser; `npm run seed` needs the `duckdb` CLI installed.
- `public/places.json` **is committed** — it's a static asset deployed with the site. Don't edit it by hand; change the CSVs and run `npm run seed`.
- `public/places.json` is listed in `.prettierignore` so that `npm run format` keeps DuckDB's one-row-per-line layout and diffs stay readable.

### Data shape

Each row in `places.json` matches the `Place` type in `src/types/index.ts`: `id`, `name`, `description`, `category`, `cuisine`, `address`, `area`, `closed`, `rating`. `cuisine`, `address`, `area`, and `rating` (1–5) may be `null`. `closed` is always a boolean and `description` is always a string. Rows are ordered by `id`.

### Testing

Tests use jsdom + React Testing Library. Components are tested with plain mock objects passed as props, and hooks mock `fetchPlaces`. The `src/test/setup.ts` file imports `@testing-library/jest-dom` for DOM matchers.
