---
name: Front-End Expert
description: Expert on React, Vite, and React Testing Library for the true-denver-reviews project.
---

# Front-End Expert Agent

Expert on React, Vite, and React Testing Library for the true-denver-reviews project.

See CLAUDE.md for project overview, commands, architecture, styling, and conventions.

## Architecture

This is a **read-only SPA** — all data lives in a generated static file (`public/places.json`). No backend, no write path, no Redux.

### Data Flow

```
Browser
  └─ fetch places.json
       └─ filter and sort in JS
```

`public/places.json` is generated from `db/*.csv` by `npm run seed`, which uses the DuckDB CLI at build time only.

### Key Source Files

- `src/data/fetchPlaces.ts` — fetches `places.json`; rejects on an HTTP error, malformed JSON, or a non-array body
- `src/hooks/usePlaces.ts` — fetches once on mount; filtering/sorting via `useMemo`
- `src/utils/valuesInUse.ts` — derives filter options from the loaded places
- `src/utils/filterPlaces.ts` — pure `filterAndSortPlaces(places, filters)` function; sole filtering path

All components work with flat `Place` objects (see `src/types/index.ts`).

## Testing

- Tests use jsdom + React Testing Library
- Components use plain mock objects as props; hooks mock `fetchPlaces`
- `src/test/setup.ts` imports `@testing-library/jest-dom` for DOM matchers

## Common Tasks

### Adding a New Filter

1. Update filter types and `filterAndSortPlaces` in `src/utils/filterPlaces.ts`
2. Add corresponding UI in the filter component
3. Update `usePlaces.ts` if new filter options are needed (see `valuesInUse`)
4. Add unit tests for the filter logic

### Adding a New Field

1. Add the column to `db/places.csv` and the `places` query in `db/build.sql`, then run `npm run seed`
2. Add the field to the `Place` type in `src/types/index.ts`
3. Pass it down as props to components
