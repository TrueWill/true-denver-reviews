import { useEffect, useMemo, useState } from 'react';
import { useDb } from './useDb';
import { fetchAllPlaces, fetchCategories, fetchCuisines, fetchAreas } from '../db/queries';
import { filterAndSortPlaces } from '../utils/filterPlaces';
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
  const { conn, loading: dbLoading, error: dbError } = useDb();

  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    if (!conn) return;

    let cancelled = false;

    Promise.all([
      fetchAllPlaces(conn),
      fetchCategories(conn),
      fetchCuisines(conn),
      fetchAreas(conn),
    ])
      .then(([places, cats, cuis, areasData]) => {
        if (cancelled) return;
        setAllPlaces(places);
        setCategories(cats);
        setCuisines(cuis);
        setAreas(areasData);
        setDataLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDataError(err instanceof Error ? err : new Error(String(err)));
        setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conn]);

  const places = useMemo(
    () => filterAndSortPlaces(allPlaces, filters),
    [allPlaces, filters],
  );

  return {
    places,
    categories,
    cuisines,
    areas,
    filters,
    setFilters,
    loading: dbLoading || dataLoading,
    error: dbError ?? dataError,
  };
}
