import { count, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '../../config/database';
import { authors } from '../../db/author.schema';
import { books } from '../../db/books.schema';
import { editions } from '../../db/edition.schema';
import { quotes } from '../../db/quotes.schema';
import { series } from '../../db/series.schema';

export interface StatisticsSnapshot {
  totals: {
    books: number;
    authors: number;
    series: number;
    editions: number;
    quotes: number;
  };
  books: {
    withCover: number;
    withDescription: number;
    withIsbn: number;
    inSeries: number;
    standalone: number;
    languagesTracked: number;
  };
  editions: {
    digital: number;
    hardcover: number;
    paperback: number;
    withFile: number;
  };
  quotes: {
    public: number;
    private: number;
  };
}

async function countAllBooks() {
  const result = await db.select({ count: count() }).from(books);
  return result[0]?.count ?? 0;
}

async function countAllAuthors() {
  const result = await db.select({ count: count() }).from(authors);
  return result[0]?.count ?? 0;
}

async function countAllSeries() {
  const result = await db.select({ count: count() }).from(series);
  return result[0]?.count ?? 0;
}

async function countAllEditions() {
  const result = await db.select({ count: count() }).from(editions);
  return result[0]?.count ?? 0;
}

async function countAllQuotes() {
  const result = await db.select({ count: count() }).from(quotes);
  return result[0]?.count ?? 0;
}

async function countBooksWithCover() {
  const result = await db
    .select({ count: count() })
    .from(books)
    .where(isNotNull(books.coverUrl));
  return result[0]?.count ?? 0;
}

async function countBooksWithDescription() {
  const result = await db
    .select({ count: count() })
    .from(books)
    .where(isNotNull(books.description));
  return result[0]?.count ?? 0;
}

async function countBooksWithIsbn() {
  const result = await db
    .select({ count: count() })
    .from(books)
    .where(isNotNull(books.isbn));
  return result[0]?.count ?? 0;
}

async function countBooksInSeries() {
  const result = await db
    .select({ count: count() })
    .from(books)
    .where(isNotNull(books.seriesId));
  return result[0]?.count ?? 0;
}

async function countStandaloneBooks() {
  const result = await db
    .select({ count: count() })
    .from(books)
    .where(isNull(books.seriesId));
  return result[0]?.count ?? 0;
}

async function countTrackedBookLanguages() {
  const result = await db
    .select({ language: books.language })
    .from(books)
    .where(isNotNull(books.language))
    .groupBy(books.language);

  return result.length;
}

async function countDigitalEditions() {
  const result = await db
    .select({ count: count() })
    .from(editions)
    .where(eq(editions.format, 'Digital'));
  return result[0]?.count ?? 0;
}

async function countHardcoverEditions() {
  const result = await db
    .select({ count: count() })
    .from(editions)
    .where(eq(editions.format, 'Hardcover'));
  return result[0]?.count ?? 0;
}

async function countPaperbackEditions() {
  const result = await db
    .select({ count: count() })
    .from(editions)
    .where(eq(editions.format, 'Paperback'));
  return result[0]?.count ?? 0;
}

async function countEditionsWithFiles() {
  const result = await db
    .select({ count: count() })
    .from(editions)
    .where(isNotNull(editions.filePath));
  return result[0]?.count ?? 0;
}

async function countPublicQuotes() {
  const result = await db
    .select({ count: count() })
    .from(quotes)
    .where(eq(quotes.public, true));
  return result[0]?.count ?? 0;
}

async function countPrivateQuotes() {
  const result = await db
    .select({ count: count() })
    .from(quotes)
    .where(eq(quotes.public, false));
  return result[0]?.count ?? 0;
}

export async function getStatisticsSnapshot(): Promise<StatisticsSnapshot> {
  const [
    totalBooks,
    totalAuthors,
    totalSeries,
    totalEditions,
    totalQuotes,
    booksWithCover,
    booksWithDescription,
    booksWithIsbn,
    booksInSeries,
    standaloneBooks,
    trackedBookLanguages,
    digitalEditions,
    hardcoverEditions,
    paperbackEditions,
    editionsWithFiles,
    publicQuotes,
    privateQuotes,
  ] = await Promise.all([
    countAllBooks(),
    countAllAuthors(),
    countAllSeries(),
    countAllEditions(),
    countAllQuotes(),
    countBooksWithCover(),
    countBooksWithDescription(),
    countBooksWithIsbn(),
    countBooksInSeries(),
    countStandaloneBooks(),
    countTrackedBookLanguages(),
    countDigitalEditions(),
    countHardcoverEditions(),
    countPaperbackEditions(),
    countEditionsWithFiles(),
    countPublicQuotes(),
    countPrivateQuotes(),
  ]);

  return {
    totals: {
      books: totalBooks,
      authors: totalAuthors,
      series: totalSeries,
      editions: totalEditions,
      quotes: totalQuotes,
    },
    books: {
      withCover: booksWithCover,
      withDescription: booksWithDescription,
      withIsbn: booksWithIsbn,
      inSeries: booksInSeries,
      standalone: standaloneBooks,
      languagesTracked: trackedBookLanguages,
    },
    editions: {
      digital: digitalEditions,
      hardcover: hardcoverEditions,
      paperback: paperbackEditions,
      withFile: editionsWithFiles,
    },
    quotes: {
      public: publicQuotes,
      private: privateQuotes,
    },
  };
}
