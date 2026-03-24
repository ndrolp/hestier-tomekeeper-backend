import { eq, ilike, or, count } from 'drizzle-orm';
import { db } from '../../config/database';
import { book } from '../../db/books.schema';
import { series } from '../../db/series.schema';
import {
  CreateBookInput,
  CreateBookResult,
  SearchBooksOrder,
  SearchBooksResult,
} from './books.types';

/**
 * Search for books based on a query string, with pagination and sorting options.
 * @param query - The search query to filter books by title, author, series name, or original title.
 * @param page - The page number for pagination (default is 1).
 * @param limit - The number of results per page (default is 10).
 * @param orderBy - The field to sort the results by (default is 'title').
 * @returns A promise that resolves to an array of matching books with series information.
 */
export async function searchBooks(
  query: string = '',
  page: number = 1,
  limit: number = 10,
  orderBy: SearchBooksOrder = 'title',
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
/**
 * Count the total number of books matching the search query.
 * @param query - The search query to filter books by title, author, series name, or original title.
 * @returns A promise that resolves to the total count of matching books.
 */
export async function countBooks(query: string = ''): Promise<number> {
  const result = await db
    .select({ count: count() })
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
    .limit(1);

  return result[0]?.count ?? 0;
}

/**
 * Get a book by its ID, including series information if available.
 * @param id - The ID of the book to retrieve.
 * @returns A promise that resolves to the book details or null if not found.
 */
export async function getBookById(
  id: number,
): Promise<SearchBooksResult | null> {
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
    .where(eq(book.id, id))
    .leftJoin(series, eq(book.seriesId, series.id))
    .limit(1);

  if (data.length === 0) return null;

  return data[0];
}

/**
 * Create a new book record in the database.
 * @param { CreateBookInput } input - An object containing the details of the book to create.
 * @returns A promise that resolves to the created book's details.
 */
export async function createBook({
  title,
  author,
  originalTitle,
  seriesId,
  seriesOrder,
  coverUrl,
}: CreateBookInput): Promise<CreateBookResult> {
  const data = await db
    .insert(book)
    .values({
      title: title,
      author: author,
      originalTitle: originalTitle ?? null,
      seriesId: seriesId ?? null,
      seriesOrder: seriesOrder ?? null,
      coverUrl: coverUrl ?? null,
    })
    .returning();

  if (data.length === 0) {
    throw new Error('Failed to create book');
  }

  return data[0];
}
