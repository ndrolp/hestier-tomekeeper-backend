import { asc, eq, ilike, inArray } from 'drizzle-orm';
import { db } from '../../config/database';
import { authors, booksToAuthors } from '../../db/author.schema';
import { books } from '../../db/books.schema';
import { series } from '../../db/series.schema';
import type { AuthorListItem } from './authors.types';

async function buildAuthorItems(rows: { id: number; name: string }[]) {
  if (rows.length === 0) {
    return [];
  }

  const authorIds = rows.map((author) => author.id);
  const relatedBooks = await db
    .select({
      authorId: booksToAuthors.authorId,
      id: books.id,
      title: books.title,
      coverUrl: books.coverUrl,
      seriesName: series.name,
      seriesOrder: books.seriesOrder,
    })
    .from(booksToAuthors)
    .innerJoin(books, eq(booksToAuthors.bookId, books.id))
    .leftJoin(series, eq(books.seriesId, series.id))
    .where(inArray(booksToAuthors.authorId, authorIds))
    .orderBy(asc(books.title));

  const booksByAuthor = new Map<number, AuthorListItem['books']>();

  for (const relatedBook of relatedBooks) {
    const items = booksByAuthor.get(relatedBook.authorId) ?? [];
    items.push({
      id: relatedBook.id,
      title: relatedBook.title,
      coverUrl: relatedBook.coverUrl,
      seriesName: relatedBook.seriesName ?? null,
      seriesOrder: relatedBook.seriesOrder,
    });
    booksByAuthor.set(relatedBook.authorId, items);
  }

  return rows.map((author) => {
    const authorBooks = booksByAuthor.get(author.id) ?? [];
    return {
      id: author.id,
      name: author.name,
      bookCount: authorBooks.length,
      books: authorBooks,
    };
  });
}

export async function listAuthors(query = ''): Promise<AuthorListItem[]> {
  const normalizedQuery = query.trim();
  const rows =
    normalizedQuery.length > 0
      ? await db
          .select({ id: authors.id, name: authors.name })
          .from(authors)
          .where(ilike(authors.name, `%${normalizedQuery}%`))
          .orderBy(asc(authors.name))
      : await db
          .select({ id: authors.id, name: authors.name })
          .from(authors)
          .orderBy(asc(authors.name));

  return buildAuthorItems(rows);
}

export async function getAuthorById(
  id: number,
): Promise<AuthorListItem | null> {
  const rows = await db
    .select({ id: authors.id, name: authors.name })
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);

  const items = await buildAuthorItems(rows);
  return items[0] ?? null;
}
