import type { Place } from '../../types';
import { PlaceCard } from '../PlaceCard';
import styles from './PlaceList.module.css';

interface PlaceListProps {
  places: Place[];
  loading: boolean;
  error: Error | null;
}

export function PlaceList({ places, loading, error }: PlaceListProps) {
  if (loading) {
    return (
      <div className={styles.state} role="status" aria-live="polite">
        <span className={styles.loadingSpinner} aria-hidden="true" />
        <p className={styles.stateText}>Loading Denver's finest…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p className={styles.errorTitle}>Something went wrong</p>
        <p className={styles.stateText}>{error.message}</p>
      </div>
    );
  }

  const count = places.length;

  return (
    <section className={styles.section}>
      <p
        className={styles.resultCount}
        aria-live="polite"
        aria-atomic="true"
      >
        {count === 0
          ? 'No places match your filters'
          : count === 1
            ? '1 place'
            : `${count} places`}
      </p>

      {count === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon} aria-hidden="true">🏔️</p>
          <p className={styles.emptyText}>No places match your filters.</p>
          <p className={styles.emptyHint}>Try loosening the search or removing a filter.</p>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Places">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </ul>
      )}
    </section>
  );
}
