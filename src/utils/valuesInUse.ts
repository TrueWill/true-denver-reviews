import type { Place } from '../types';

type LookupField = 'category' | 'cuisine' | 'area';

export function valuesInUse(places: Place[], field: LookupField): string[] {
  const values = places
    .map((place) => place[field])
    .filter((value) => value !== null);

  return [...new Set(values)].sort();
}
