import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaces } from '../usePlaces';
import type { Place } from '../../types';

vi.mock('../useDb', () => ({
  useDb: () => ({ conn: {}, loading: false, error: null }),
}));

vi.mock('../../db/queries', () => ({
  fetchAllPlaces: vi.fn(),
  fetchCategories: vi.fn(),
  fetchCuisines: vi.fn(),
  fetchAreas: vi.fn(),
}));

import * as queries from '../../db/queries';

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

beforeEach(() => {
  vi.mocked(queries.fetchCategories).mockResolvedValue(['Restaurant']);
  vi.mocked(queries.fetchCuisines).mockResolvedValue([]);
});

describe('usePlaces areas filtering', () => {
  it('only returns areas that have at least one associated place', async () => {
    vi.mocked(queries.fetchAllPlaces).mockResolvedValue(
      makePlaces([{ area: 'LoDo' }, { area: 'RiNo' }]),
    );
    vi.mocked(queries.fetchAreas).mockResolvedValue(['Baker', 'LoDo', 'RiNo']);

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.areas).toEqual(['LoDo', 'RiNo']);
    expect(result.current.areas).not.toContain('Baker');
  });

  it('includes areas that have only closed places', async () => {
    vi.mocked(queries.fetchAllPlaces).mockResolvedValue(
      makePlaces([{ area: 'LoDo', closed: true }]),
    );
    vi.mocked(queries.fetchAreas).mockResolvedValue(['LoDo', 'Unused']);

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.areas).toContain('LoDo');
    expect(result.current.areas).not.toContain('Unused');
  });

  it('returns empty areas when no places have an area', async () => {
    vi.mocked(queries.fetchAllPlaces).mockResolvedValue(
      makePlaces([{ area: null }]),
    );
    vi.mocked(queries.fetchAreas).mockResolvedValue(['Baker', 'LoDo']);

    const { result } = renderHook(() => usePlaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.areas).toEqual([]);
  });
});
