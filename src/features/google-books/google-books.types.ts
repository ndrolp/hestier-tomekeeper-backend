export type GoogleBooksLanguage = 'es' | 'en' | 'all';

export interface GoogleBooksVolume {
  id: string;
  seriesInfo?: {
    shortSeriesBookTitle?: string;
    bookDisplayNumber?: string;
    volumeSeries?: Array<{ seriesId: string; orderNumber?: string }>;
  };
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publisher?: string;
    publishedDate?: string;
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: 'ISBN_10' | 'ISBN_13' | string;
      identifier: string;
    }>;
    categories?: string[];
  };
}

export interface GoogleBooksApiResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export interface GoogleBooksSearchResult {
  googleId: string;
  title: string;
  authors: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  coverUrl?: string;
  isbn?: string;
  categories?: string[];
  seriesTitle?: string;
  seriesBookNumber?: string;
}
