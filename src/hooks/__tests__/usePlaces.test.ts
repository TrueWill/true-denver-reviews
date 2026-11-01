import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaces } from '../usePlaces';
import type { Place } from '../../types';

vi.mock('../../data/fetchPlaces', () => ({
  fetchPlaces: vi.fn(),
}));

import { fetchPlaces } from '../../data/fetchPlaces';

const makePlaces = (overrides: Partial<Place>[] = []): Place[] =>
  overrides.map((o, i) => ({
    id: i + 1,
    name: `Place ${i + 1}`,
    description: '',
    category: 'Restaurant',
    cuisine: null,
    address: null,
    area: null,
    closed: false,
    rating: null,
    ...o,
  }));

describe('usePlaces loading and error state', () => {
  it('stops loading and exposes the error when the fetch fails', async () => {
    const fetchError = new Error('fetch failed');
    vi.mocked(fetchPlaces).mockRejectedValue(fetchError);

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.error).toBe(fetchError));
    expect(result.current.loading).toBe(false);
  });

  it('wraps non-Error rejections in an Error', async () => {
    vi.mocked(fetchPlaces).mockRejectedValue('boom');

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
    expect(result.current.loading).toBe(false);
  });

  it('is loading while the fetch is pending', () => {
    vi.mocked(fetchPlaces).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePlaces());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });
});

describe('usePlaces data', () => {
  it('returns the loaded places sorted by the default filters', async () => {
    vi.mocked(fetchPlaces).mockResolvedValue(
      makePlaces([{ name: 'Zenith' }, { name: 'Acme' }]),
    );

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.places.map((p) => p.name)).toEqual([
      'Acme',
      'Zenith',
    ]);
    expect(result.current.error).toBeNull();
  });

  it('derives filter options from the places in use', async () => {
    vi.mocked(fetchPlaces).mockResolvedValue(
      makePlaces([
        { category: 'Restaurant', cuisine: 'Thai', area: 'RiNo' },
        { category: 'Bar', cuisine: null, area: 'LoDo', closed: true },
        { category: 'Bar', cuisine: 'BBQ', area: null },
      ]),
    );

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(['Bar', 'Restaurant']);
    expect(result.current.cuisines).toEqual(['BBQ', 'Thai']);
    expect(result.current.areas).toEqual(['LoDo', 'RiNo']);
  });

  it('returns empty areas when no places have an area', async () => {
    vi.mocked(fetchPlaces).mockResolvedValue(makePlaces([{ area: null }]));

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.areas).toEqual([]);
  });
});
