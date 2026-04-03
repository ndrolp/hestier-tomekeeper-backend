import { books } from '../../db/books.schema';

export interface SearchBooksResult {
  id: number;
  title: string;
  authors: string[] | null;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
  seriesName: string | null;
  description: string | null;
  publisher: string | null;
  publishedDate: string | null;
  language: string | null;
  isbn: string | null;
}

export type SearchBooksOrder = keyof typeof books.$inferInsert | 'seriesName';

export interface CreateBookInput {
  title: string;
  originalTitle?: string;
  seriesId?: number;
  seriesOrder?: number;
  coverUrl?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  isbn?: string;
}

export interface CreateBookResult {
  id: number;
  title: string;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
  description: string | null;
  publisher: string | null;
  publishedDate: string | null;
  language: string | null;
  isbn: string | null;
}

export interface ImportBookInput {
  title: string;
  authorNames?: string[];
  originalTitle?: string;
  seriesId?: number;
  seriesName?: string;
  seriesOrder?: number;
  coverUrl?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  isbn?: string;
}

export interface UpdateBookInput {
  title?: string;
  originalTitle?: string;
  seriesId?: number | null;
  seriesName?: string;
  seriesOrder?: number | null;
  coverUrl?: string | null;
  description?: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  language?: string | null;
  isbn?: string | null;
  authorNames?: string[];
}
