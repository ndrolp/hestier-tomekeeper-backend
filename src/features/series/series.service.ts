import { asc, eq, ilike, inArray } from 'drizzle-orm';
import { db } from '../../config/database';
import { books } from '../../db/books.schema';
import { series } from '../../db/series.schema';
import type { SeriesListItem } from './series.types';

async function buildSeriesItems(
  rows: { id: number; name: string; description: string | null }[],
) {
  if (rows.length === 0) {
    return [];
  }

  const seriesIds = rows.map((item) => item.id);
  const relatedBooks = await db
    .select({
      seriesId: books.seriesId,
      id: books.id,
      title: books.title,
      coverUrl: books.coverUrl,
      seriesOrder: books.seriesOrder,
    })
    .from(books)
    .where(inArray(books.seriesId, seriesIds))
    .orderBy(asc(books.seriesOrder), asc(books.title));

  const booksBySeries = new Map<number, SeriesListItem['books']>();

  for (const relatedBook of relatedBooks) {
    if (relatedBook.seriesId === null) {
      continue;
    }

    const items = booksBySeries.get(relatedBook.seriesId) ?? [];
    items.push({
      id: relatedBook.id,
      title: relatedBook.title,
      coverUrl: relatedBook.coverUrl,
      seriesOrder: relatedBook.seriesOrder,
    });
    booksBySeries.set(relatedBook.seriesId, items);
  }

  return rows.map((item) => {
    const seriesBooks = booksBySeries.get(item.id) ?? [];
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      bookCount: seriesBooks.length,
      books: seriesBooks,
    };
  });
}

export async function listSeries(query = ''): Promise<SeriesListItem[]> {
  const normalizedQuery = query.trim();
  const rows =
    normalizedQuery.length > 0
      ? await db
          .select({
            id: series.id,
            name: series.name,
            description: series.description,
          })
          .from(series)
          .where(ilike(series.name, `%${normalizedQuery}%`))
          .orderBy(asc(series.name))
      : await db
          .select({
            id: series.id,
            name: series.name,
            description: series.description,
          })
          .from(series)
          .orderBy(asc(series.name));

  return buildSeriesItems(rows);
}

export async function getSeriesById(
  id: number,
): Promise<SeriesListItem | null> {
  const rows = await db
    .select({
      id: series.id,
      name: series.name,
      description: series.description,
    })
    .from(series)
    .where(eq(series.id, id))
    .limit(1);

  const items = await buildSeriesItems(rows);
  return items[0] ?? null;
}
