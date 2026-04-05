import { parse } from "jsr:@std/csv@1";

interface Place {
  id: number;
  name: string;
  category: string;
  cuisine: string;
  address: string;
}

interface GooglePlace {
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

interface LookupResult {
  id: number;
  name: string;
  status: "found" | "skipped";
  address?: string;
  google_name?: string;
  distance_km?: number;
  reason?: string;
  query_used: string;
}

interface Validation {
  valid: boolean;
  address?: string;
  googleName?: string;
  distanceKm?: number;
  reason?: string;
}

const DENVER_LAT = 39.7392;
const DENVER_LNG = -104.9903;
const MAX_DISTANCE_KM = 120;
const API_DELAY_MS = 200;
const API_URL = "https://places.googleapis.com/v1/places:searchText";
const SKIP_CATEGORIES = new Set(["Event", "Food Truck"]);
const SHORT_NAME_THRESHOLD = 9;

const SUFFIX_RE =
  /\b(restaurant|bar|cafe|coffee|shop|house|brewery|bakery|market|grill|pizza|pub|tavern|lounge|kitchen|diner|club)\b/gi;

async function parseCsv(path: string): Promise<Place[]> {
  const text = await Deno.readTextFile(path);
  const rows = parse(text, { skipFirstRow: true }) as Record<string, string>[];
  return rows
    .filter((r) => r.closed !== "TRUE")
    .filter((r) => !SKIP_CATEGORIES.has(r.category))
    .filter((r) => !r.address?.trim())
    .map((r) => ({
      id: Number(r.id),
      name: r.name,
      category: r.category ?? "",
      cuisine: r.cuisine ?? "",
      address: r.address ?? "",
    }));
}

function buildQuery(place: Place): string {
  const name = place.name.replace(/\s*\([^)]*\)/g, "").trim();
  const words = name.split(/\s+/);
  const needsCategory =
    words.length < 2 || name.length < SHORT_NAME_THRESHOLD;
  const suffix =
    needsCategory && place.category
      ? ` ${place.category.toLowerCase()}`
      : "";
  return `${name}${suffix} Denver CO`;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function searchPlace(
  query: string,
  apiKey: string,
): Promise<GooglePlace[]> {
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: DENVER_LAT, longitude: DENVER_LNG },
        radius: 50000.0,
      },
    },
    maxResultCount: 3,
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location",
        },
        body: JSON.stringify(body),
      });
      if (resp.status === 403) {
        console.error("API key invalid or Places API not enabled");
        Deno.exit(1);
      }
      if (resp.status === 429) {
        await delay(1000 * 2 ** attempt);
        continue;
      }
      if (resp.status >= 500) {
        await delay(1000);
        continue;
      }
      if (!resp.ok) {
        console.error(`HTTP ${resp.status}: ${await resp.text()}`);
        return [];
      }
      const data = await resp.json();
      return data.places ?? [];
    } catch (e) {
      if (attempt < 2) {
        await delay(1000);
        continue;
      }
      console.error(`Network error: ${e}`);
      return [];
    }
  }
  return [];
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(SUFFIX_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

function namesMatch(csvName: string, googleName: string): boolean {
  const a = normalizeForMatch(csvName);
  const b = normalizeForMatch(googleName);
  if (a === b) return true;
  if (b.includes(a) || a.includes(b)) return true;
  const aTokens = a.split(" ").filter((t) => t.length > 1);
  const bTokens = new Set(b.split(" ").filter((t) => t.length > 1));
  const overlap = aTokens.filter((t) => bTokens.has(t)).length;
  return overlap >= 2 || (aTokens.length === 1 && overlap === 1);
}

function stripUsa(address: string): string {
  return address.replace(/,\s*USA\s*$/, "").trim();
}

function validateResult(place: Place, gPlace: GooglePlace): Validation {
  const addr = gPlace.formattedAddress ?? "";
  const gName = gPlace.displayName?.text ?? "";
  const loc = gPlace.location;
  if (!addr.includes(", CO ")) {
    return { valid: false, reason: "not_in_colorado", googleName: gName };
  }
  const distanceKm = loc
    ? haversineKm(DENVER_LAT, DENVER_LNG, loc.latitude, loc.longitude)
    : undefined;
  if (distanceKm !== undefined && distanceKm > MAX_DISTANCE_KM) {
    return { valid: false, reason: "too_far", googleName: gName, distanceKm };
  }
  if (!namesMatch(place.name, gName)) {
    return { valid: false, reason: "name_mismatch", googleName: gName, distanceKm };
  }
  return { valid: true, address: stripUsa(addr), googleName: gName, distanceKm };
}

async function processPlace(
  place: Place,
  apiKey: string,
): Promise<LookupResult> {
  const query = buildQuery(place);
  const results = await searchPlace(query, apiKey);
  if (results.length === 0) {
    return { id: place.id, name: place.name, status: "skipped", reason: "no_results", query_used: query };
  }
  const validated = results.map((r) => validateResult(place, r));
  const passing = validated.filter((v) => v.valid);
  if (passing.length >= 2 && passing[0].address !== passing[1].address) {
    return {
      id: place.id, name: place.name, status: "skipped",
      reason: "multiple_locations", google_name: passing[0].googleName,
      query_used: query,
    };
  }
  if (passing.length === 0) {
    const first = validated[0];
    return {
      id: place.id, name: place.name, status: "skipped",
      reason: first.reason, google_name: first.googleName,
      distance_km: roundOpt(first.distanceKm), query_used: query,
    };
  }
  const best = passing[0];
  return {
    id: place.id, name: place.name, status: "found",
    address: best.address, google_name: best.googleName,
    distance_km: roundOpt(best.distanceKm), query_used: query,
  };
}

function roundOpt(n: number | undefined): number | undefined {
  return n !== undefined ? Math.round(n * 10) / 10 : undefined;
}

async function main() {
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    console.error("Set GOOGLE_PLACES_API_KEY environment variable");
    Deno.exit(1);
  }
  const eligible = await parseCsv("db/places.csv");
  console.error(`Found ${eligible.length} eligible places to look up`);

  const results: LookupResult[] = [];
  for (let i = 0; i < eligible.length; i++) {
    const place = eligible[i];
    console.error(`[${i + 1}/${eligible.length}] ${place.name}...`);
    const result = await processPlace(place, apiKey);
    const detail = result.address ?? result.reason ?? "";
    console.error(`  → ${result.status}: ${detail}`);
    results.push(result);
    if (i < eligible.length - 1) await delay(API_DELAY_MS);
  }

  const found = results.filter((r) => r.status === "found").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const output = {
    generated: new Date().toISOString(),
    stats: { total_eligible: eligible.length, found, skipped },
    results,
  };
  await Deno.writeTextFile("db/addresses.json", JSON.stringify(output, null, 2));
  console.error(`\nDone! ${found} found, ${skipped} skipped → db/addresses.json`);
}

main();
