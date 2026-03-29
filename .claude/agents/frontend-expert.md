---
name: Front-End Expert
description: Expert on React, Vite, DuckDB WASM, and React Testing Library for the true-denver-reviews project.
---

# Front-End Expert Agent

Expert on React, Vite, DuckDB WASM, and React Testing Library for the true-denver-reviews project.

See CLAUDE.md for project overview, commands, architecture, styling, and conventions.

## Architecture

This is a **read-only SPA** — all data lives in a pre-built DuckDB binary (`public/data.db`). No backend, no write path, no Redux.

### Data Flow

```
Browser
  └─ DuckDB WASM worker (loaded from jsDelivr CDN at runtime)
       └─ public/data.db  (read-only)
            └─ places JOIN categories / cuisines / areas
```

### Key Source Files

- `src/db/client.ts` — singleton `initPromise` ensures DuckDB WASM initializes once; opens `data.db` read-only
- `src/db/queries.ts` — four query functions returning plain objects; DuckDB INTEGER columns are cast with `Number()`
- `src/hooks/useDb.ts` — thin hook wrapping `getConnection()`, exposes `{ conn, loading, error }`
- `src/hooks/usePlaces.ts` — fetches all data once on `conn` ready (single JOIN + three lookup queries); filtering/sorting via `useMemo`
- `src/utils/filterPlaces.ts` — pure `filterAndSortPlaces(places, filters)` function; sole filtering path

### Database Schema

```
categories (id, name)
cuisines   (id, name)
areas      (id, name)
places     (id, name, description, category_id, cuisine_id, address, area_id, closed, rating 1–5)
```

All components work with flat `Place` objects (string names, not IDs) — denormalized via JOIN in `queries.ts`.

## Key Constraints

- **COOP/COEP headers required** for DuckDB WASM (`SharedArrayBuffer`). Set in `vite.config.ts` for `server` and `preview`.
- `@duckdb/duckdb-wasm` excluded from `optimizeDeps` (esbuild can't handle WASM).
- DuckDB WASM bundles load from jsDelivr CDN via `getJsDelivrBundles()`.

## Testing

- Tests use jsdom + React Testing Library
- DuckDB layer is **never loaded** in tests — use plain mock objects as props
- `src/test/setup.ts` imports `@testing-library/jest-dom` for DOM matchers

## Common Tasks

### Adding a New Filter

1. Update filter types and `filterAndSortPlaces` in `src/utils/filterPlaces.ts`
2. Add corresponding UI in the filter component
3. Update `usePlaces.ts` if new lookup data is needed
4. Add unit tests for the filter logic

### Adding a New Query

1. Add query function to `src/db/queries.ts` (cast `BigInt` with `Number()`)
2. Call from `usePlaces.ts` when `conn` is ready
3. Pass results down as props to components
