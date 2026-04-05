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

Open `db/places.csv` in any spreadsheet app (Excel, Numbers, Google Sheets) to add or edit reviews. Use text names for category/cuisine/area — see `db/categories.csv`, `db/cuisines.csv`, and `db/areas.csv` for valid values.

After saving changes, regenerate the database:

```bash
npm run seed
```

Then commit both `db/places.csv` and `public/data.db`.

### Looking up addresses

A Deno script can populate missing `address` fields via the Google Places API. It skips closed places, events, food trucks, and rows that already have addresses.

```bash
GOOGLE_PLACES_API_KEY=your-key deno run --allow-net --allow-read --allow-write --allow-env db/lookup-addresses.ts
```

This writes results to `db/addresses.json`. Review the output, then merge into the CSV and rebuild:

```bash
bash db/merge-addresses.sh
npm run seed
```

Places with ambiguous results (multiple locations, name mismatches) are skipped automatically.

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
