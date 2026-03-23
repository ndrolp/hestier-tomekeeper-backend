import { book } from '../../db/books.schema';

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

export type SearchBooksOrder = keyof typeof book.$inferInsert | 'seriesName';
