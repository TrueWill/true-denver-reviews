import { usePlaces } from './hooks/usePlaces';
import { FilterBar } from './components/FilterBar';
import { PlaceList } from './components/PlaceList';
import styles from './App.module.css';

export default function App() {
  const { places, categories, cuisines, areas, filters, setFilters, loading, error } =
    usePlaces();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        {/* Mountain silhouette */}
        <svg
          className={styles.mountains}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 L0,80 L40,55 L80,72 L130,28 L175,58 L210,42 L255,65 L300,18 L345,52 L380,34 L420,60 L465,15 L510,50 L545,30 L585,55 L630,10 L675,45 L710,28 L750,52 L795,20 L840,48 L875,32 L910,55 L950,22 L990,50 L1030,35 L1070,58 L1110,28 L1155,50 L1200,38 L1200,120 Z"
            fill="currentColor"
          />
        </svg>

        <div className={styles.headerContent}>
          <div className={styles.eyebrow}>Denver, Colorado</div>
          <h1 className={styles.title}>True Denver Reviews</h1>
          <p className={styles.subtitle}>
            Honest, opinionated takes on Denver's restaurants & local spots
          </p>
          <p className={styles.disclaimer}>
            All opinions are personal and for informational purposes only. No
            guarantees are made regarding accuracy. Visit at your own risk.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <FilterBar
          categories={categories}
          cuisines={cuisines}
          areas={areas}
          filters={filters}
          onFilterChange={setFilters}
        />
        <PlaceList places={places} loading={loading} error={error} />
      </main>

      <footer className={styles.footer}>
        <span>True Denver Reviews</span>
        <span aria-hidden="true">·</span>
        <span>Denver, CO</span>
      </footer>
    </div>
  );
}
