import { eq, ilike, or } from 'drizzle-orm';
import { db } from '../../config/database';
import { book } from '../../db/books.schema';
import { series } from '../../db/series.schema';
import { SearchBooksResult } from './books.types';

export async function searchBooks(
  query: string = '',
  page: number = 1,
  limit: number = 10,
  orderBy: 'title' | 'author' | 'seriesName' = 'title',
): Promise<SearchBooksResult[]> {
  const offset = (page - 1) * limit;

  const data = await db
    .select({
      id: book.id,
      title: book.title,
      author: book.author,
      originalTitle: book.originalTitle,
      seriesId: book.seriesId,
      seriesOrder: book.seriesOrder,
      coverUrl: book.coverUrl,
      seriesName: series.name,
    })
    .from(book)
    .leftJoin(series, eq(book.seriesId, series.id))
    .where(
      or(
        ilike(book.title, `%${query}%`),
        ilike(book.author, `%${query}%`),
        ilike(series.name, `%${query}%`),
        ilike(book.originalTitle, `%${query}%`),
      ),
    )
    .orderBy(orderBy === 'seriesName' ? series.name : book[orderBy])
    .limit(limit)
    .offset(offset);

  return data;
}
