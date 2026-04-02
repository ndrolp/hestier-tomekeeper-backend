import { db } from '../config/database';
import { books } from '../db/books.schema';
import { series } from '../db/series.schema';
import { editions } from '../db/edition.schema';
import { authors, booksToAuthors } from '../db/author.schema';

export const seedDatabase = async () => {
  const newSeries = await db
    .insert(series)
    .values({
      name: 'The Lord of the Rings',
    })
    .returning();

  const newAuthor = await db
    .insert(authors)
    .values({
      name: 'J.R.R. Tolkien',
    })
    .returning();

  const newBook = await db
    .insert(books)
    .values({
      title: 'The Fellowship of the Ring',
      seriesId: newSeries[0]?.id ?? 1,
      seriesOrder: 1,
    })
    .returning();

  await db.insert(editions).values({
    name: 'First Edition',
    bookId: newBook[0]?.id ?? 1,
    format: 'Hardcover',
    isbn: '978-0547928210',
  });

  await db.insert(booksToAuthors).values({
    bookId: newBook[0]?.id ?? 1,
    authorId: newAuthor[0]?.id ?? 1,
  });
};
