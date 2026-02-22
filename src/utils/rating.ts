import type { Rating } from '../types';

interface RatingDisplay {
  emoji: string;
  label: string;
}

export function getRatingDisplay(rating: Rating): RatingDisplay {
  switch (rating) {
    case 5:
      return { emoji: '❤️', label: 'Love it' };
    case 4:
      return { emoji: '👍👍', label: 'Really good' };
    case 3:
      return { emoji: '👍', label: 'Good' };
    case 2:
      return { emoji: '🤏', label: 'Meh' };
    case 1:
      return { emoji: '👎', label: 'Bad' };
    default:
      return { emoji: '—', label: 'Not yet rated' };
  }
}
