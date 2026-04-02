import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { books } from './books.schema';
import { defineRelationsPart } from 'drizzle-orm';

export const authors = pgTable('authors', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const booksToAuthors = pgTable('books_to_authors', {
  bookId: integer()
    .references(() => books.id)
    .notNull(),
  authorId: integer()
    .references(() => authors.id)
    .notNull(),
});

export const autorsBooksRelation = defineRelationsPart(
  { authors, books, booksToAuthors },
  (r) => ({
    books: {
      authors: r.many.authors({
        from: r.books.id.through(r.booksToAuthors.bookId),
        to: r.authors.id.through(r.booksToAuthors.authorId),
      }),
    },
    authors: {
      books: r.many.books(),
    },
  }),
);
