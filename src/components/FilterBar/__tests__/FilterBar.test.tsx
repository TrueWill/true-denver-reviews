import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../index';
import type { FilterState } from '../../../types';

const defaultFilters: FilterState = {
  search: '',
  category: null,
  area: null,
  cuisine: null,
  rating: null,
  hideClosedPlaces: false,
  sortField: 'name',
  sortDirection: 'asc',
};

const categories = ['Bar', 'Coffee Shop', 'Restaurant'];
const cuisines = ['American', 'Italian', 'Mexican'];
const areas = ['Baker', 'LoDo', 'RiNo'];

function renderBar(filters = defaultFilters, onChange = vi.fn()) {
  return {
    onChange,
    ...render(
      <FilterBar
        categories={categories}
        cuisines={cuisines}
        areas={areas}
        filters={filters}
        onFilterChange={onChange}
      />,
    ),
  };
}

describe('FilterBar', () => {
  it('renders search input with label', () => {
    renderBar();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it('renders category select with label', () => {
    renderBar();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('renders area select with label', () => {
    renderBar();
    expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
  });

  it('renders cuisine select with label', () => {
    renderBar();
    expect(screen.getByLabelText(/cuisine/i)).toBeInTheDocument();
  });

  it('renders rating select with label', () => {
    renderBar();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
  });

  it('renders hide closed checkbox with label', () => {
    renderBar();
    expect(screen.getByLabelText(/hide closed/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', async () => {
    const { onChange } = renderBar();
    await userEvent.type(screen.getByLabelText(/search/i), 'coffee');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when category changes', async () => {
    const { onChange } = renderBar();
    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      'Restaurant',
    );
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when hide closed checkbox changes', async () => {
    const { onChange } = renderBar();
    await userEvent.click(screen.getByLabelText(/hide closed/i));
    expect(onChange).toHaveBeenCalled();
  });

  it('shows clear button when filters are active', () => {
    renderBar({ ...defaultFilters, search: 'pizza' });
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('does not show clear button when no filters are active', () => {
    renderBar();
    expect(
      screen.queryByRole('button', { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onFilterChange with reset state when clear is clicked', async () => {
    const sortedFilters = {
      ...defaultFilters,
      search: 'test',
      category: 'Bar',
      sortField: 'rating' as const,
      sortDirection: 'desc' as const,
    };
    const { onChange } = renderBar(sortedFilters);
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    const updater = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const result = updater(sortedFilters);
    expect(result).toMatchObject({
      search: '',
      category: null,
      sortField: 'rating',
      sortDirection: 'desc',
    });
  });

  it('populates category options from props', () => {
    renderBar();
    const select = screen.getByLabelText(/category/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain('Restaurant');
    expect(options).toContain('Bar');
    expect(options).toContain('Coffee Shop');
  });

  it('is wrapped in landmark with accessible label', () => {
    renderBar();
    expect(
      screen.getByRole('complementary', { name: /filter/i }),
    ).toBeInTheDocument();
  });
});
