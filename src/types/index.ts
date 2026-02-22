export type Rating = 1 | 2 | 3 | 4 | 5 | null;

export interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  cuisine: string | null;
  address: string | null;
  area: string | null;
  closed: boolean;
  rating: Rating;
}

export interface FilterState {
  search: string;
  category: string | null;
  area: string | null;
  cuisine: string | null;
  rating: Rating;
  hideClosedPlaces: boolean;
  sortField: 'name' | 'rating';
  sortDirection: 'asc' | 'desc';
}
