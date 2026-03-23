export interface SearchBooksResult {
  id: number;
  title: string;
  author: string;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
  seriesName: string | null;
}
