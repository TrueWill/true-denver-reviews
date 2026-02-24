import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaceCard } from '../index';
import type { Place } from '../../../types';

const place: Place = {
  id: 1,
  name: 'Test Bistro',
  description: 'A fine dining experience',
  category: 'Restaurant',
  cuisine: 'Italian',
  address: '123 Main St, Denver, CO 80202',
  area: 'LoDo',
  closed: false,
  rating: 4,
};

describe('PlaceCard', () => {
  it('renders the place name', () => {
    render(<PlaceCard place={place} />);
    expect(screen.getByText('Test Bistro')).toBeInTheDocument();
  });

  it('renders category and cuisine chips', () => {
    render(<PlaceCard place={place} />);
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('renders area chip', () => {
    render(<PlaceCard place={place} />);
    expect(screen.getByText('LoDo')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<PlaceCard place={place} />);
    expect(screen.getByText('A fine dining experience')).toBeInTheDocument();
  });

  it('renders Google Maps address link', () => {
    render(<PlaceCard place={place} />);
    const link = screen.getByRole('link', { name: /google maps/i });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps'),
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows Closed badge when closed', () => {
    render(<PlaceCard place={{ ...place, closed: true }} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('does not show Closed badge when open', () => {
    render(<PlaceCard place={place} />);
    expect(screen.queryByText('Closed')).not.toBeInTheDocument();
  });

  it('omits cuisine chip when cuisine is null', () => {
    render(<PlaceCard place={{ ...place, cuisine: null }} />);
    expect(screen.queryByText('Italian')).not.toBeInTheDocument();
  });

  it('omits address link when address is null', () => {
    render(<PlaceCard place={{ ...place, address: null }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('omits area chip when area is null', () => {
    render(<PlaceCard place={{ ...place, area: null }} />);
    expect(screen.queryByText('LoDo')).not.toBeInTheDocument();
  });
});
