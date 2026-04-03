export type EditionFormat = 'Digital' | 'Hardcover' | 'Paperback';

export interface Edition {
  id: number;
  bookId: number;
  name: string;
  publisher: string | null;
  publicationDate: string | null;
  isbn: string | null;
  format: EditionFormat | null;
  language: string | null;
  filePath: string | null;
}

export interface CreateEditionInput {
  bookId: number;
  name: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  format?: EditionFormat;
  language?: string;
}

export interface UpdateEditionInput {
  name?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  format?: EditionFormat;
  language?: string;
}
