import type { Place } from '../types';

export async function fetchPlaces(): Promise<Place[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}places.json`);

  if (!response.ok) {
    throw new Error(`Failed to load places (HTTP ${response.status})`);
  }

  const places: unknown = await response.json();

  if (!Array.isArray(places)) {
    throw new Error('Failed to load places (unexpected data format)');
  }

  return places as Place[];
}
