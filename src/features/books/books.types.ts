import { books } from '../../db/books.schema';

export interface SearchBooksResult {
  id: number;
  title: string;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
  seriesName: string | null;
}

export type SearchBooksOrder = keyof typeof books.$inferInsert | 'seriesName';

export interface CreateBookInput {
  title: string;
  originalTitle?: string;
  seriesId?: number;
  seriesOrder?: number;
  coverUrl?: string;
}

export interface CreateBookResult {
  id: number;
  title: string;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
}
