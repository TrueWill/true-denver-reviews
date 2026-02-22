import { describe, it, expect } from 'vitest';
import { buildMapsUrl } from '../maps';

describe('buildMapsUrl', () => {
  it('encodes a simple address', () => {
    const url = buildMapsUrl('123 Main St, Denver, CO 80202');
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Denver%2C%20CO%2080202',
    );
  });

  it('encodes special characters', () => {
    const url = buildMapsUrl("Linger's & Co.");
    expect(url).toContain('google.com/maps/search/');
    expect(url).toContain(encodeURIComponent("Linger's & Co."));
  });

  it('returns a valid URL string', () => {
    const url = buildMapsUrl('1701 Wynkoop St, Denver');
    expect(() => new URL(url)).not.toThrow();
  });
});
