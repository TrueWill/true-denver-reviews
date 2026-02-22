import { describe, it, expect } from 'vitest';
import { filterAndSortPlaces } from '../filterPlaces';
import type { FilterState, Place } from '../../types';

const base: FilterState = {
  search: '',
  category: null,
  area: null,
  cuisine: null,
  rating: null,
  hideClosedPlaces: false,
  sortField: 'name',
  sortDirection: 'asc',
};

const places: Place[] = [
  {
    id: 1,
    name: 'Acme Burgers',
    description: 'Great smash burgers downtown',
    category: 'Restaurant',
    cuisine: 'American',
    address: '100 Main St',
    area: 'LoDo',
    closed: false,
    rating: 4,
  },
  {
    id: 2,
    name: 'Zenith Coffee',
    description: 'Specialty espresso in RiNo',
    category: 'Coffee Shop',
    cuisine: null,
    address: null,
    area: 'RiNo',
    closed: false,
    rating: 5,
  },
  {
    id: 3,
    name: 'Old Town Diner',
    description: 'Classic breakfast spot',
    category: 'Diner',
    cuisine: 'American',
    address: '200 Elm St',
    area: 'LoDo',
    closed: true,
    rating: 3,
  },
  {
    id: 4,
    name: 'Mesa Verde',
    description: 'Authentic Mexican cuisine',
    category: 'Restaurant',
    cuisine: 'Mexican',
    address: '300 Oak Ave',
    area: 'Baker',
    closed: false,
    rating: null,
  },
];

describe('filterAndSortPlaces', () => {
  it('returns all places with default filters', () => {
    expect(filterAndSortPlaces(places, base)).toHaveLength(4);
  });

  it('filters by search on name', () => {
    const result = filterAndSortPlaces(places, { ...base, search: 'zenith' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Zenith Coffee');
  });

  it('filters by search on description', () => {
    const result = filterAndSortPlaces(places, { ...base, search: 'espresso' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Zenith Coffee');
  });

  it('filters by category', () => {
    const result = filterAndSortPlaces(places, { ...base, category: 'Restaurant' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.category === 'Restaurant')).toBe(true);
  });

  it('filters by area', () => {
    const result = filterAndSortPlaces(places, { ...base, area: 'LoDo' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.area === 'LoDo')).toBe(true);
  });

  it('filters by cuisine', () => {
    const result = filterAndSortPlaces(places, { ...base, cuisine: 'Mexican' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Mesa Verde');
  });

  it('filters by minimum rating (at least)', () => {
    const result = filterAndSortPlaces(places, { ...base, rating: 4 });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(expect.arrayContaining(['Acme Burgers', 'Zenith Coffee']));
  });

  it('excludes null-rated places when a minimum rating is set', () => {
    const result = filterAndSortPlaces(places, { ...base, rating: 3 });
    expect(result.every((p) => p.rating !== null && p.rating >= 3)).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('hides closed places when hideClosedPlaces is true', () => {
    const result = filterAndSortPlaces(places, { ...base, hideClosedPlaces: true });
    expect(result).toHaveLength(3);
    expect(result.every((p) => !p.closed)).toBe(true);
  });

  it('includes closed places when hideClosedPlaces is false', () => {
    const result = filterAndSortPlaces(places, { ...base, hideClosedPlaces: false });
    expect(result.some((p) => p.closed)).toBe(true);
  });

  it('combines multiple filters', () => {
    const result = filterAndSortPlaces(places, {
      ...base,
      category: 'Restaurant',
      cuisine: 'American',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Acme Burgers');
  });

  it('sorts by name ascending', () => {
    const result = filterAndSortPlaces(places, {
      ...base,
      sortField: 'name',
      sortDirection: 'asc',
    });
    expect(result[0].name).toBe('Acme Burgers');
    expect(result[result.length - 1].name).toBe('Zenith Coffee');
  });

  it('sorts by name descending', () => {
    const result = filterAndSortPlaces(places, {
      ...base,
      sortField: 'name',
      sortDirection: 'desc',
    });
    expect(result[0].name).toBe('Zenith Coffee');
    expect(result[result.length - 1].name).toBe('Acme Burgers');
  });

  it('sorts by rating ascending (nulls last)', () => {
    const result = filterAndSortPlaces(places, {
      ...base,
      sortField: 'rating',
      sortDirection: 'asc',
    });
    expect(result[0].rating).toBe(3);
    expect(result[result.length - 1].rating).toBeNull();
  });

  it('sorts by rating descending (nulls last)', () => {
    const result = filterAndSortPlaces(places, {
      ...base,
      sortField: 'rating',
      sortDirection: 'desc',
    });
    expect(result[0].rating).toBe(5);
    expect(result[result.length - 1].rating).toBeNull();
  });

  it('returns empty array when no places match', () => {
    const result = filterAndSortPlaces(places, { ...base, search: 'xyznotfound' });
    expect(result).toHaveLength(0);
  });
});
