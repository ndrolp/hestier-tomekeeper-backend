import { eq, ilike, or, count } from 'drizzle-orm';
import { db } from '../../config/database';
import { books } from '../../db/books.schema';
import { authors, booksToAuthors } from '../../db/author.schema';
import { series } from '../../db/series.schema';
import { editions } from '../../db/edition.schema';
import {
  CreateBookInput,
  CreateBookResult,
  ImportBookInput,
  SearchBooksOrder,
  SearchBooksResult,
  UpdateBookInput,
} from './books.types';

export async function searchBooks(
  query: string = '',
  page: number = 1,
  limit: number = 10,
  orderBy: SearchBooksOrder = 'title',
): Promise<SearchBooksResult[]> {
  const offset = (page - 1) * limit;

  let data = await db
    .select({
      id: books.id,
      title: books.title,
      originalTitle: books.originalTitle,
      seriesId: books.seriesId,
      seriesOrder: books.seriesOrder,
      coverUrl: books.coverUrl,
      seriesName: series.name,
      description: books.description,
      publisher: books.publisher,
      publishedDate: books.publishedDate,
      language: books.language,
      isbn: books.isbn,
    })
    .from(books)
    .leftJoin(series, eq(books.seriesId, series.id))
    .where(
      or(
        ilike(books.title, `%${query}%`),
        ilike(series.name, `%${query}%`),
        ilike(books.originalTitle, `%${query}%`),
      ),
    )
    .orderBy(orderBy === 'seriesName' ? series.name : books[orderBy])
    .limit(limit)
    .offset(offset);

  data = await Promise.all(
    data.map(async (book) => ({
      ...book,
      authors: await getBookAuthors(book.id),
    })),
  );

  return data as SearchBooksResult[];
}

export async function countBooks(query: string = ''): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(books)
    .leftJoin(series, eq(books.seriesId, series.id))
    .where(
      or(
        ilike(books.title, `%${query}%`),
        ilike(series.name, `%${query}%`),
        ilike(books.originalTitle, `%${query}%`),
      ),
    )
    .limit(1);

  return result[0]?.count ?? 0;
}

export async function getBookById(
  id: number,
): Promise<SearchBooksResult | null> {
  let data = await db
    .select({
      id: books.id,
      title: books.title,
      originalTitle: books.originalTitle,
      seriesId: books.seriesId,
      seriesOrder: books.seriesOrder,
      coverUrl: books.coverUrl,
      seriesName: series.name,
      description: books.description,
      publisher: books.publisher,
      publishedDate: books.publishedDate,
      language: books.language,
      isbn: books.isbn,
    })
    .from(books)
    .where(eq(books.id, id))
    .leftJoin(series, eq(books.seriesId, series.id))
    .limit(1);

  if (data.length === 0) return null;

  data = await Promise.all(
    data.map(async (book) => ({
      ...book,
      authors: await getBookAuthors(book.id),
    })),
  );

  return data[0] as SearchBooksResult;
}

export async function createBook({
  title,
  originalTitle,
  seriesId,
  seriesOrder,
  coverUrl,
  description,
  publisher,
  publishedDate,
  language,
  isbn,
}: CreateBookInput): Promise<CreateBookResult> {
  const data = await db
    .insert(books)
    .values({
      title,
      originalTitle: originalTitle ?? null,
      seriesId: seriesId ?? null,
      seriesOrder: seriesOrder ?? null,
      coverUrl: coverUrl ?? null,
      description: description || null,
      publisher: publisher || null,
      publishedDate: publishedDate || null,
      language: language || null,
      isbn: isbn || null,
    })
    .returning();

  if (data.length === 0) throw new Error('Failed to create book');
  return data[0];
}

export async function getBookAuthors(id: number): Promise<string[]> {
  const data = await db.query.books.findFirst({
    where: { id },
    with: { authors: { columns: { name: true } } },
  });
  return data?.authors.map((a) => a.name) ?? [];
}

export async function upsertAuthor(name: string): Promise<number> {
  const existing = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.name, name))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const created = await db
    .insert(authors)
    .values({ name })
    .returning({ id: authors.id });
  return created[0].id;
}

export async function upsertSeries(name: string): Promise<number> {
  const existing = await db
    .select({ id: series.id })
    .from(series)
    .where(eq(series.name, name))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const created = await db
    .insert(series)
    .values({ name })
    .returning({ id: series.id });
  return created[0].id;
}

export async function linkAuthorsToBook(
  bookId: number,
  authorIds: number[],
): Promise<void> {
  if (authorIds.length === 0) return;
  await db
    .insert(booksToAuthors)
    .values(authorIds.map((authorId) => ({ bookId, authorId })));
}

export async function importBook(
  input: ImportBookInput,
): Promise<CreateBookResult> {
  const { authorNames, seriesName, ...bookData } = input;

  if (seriesName && !bookData.seriesId) {
    bookData.seriesId = await upsertSeries(seriesName);
  }

  const book = await createBook(bookData);

  if (authorNames && authorNames.length > 0) {
    const authorIds = await Promise.all(
      authorNames.map((name) => upsertAuthor(name)),
    );
    await linkAuthorsToBook(book.id, authorIds);
  }

  return book;
}

export async function updateBook(
  id: number,
  input: UpdateBookInput,
): Promise<SearchBooksResult | null> {
  const { authorNames, seriesName, ...fields } = input;

  // Resolve seriesName to seriesId
  if (seriesName !== undefined && fields.seriesId === undefined) {
    fields.seriesId = seriesName ? await upsertSeries(seriesName) : null;
  }

  const updates: Partial<typeof books.$inferInsert> = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.originalTitle !== undefined)
    updates.originalTitle = fields.originalTitle || null;
  if (fields.seriesId !== undefined) updates.seriesId = fields.seriesId;
  if (fields.seriesOrder !== undefined)
    updates.seriesOrder = fields.seriesOrder;
  if (fields.coverUrl !== undefined) updates.coverUrl = fields.coverUrl || null;
  if (fields.description !== undefined)
    updates.description = fields.description || null;
  if (fields.publisher !== undefined)
    updates.publisher = fields.publisher || null;
  if (fields.publishedDate !== undefined)
    updates.publishedDate = fields.publishedDate || null;
  if (fields.language !== undefined) updates.language = fields.language || null;
  if (fields.isbn !== undefined) updates.isbn = fields.isbn || null;

  if (Object.keys(updates).length > 0) {
    await db.update(books).set(updates).where(eq(books.id, id));
  }

  // Replace authors if provided
  if (authorNames !== undefined) {
    await db.delete(booksToAuthors).where(eq(booksToAuthors.bookId, id));
    if (authorNames.length > 0) {
      const authorIds = await Promise.all(
        authorNames.map((n) => upsertAuthor(n)),
      );
      await linkAuthorsToBook(id, authorIds);
    }
  }

  return getBookById(id);
}

export async function deleteBook(id: number): Promise<boolean> {
  // cascade: delete editions, author links, then book
  await db.delete(editions).where(eq(editions.bookId, id));
  await db.delete(booksToAuthors).where(eq(booksToAuthors.bookId, id));
  const rows = await db
    .delete(books)
    .where(eq(books.id, id))
    .returning({ id: books.id });
  return rows.length > 0;
}
