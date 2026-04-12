// One-time script to populate bounding-box columns in db/areas.csv.
// Only fetches bounds for rows where neighborhood=TRUE; surrounding
// cities are matched by city-name parsing in lookup-areas.ts and don't need bounds.
// Safe to re-run — skips rows that already have bounds.
//
// Usage:
//   deno run --allow-net --allow-read --allow-env --allow-write db/fetch-area-bounds.ts

import { parse } from 'jsr:@std/csv';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY') ?? '';

if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY environment variable not set');
  Deno.exit(1);
}

const areasText = await Deno.readTextFile('db/areas.csv');
// parse() without skipFirstRow returns string[][] including the header row
const allRows = parse(areasText) as string[][];
const dataRows = allRows.slice(1);

type AreaRow = {
  name: string;
  bounds_sw_lat: string;
  bounds_sw_lng: string;
  bounds_ne_lat: string;
  bounds_ne_lng: string;
  neighborhood: string;
};

const rows: AreaRow[] = dataRows.map((r) => ({
  name: r[0],
  bounds_sw_lat: r[1] ?? '',
  bounds_sw_lng: r[2] ?? '',
  bounds_ne_lat: r[3] ?? '',
  bounds_ne_lng: r[4] ?? '',
  neighborhood: r[5] ?? '',
}));

const toFetch = rows.filter(
  (r) => r.neighborhood === 'TRUE' && !r.bounds_sw_lat,
);
console.log(`Fetching bounds for ${toFetch.length} Denver neighborhoods...`);

for (const row of toFetch) {
  await new Promise((r) => setTimeout(r, 50));

  const query = `${row.name}, Denver, CO`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (data.status !== 'OK' || !data.results?.length) {
    console.log(`  "${row.name}" → no result (${data.status})`);
    continue;
  }

  const geometry = data.results[0].geometry;
  const bounds = geometry.bounds ?? geometry.viewport;

  if (!bounds) {
    console.log(`  "${row.name}" → no bounds in response`);
    continue;
  }

  row.bounds_sw_lat = String(bounds.southwest.lat);
  row.bounds_sw_lng = String(bounds.southwest.lng);
  row.bounds_ne_lat = String(bounds.northeast.lat);
  row.bounds_ne_lng = String(bounds.northeast.lng);
  console.log(
    `  "${row.name}" → SW(${row.bounds_sw_lat},${row.bounds_sw_lng}) NE(${row.bounds_ne_lat},${row.bounds_ne_lng})`,
  );
}

const csvField = (s: string) =>
  /[,'"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;

const header =
  'name,bounds_sw_lat,bounds_sw_lng,bounds_ne_lat,bounds_ne_lng,neighborhood';
const csv =
  [
    header,
    ...rows.map(
      (r) =>
        `${csvField(r.name)},${r.bounds_sw_lat},${r.bounds_sw_lng},${r.bounds_ne_lat},${r.bounds_ne_lng},${r.neighborhood}`,
    ),
  ].join('\n') + '\n';

await Deno.writeTextFile('db/areas.csv', csv);
console.log('\nUpdated db/areas.csv with bounding box data.');
console.log('Review the output above for any areas with missing bounds.');
