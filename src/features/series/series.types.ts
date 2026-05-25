export interface SeriesBookSummary {
  id: number;
  title: string;
  coverUrl: string | null;
  seriesOrder: number | null;
}

export interface SeriesListItem {
  id: number;
  name: string;
  description: string | null;
  bookCount: number;
  books: SeriesBookSummary[];
}
