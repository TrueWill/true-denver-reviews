import { useEffect, useMemo, useState } from 'react';
import { fetchPlaces } from '../data/fetchPlaces';
import { filterAndSortPlaces } from '../utils/filterPlaces';
import { valuesInUse } from '../utils/valuesInUse';
import type { FilterState, Place } from '../types';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: null,
  area: null,
  cuisine: null,
  rating: null,
  hideClosedPlaces: false,
  sortField: 'name',
  sortDirection: 'asc',
};

interface UsePlacesResult {
  places: Place[];
  categories: string[];
  cuisines: string[];
  areas: string[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  loading: boolean;
  error: Error | null;
}

export function usePlaces(): UsePlacesResult {
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;

    fetchPlaces()
      .then((places) => {
        if (cancelled) return;
        setAllPlaces(places);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const places = useMemo(
    () => filterAndSortPlaces(allPlaces, filters),
    [allPlaces, filters],
  );

  const categories = useMemo(
    () => valuesInUse(allPlaces, 'category'),
    [allPlaces],
  );
  const cuisines = useMemo(
    () => valuesInUse(allPlaces, 'cuisine'),
    [allPlaces],
  );
  const areas = useMemo(() => valuesInUse(allPlaces, 'area'), [allPlaces]);

  return {
    places,
    categories,
    cuisines,
    areas,
    filters,
    setFilters,
    loading,
    error,
  };
}
