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
valid values. Then regenerate the database:

```bash
npm run seed
```

Lookup tables (`db/categories.csv`, `db/cuisines.csv`, `db/areas.csv`) rarely need
editing but follow the same pattern. The build script is `db/build.sql`.

## Architecture

This is a **read-only SPA** — all data lives in a pre-built DuckDB binary (`public/data.db`) committed to the repo. There is no backend and no write path.

### Data flow

```
Browser
  └─ DuckDB WASM worker (loaded from jsDelivr CDN at runtime)
       └─ public/data.db  (read-only)
            └─ places JOIN categories / cuisines / areas
```

1. `src/db/client.ts` — module-level `initPromise` singleton ensures DuckDB WASM initializes once even under React StrictMode's double-mount. Opens `data.db` in read-only mode.
2. `src/db/queries.ts` — four query functions that return plain objects. Arrow results from DuckDB return INTEGER columns as `BigInt`; these are cast with `Number()` here.
3. `src/hooks/useDb.ts` — thin hook wrapping `getConnection()`, exposes `{ conn, loading, error }`.
4. `src/hooks/usePlaces.ts` — fetches all data once when `conn` is ready (a single JOIN query + three lookup queries). Filtering and sorting happen entirely in JS via `useMemo` — no repeated DB queries.
5. `src/utils/filterPlaces.ts` — pure `filterAndSortPlaces(places, filters)` function; this is the sole filtering path.

### Key constraints

- **COOP/COEP headers are required** for DuckDB WASM (uses `SharedArrayBuffer`). They are set in `vite.config.ts` for both `server` and `preview`. Any deployment target must also set these headers.
- `@duckdb/duckdb-wasm` is excluded from `optimizeDeps` — Vite's esbuild pre-bundler cannot handle WASM.
- DuckDB WASM bundles load from jsDelivr CDN via `getJsDelivrBundles()` — no local WASM files are needed or deployed.
- `public/data.db` **is committed** — it's a static asset deployed with the site.

### Database schema

```
categories (id, name)
cuisines   (id, name)
areas      (id, name)
places     (id, name, description, category_id, cuisine_id, address, area_id, closed, rating 1–5)
```

`queries.ts` denormalizes via JOIN so all components work with flat `Place` objects (string names, not IDs).

### Testing

Tests use jsdom + React Testing Library. The DuckDB layer is never loaded in tests — components and hooks that need data are tested with plain mock objects passed as props. The `src/test/setup.ts` file imports `@testing-library/jest-dom` for DOM matchers.
