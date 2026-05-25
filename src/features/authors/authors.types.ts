export interface AuthorBookSummary {
  id: number;
  title: string;
  coverUrl: string | null;
  seriesName: string | null;
  seriesOrder: number | null;
}

export interface AuthorListItem {
  id: number;
  name: string;
  bookCount: number;
  books: AuthorBookSummary[];
}
