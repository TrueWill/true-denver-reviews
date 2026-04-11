# True Denver Reviews

Denver (and Colorado in general) favorites and ratings by [TrueWill](https://github.com/TrueWill) and [hellomandie](https://github.com/hellomandie).

Reviews of local restaurants and places of interest.

Hosted at https://truedenverreviews.com/

Originally built with [Claude Code](https://claude.com/product/claude-code).

## Rating system

- ❤️ - Favorite!
- 👍👍 - Excellent
- 👍 - Good
- 🤏 - Meh / Just OK
- 👎 - Bad

## Editing content

Open `db/places.csv` in any spreadsheet app (Excel, Numbers, Google Sheets) to add or edit reviews. Use text names for category/cuisine/area — see `db/categories.csv`, `db/cuisines.csv`, and `db/areas.csv` for valid values. REMEMBER to add IDs - otherwise you will see duplicates.

After saving changes, regenerate the database:

```bash
npm run seed
```

Then commit both `db/places.csv` and `public/data.db`.

### Looking up addresses

A Deno script can populate missing `address` fields via the Google Places API. It skips closed places, events, food trucks, and rows that already have addresses. Requires `GOOGLE_PLACES_API_KEY` in the environment.

```bash
deno run --allow-net --allow-read --allow-write --allow-env db/lookup-addresses.ts
```

This writes results to `db/addresses.json`. Review the output, then merge into the CSV and rebuild:

```bash
bash db/merge-addresses.sh
npm run seed
```

Places with ambiguous results (multiple locations, name mismatches) are skipped automatically.

### Looking up areas

Two Deno scripts populate the `area` column for places that have an address. Both require `GOOGLE_PLACES_API_KEY` in the environment.

**One-time setup** — fetches bounding-box coordinates for each Denver neighborhood and stores them in `db/areas.csv`. Safe to re-run; skips rows that already have bounds.

```bash
deno run --allow-net --allow-read --allow-write --allow-env db/fetch-area-bounds.ts
```

**Lookup** — geocodes each place address and matches it to an area using the bounding boxes. Non-Denver cities (Lakewood, Boulder, etc.) are matched directly from the address string without an API call.

```bash
deno run --allow-net --allow-read --allow-write --allow-env db/lookup-areas.ts
```

This writes results to `db/areas-lookup.json`. Review the output — any unmatched rows are listed at the end — then merge and rebuild:

```bash
bash db/merge-areas.sh
npm run seed
```

**Manual overrides** — if the API assigns a wrong area, edit `db/areas-lookup.json` directly before running `merge-areas.sh`: set `"status"` to `"found"` and correct the `"area"` value. Do not re-run `lookup-areas.ts` after making manual corrections, as it will overwrite them. Only re-run the lookup if place addresses have changed.

## Deployment

Hosted on [Cloudflare Pages](https://pages.cloudflare.com/). `wrangler` is included as a dev dependency, so no global install is needed — use `npx wrangler` for direct CLI commands.

**One-time setup:**

```bash
npx wrangler login
npx wrangler pages project create true-denver-reviews
```

**Deploy:**

```bash
npm run deploy
```

This builds the site and deploys to Cloudflare Pages in one step.
