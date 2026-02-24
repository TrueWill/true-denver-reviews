import type { Place } from '../../types';
import { RatingBadge } from '../RatingBadge';
import { buildMapsUrl } from '../../utils/maps';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <li className={`${styles.card} ${place.closed ? styles.closed : ''}`}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          {place.closed && (
            <span
              className={styles.closedBadge}
              aria-label="Permanently closed"
            >
              Closed
            </span>
          )}
          <h2 className={styles.name}>{place.name}</h2>
        </div>
        <RatingBadge rating={place.rating} />
      </div>

      <div className={styles.chips}>
        <span className={`${styles.chip} ${styles.categoryChip}`}>
          {place.category}
        </span>
        {place.cuisine && (
          <span className={`${styles.chip} ${styles.cuisineChip}`}>
            {place.cuisine}
          </span>
        )}
        {place.area && (
          <span className={`${styles.chip} ${styles.areaChip}`}>
            {place.area}
          </span>
        )}
      </div>

      {place.description && (
        <p className={styles.description}>{place.description}</p>
      )}

      {place.address && (
        <a
          href={buildMapsUrl(place.address)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.address}
          aria-label={`View ${place.name} on Google Maps: ${place.address}`}
        >
          <span className={styles.addressIcon} aria-hidden="true">
            ↗
          </span>
          {place.address}
        </a>
      )}
    </li>
  );
}
