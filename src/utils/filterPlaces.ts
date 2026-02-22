import type { FilterState, Place, Rating } from '../types';

export function filterAndSortPlaces(places: Place[], filters: FilterState): Place[] {
  const { search, category, area, cuisine, rating, hideClosedPlaces, sortField, sortDirection } =
    filters;

  const searchLower = search.toLowerCase();

  const filtered = places.filter((p) => {
    if (hideClosedPlaces && p.closed) return false;
    if (category && p.category !== category) return false;
    if (area && p.area !== area) return false;
    if (cuisine && p.cuisine !== cuisine) return false;
    if (rating !== null && p.rating !== rating) return false;
    if (
      searchLower &&
      !p.name.toLowerCase().includes(searchLower) &&
      !p.description.toLowerCase().includes(searchLower)
    )
      return false;
    return true;
  });

  return filtered.sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'rating') {
      // Nulls sort last regardless of direction
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return (a.rating - b.rating) * dir;
    }

    return a.name.localeCompare(b.name) * dir;
  });
}

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.category) count++;
  if (filters.area) count++;
  if (filters.cuisine) count++;
  if (filters.rating !== null) count++;
  if (filters.hideClosedPlaces) count++;
  return count;
}

export function makeFilterUpdater<K extends keyof FilterState>(
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>,
  key: K,
) {
  return (value: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
}

export function ratingFromString(value: string): Rating {
  const n = parseInt(value, 10);
  if (n >= 1 && n <= 5) return n as Rating;
  return null;
}
