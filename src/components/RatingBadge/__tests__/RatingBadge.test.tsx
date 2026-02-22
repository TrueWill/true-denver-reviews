import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingBadge } from '../index';

describe('RatingBadge', () => {
  it('shows Favorite! for rating 5', () => {
    render(<RatingBadge rating={5} />);
    expect(screen.getByRole('img', { name: /favorite!/i })).toBeInTheDocument();
  });

  it('shows Really good for rating 4', () => {
    render(<RatingBadge rating={4} />);
    expect(
      screen.getByRole('img', { name: /really good/i }),
    ).toBeInTheDocument();
  });

  it('shows Good for rating 3', () => {
    render(<RatingBadge rating={3} />);
    expect(screen.getByRole('img', { name: /good/i })).toBeInTheDocument();
  });

  it('shows Meh / Just OK for rating 2', () => {
    render(<RatingBadge rating={2} />);
    expect(
      screen.getByRole('img', { name: /meh \/ Just OK/i }),
    ).toBeInTheDocument();
  });

  it('shows Bad for rating 1', () => {
    render(<RatingBadge rating={1} />);
    expect(screen.getByRole('img', { name: /bad/i })).toBeInTheDocument();
  });

  it('shows Not yet rated for null', () => {
    render(<RatingBadge rating={null} />);
    expect(
      screen.getByRole('img', { name: /not yet rated/i }),
    ).toBeInTheDocument();
  });

  it('renders the emoji', () => {
    render(<RatingBadge rating={5} />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });
});
