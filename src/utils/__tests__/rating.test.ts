import { describe, it, expect } from 'vitest';
import { getRatingDisplay } from '../rating';

describe('getRatingDisplay', () => {
  it('returns Love it for 5', () => {
    const { emoji, label } = getRatingDisplay(5);
    expect(emoji).toBe('❤️');
    expect(label).toBe('Love it');
  });

  it('returns Really good for 4', () => {
    const { emoji, label } = getRatingDisplay(4);
    expect(emoji).toBe('👍👍');
    expect(label).toBe('Really good');
  });

  it('returns Good for 3', () => {
    const { emoji, label } = getRatingDisplay(3);
    expect(emoji).toBe('👍');
    expect(label).toBe('Good');
  });

  it('returns Meh for 2', () => {
    const { emoji, label } = getRatingDisplay(2);
    expect(emoji).toBe('🤏');
    expect(label).toBe('Meh');
  });

  it('returns Bad for 1', () => {
    const { emoji, label } = getRatingDisplay(1);
    expect(emoji).toBe('👎');
    expect(label).toBe('Bad');
  });

  it('returns Not yet rated for null', () => {
    const { emoji, label } = getRatingDisplay(null);
    expect(emoji).toBe('—');
    expect(label).toBe('Not yet rated');
  });
});
