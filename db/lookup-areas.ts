import { parse } from "jsr:@std/csv";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") ?? "";

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_PLACES_API_KEY environment variable not set");
  Deno.exit(1);
}

// Google's neighborhood names that don't match areas.csv directly
const synonyms: Record<string, string> = {
  "river north": "RiNo",
  "river north art district": "RiNo",
  "rino": "RiNo",
  "lower downtown": "LoDo",
  "lodo": "LoDo",
  "lower highland": "LoHi",
  "lohi": "LoHi",
  "sloans lake": "Sloan's Lake",
  "sloan lake": "Sloan's Lake",
  "wash park": "Washington Park",
  "elyria swansea": "Elyria-Swansea",
  "stapleton": "Central Park",
};

const areasText = await Deno.readTextFile("db/areas.csv");
const areasRows = parse(areasText, { skipFirstRow: true, columns: ["id", "name"] }) as Array<{ id: string; name: string }>;
const areaMap = new Map<string, string>(areasRows.map((r) => [r.name.toLowerCase(), r.name]));

function matchArea(candidate: string): string | null {
  const lower = candidate.toLowerCase();
  if (areaMap.has(lower)) return areaMap.get(lower)!;
  if (synonyms[lower] && areaMap.has(synonyms[lower].toLowerCase())) return synonyms[lower];
  for (const suffix of [" art district", " historic district", " neighborhood"]) {
    if (lower.endsWith(suffix)) {
      const trimmed = lower.slice(0, -suffix.length);
      if (areaMap.has(trimmed)) return areaMap.get(trimmed)!;
      if (synonyms[trimmed]) return synonyms[trimmed];
    }
  }
  return null;
}

const placesText = await Deno.readTextFile("db/places.csv");
const places = parse(placesText, {
  skipFirstRow: true,
  columns: ["id", "name", "description", "category", "cuisine", "address", "area", "closed", "rating"],
}) as Array<Record<string, string>>;

const withAddress = places.filter((p) => p.address.trim() !== "");
console.log(`Found ${withAddress.length} places with addresses.`);

type Result = { id: number; area: string; name: string; status: "found" | "not_found" };
const results: Result[] = [];

for (const place of withAddress) {
  const id = Number(place.id);
  const address = place.address.trim();

  const cityMatch = address.match(/,\s*([^,]+),\s*CO\s+\d{5}/);
  const city = cityMatch?.[1]?.trim() ?? "";

  if (city && city.toLowerCase() !== "denver") {
    const area = matchArea(city);
    if (area) {
      console.log(`  id=${id} "${place.name}" → ${area} (city match)`);
      results.push({ id, area, name: place.name, status: "found" });
      continue;
    }
  }

  await new Promise((r) => setTimeout(r, 50));

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (data.status !== "OK" || !data.results?.length) {
    console.log(`  id=${id} "${place.name}" → not found (API: ${data.status})`);
    results.push({ id, area: "", name: place.name, status: "not_found" });
    continue;
  }

  const components: Array<{ long_name: string; short_name: string; types: string[] }> =
    data.results[0].address_components;

  // Exclude purely geographic/administrative types that would never be area names
  const excludedTypes = new Set([
    "country", "administrative_area_level_1", "administrative_area_level_2",
    "postal_code", "postal_code_suffix", "street_number", "route",
    "premise", "subpremise",
  ]);

  let found: string | null = null;

  // Pass 1: scan every component regardless of type (catches point_of_interest etc.)
  for (const comp of components) {
    if (comp.types.every((t) => excludedTypes.has(t))) continue;
    found = matchArea(comp.long_name) ?? matchArea(comp.short_name);
    if (found) break;
  }

  // Pass 2: type-priority fallback (locality catches non-Denver cities missed earlier)
  if (!found) {
    for (const type of ["neighborhood", "sublocality_level_1", "sublocality", "locality"]) {
      const comp = components.find((c) => c.types.includes(type));
      if (comp) {
        found = matchArea(comp.long_name) ?? matchArea(comp.short_name);
        if (found) break;
      }
    }
  }

  if (found) {
    console.log(`  id=${id} "${place.name}" → ${found}`);
    results.push({ id, area: found, name: place.name, status: "found" });
  } else {
    const candidates = components
      .filter((c) => c.types.every((t) => !excludedTypes.has(t)))
      .map((c) => `${c.long_name} [${c.types.join(",")}]`);
    console.log(`  id=${id} "${place.name}" → not found (candidates: ${candidates.join(", ") || "none"})`);
    results.push({ id, area: "", name: place.name, status: "not_found" });
  }
}

await Deno.writeTextFile("db/areas-lookup.json", JSON.stringify({ results }, null, 2));

const foundCount = results.filter((r) => r.status === "found").length;
const notFound = results.filter((r) => r.status === "not_found");
console.log(`\nResults: ${foundCount} found, ${notFound.length} not found.`);

if (notFound.length) {
  console.log("\nNot found (review manually in db/areas-lookup.json or db/places.csv):");
  for (const r of notFound) {
    const place = withAddress.find((p) => Number(p.id) === r.id);
    console.log(`  id=${r.id} "${r.name}" | address: ${place?.address}`);
  }
}

console.log('\nRun "bash db/merge-areas.sh" to apply to places.csv.');
