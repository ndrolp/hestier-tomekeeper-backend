import { defineRelationsPart } from 'drizzle-orm';
import { pgTable, integer, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { books } from './books.schema';

export const editionsFormatEnum = pgEnum('editionFormat', [
  'Digital',
  'Hardcover',
  'Paperback',
]);

export const editions = pgTable('editions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  bookId: integer()
    .references(() => books.id)
    .notNull(),
  publisher: varchar({ length: 255 }),
  publicationDate: varchar({ length: 255 }),
  isbn: varchar({ length: 255 }),
  format: editionsFormatEnum(),
  language: varchar({ length: 255 }),
  filePath: varchar({ length: 512 }),
});

export const editionsToBooks = defineRelationsPart(
  { books, editions },
  (r) => ({
    editions: {
      books: r.one.books({
        from: r.editions.bookId,
        to: r.books.id,
      }),
    },
    books: {
      editions: r.many.editions(),
    },
  }),
);
