import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPlaces } from '../fetchPlaces';
import type { Place } from '../../types';

const place: Place = {
  id: 1,
  name: 'Acme Burgers',
  description: '',
  category: 'Restaurant',
  cuisine: null,
  address: null,
  area: null,
  closed: false,
  rating: null,
};

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPlaces', () => {
  it('requests places.json under the base URL and returns its rows', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify([place])));

    await expect(fetchPlaces()).resolves.toEqual([place]);

    expect(fetchMock).toHaveBeenCalledWith('/places.json');
  });

  it('rejects on an HTTP error', async () => {
    stubFetch(new Response('Not found', { status: 404 }));

    await expect(fetchPlaces()).rejects.toThrow('HTTP 404');
  });

  it('rejects when the body is not JSON', async () => {
    stubFetch(new Response('<!doctype html>'));

    await expect(fetchPlaces()).rejects.toThrow(SyntaxError);
  });

  it('rejects when the JSON is not an array', async () => {
    stubFetch(new Response('{}'));

    await expect(fetchPlaces()).rejects.toThrow('unexpected data format');
  });

  it('rejects when the network request fails', async () => {
    const failure = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(failure));

    await expect(fetchPlaces()).rejects.toBe(failure);
  });
});
