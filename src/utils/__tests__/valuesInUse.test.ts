import { describe, it, expect } from 'vitest';
import { valuesInUse } from '../valuesInUse';
import type { Place } from '../../types';

const makePlace = (overrides: Partial<Place>): Place => ({
  id: 1,
  name: 'Place',
  description: '',
  category: 'Restaurant',
  cuisine: null,
  address: null,
  area: null,
  closed: false,
  rating: null,
  ...overrides,
});

describe('valuesInUse', () => {
  it('returns unique values in sorted order', () => {
    const places = [
      makePlace({ category: 'Restaurant' }),
      makePlace({ category: 'Bar' }),
      makePlace({ category: 'Restaurant' }),
    ];

    expect(valuesInUse(places, 'category')).toEqual(['Bar', 'Restaurant']);
  });

  it('leaves out null values', () => {
    const places = [makePlace({ area: 'LoDo' }), makePlace({ area: null })];

    expect(valuesInUse(places, 'area')).toEqual(['LoDo']);
  });

  it('includes values used only by closed places', () => {
    const places = [makePlace({ cuisine: 'Thai', closed: true })];

    expect(valuesInUse(places, 'cuisine')).toEqual(['Thai']);
  });

  it('sorts by code unit, matching the previous database ordering', () => {
    const places = [
      makePlace({ area: 'lowercase' }),
      makePlace({ area: 'Zuni' }),
      makePlace({ area: 'Athmar Park' }),
    ];

    expect(valuesInUse(places, 'area')).toEqual([
      'Athmar Park',
      'Zuni',
      'lowercase',
    ]);
  });

  it('returns an empty list when there are no places', () => {
    expect(valuesInUse([], 'category')).toEqual([]);
  });
});
