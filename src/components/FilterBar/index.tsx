import type { FilterState } from '../../types';
import { getActiveFilterCount, ratingFromString } from '../../utils/filterPlaces';
import { getRatingDisplay } from '../../utils/rating';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  categories: string[];
  cuisines: string[];
  areas: string[];
  filters: FilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<FilterState>>;
}

const RATING_THRESHOLDS = [5, 4, 3] as const;

function set<K extends keyof FilterState>(
  onChange: FilterBarProps['onFilterChange'],
  key: K,
  value: FilterState[K],
) {
  onChange((prev) => ({ ...prev, [key]: value }));
}

export function FilterBar({
  categories,
  cuisines,
  areas,
  filters,
  onFilterChange,
}: FilterBarProps) {
  const activeCount = getActiveFilterCount(filters);

  const reset = () =>
    onFilterChange((prev) => ({
      ...prev,
      search: '',
      category: null,
      area: null,
      cuisine: null,
      rating: null,
      hideClosedPlaces: false,
    }));

  return (
    <aside className={styles.bar} aria-label="Filter and sort places">
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Filter</legend>

        <div className={styles.controls}>
          <label className={styles.field} htmlFor="search">
            <span className={styles.fieldLabel}>Search</span>
            <input
              id="search"
              type="search"
              className={styles.input}
              placeholder="Name or description…"
              value={filters.search}
              onChange={(e) => set(onFilterChange, 'search', e.target.value)}
              aria-label="Search by name or description"
            />
          </label>

          <label className={styles.field} htmlFor="category">
            <span className={styles.fieldLabel}>Category</span>
            <select
              id="category"
              className={styles.select}
              value={filters.category ?? ''}
              onChange={(e) =>
                set(onFilterChange, 'category', e.target.value || null)
              }
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field} htmlFor="area">
            <span className={styles.fieldLabel}>Area</span>
            <select
              id="area"
              className={styles.select}
              value={filters.area ?? ''}
              onChange={(e) =>
                set(onFilterChange, 'area', e.target.value || null)
              }
            >
              <option value="">All areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field} htmlFor="cuisine">
            <span className={styles.fieldLabel}>Cuisine</span>
            <select
              id="cuisine"
              className={styles.select}
              value={filters.cuisine ?? ''}
              onChange={(e) =>
                set(onFilterChange, 'cuisine', e.target.value || null)
              }
            >
              <option value="">All cuisines</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field} htmlFor="rating">
            <span className={styles.fieldLabel}>Rating</span>
            <select
              id="rating"
              className={styles.select}
              value={filters.rating ?? ''}
              onChange={(e) =>
                set(
                  onFilterChange,
                  'rating',
                  e.target.value ? ratingFromString(e.target.value) : null,
                )
              }
            >
              <option value="">Any rating</option>
              {RATING_THRESHOLDS.map((r) => {
                const { emoji, label } = getRatingDisplay(r);
                return (
                  <option key={r} value={r}>
                    {emoji} {label}{r < 5 ? ' & up' : ''}
                  </option>
                );
              })}
            </select>
          </label>

          <label className={styles.toggleField} htmlFor="hide-closed">
            <input
              id="hide-closed"
              type="checkbox"
              className={styles.checkbox}
              checked={filters.hideClosedPlaces}
              onChange={(e) =>
                set(onFilterChange, 'hideClosedPlaces', e.target.checked)
              }
            />
            <span className={styles.toggleLabel}>Hide closed</span>
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Sort</legend>

        <div className={styles.sortRow}>
          <label className={styles.field} htmlFor="sort-field">
            <span className={styles.fieldLabel}>By</span>
            <select
              id="sort-field"
              className={styles.select}
              value={filters.sortField}
              onChange={(e) =>
                set(
                  onFilterChange,
                  'sortField',
                  e.target.value as FilterState['sortField'],
                )
              }
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
            </select>
          </label>

          <label className={styles.field} htmlFor="sort-dir">
            <span className={styles.fieldLabel}>Order</span>
            <select
              id="sort-dir"
              className={styles.select}
              value={filters.sortDirection}
              onChange={(e) =>
                set(
                  onFilterChange,
                  'sortDirection',
                  e.target.value as FilterState['sortDirection'],
                )
              }
            >
              <option value="asc">A → Z / High → Low</option>
              <option value="desc">Z → A / Low → High</option>
            </select>
          </label>
        </div>
      </fieldset>

      {activeCount > 0 && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={reset}
          aria-label={`Clear all ${activeCount} active filter${activeCount !== 1 ? 's' : ''}`}
        >
          Clear {activeCount} filter{activeCount !== 1 ? 's' : ''}
        </button>
      )}
    </aside>
  );
}
