import type { Rating } from '../../types';
import { getRatingDisplay } from '../../utils/rating';
import styles from './RatingBadge.module.css';

interface RatingBadgeProps {
  rating: Rating;
}

const ratingClass: Record<string, string> = {
  '5': styles.r5,
  '4': styles.r4,
  '3': styles.r3,
  '2': styles.r2,
  '1': styles.r1,
  null: styles.rNull,
};

export function RatingBadge({ rating }: RatingBadgeProps) {
  const { emoji, label } = getRatingDisplay(rating);
  const cls = ratingClass[String(rating)] ?? styles.rNull;

  return (
    <span
      className={`${styles.badge} ${cls}`}
      role="img"
      aria-label={`Rating: ${label}`}
      title={label}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
