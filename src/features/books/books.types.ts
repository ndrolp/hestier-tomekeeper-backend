import { books } from '../../db/books.schema';
import { EditionFormat } from '../editions/editions.types';

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
  publisher: string | null | undefined;
  publishedDate: string | null | undefined;
  language: string | null | undefined;
  isbn: string | null | undefined;
}

export interface SearchBooksOptions {
  id: number;
  title: string;
  authors: string[] | null;
  originalTitle: string | null;
  seriesId: number | null;
  seriesOrder: number | null;
  coverUrl: string | null;
  seriesName: string | null;
  description: string | null;
}

export type SearchBooksOrder = keyof typeof books.$inferInsert | 'seriesName';

export interface BookEditionInput {
  name?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  format?: EditionFormat;
  language?: string;
}

export interface CreateBookInput {
  title: string;
  authorNames?: string[];
  originalTitle?: string;
  seriesId?: number;
  seriesOrder?: number;
  coverUrl?: string;
  description?: string;
  edition?: BookEditionInput;
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
  edition?: BookEditionInput;
}

export interface UpdateBookInput {
  title?: string;
  originalTitle?: string;
  seriesId?: number | null;
  seriesName?: string;
  seriesOrder?: number | null;
  coverUrl?: string | null;
  description?: string | null;
  authorNames?: string[];
}
