import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaceList } from '../index';
import type { Place } from '../../../types';

const places: Place[] = [
  {
    id: 1,
    name: 'Alpha Cafe',
    description: '',
    category: 'Coffee Shop',
    cuisine: null,
    address: null,
    area: 'RiNo',
    closed: false,
    rating: 4,
  },
  {
    id: 2,
    name: 'Beta Bistro',
    description: '',
    category: 'Restaurant',
    cuisine: 'American',
    address: null,
    area: 'LoDo',
    closed: false,
    rating: 3,
  },
];

describe('PlaceList', () => {
  it('shows loading indicator when loading', () => {
    render(<PlaceList places={[]} loading={true} error={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    const err = new Error('DB connection failed');
    render(<PlaceList places={[]} loading={false} error={err} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('DB connection failed')).toBeInTheDocument();
  });

  it('shows empty state when no places match', () => {
    render(<PlaceList places={[]} loading={false} error={null} />);
    // The result count and empty text both contain "no places match" — target the empty state hint
    expect(screen.getByText(/try loosening/i)).toBeInTheDocument();
  });

  it('renders place cards for each place', () => {
    render(<PlaceList places={places} loading={false} error={null} />);
    expect(screen.getByText('Alpha Cafe')).toBeInTheDocument();
    expect(screen.getByText('Beta Bistro')).toBeInTheDocument();
  });

  it('shows singular count for 1 place', () => {
    render(<PlaceList places={[places[0]!]} loading={false} error={null} />);
    expect(screen.getByText('1 place')).toBeInTheDocument();
  });

  it('shows plural count for multiple places', () => {
    render(<PlaceList places={places} loading={false} error={null} />);
    expect(screen.getByText('2 places')).toBeInTheDocument();
  });

  it('result count has aria-live attribute', () => {
    render(<PlaceList places={places} loading={false} error={null} />);
    expect(screen.getByText('2 places')).toHaveAttribute('aria-live', 'polite');
  });
});
