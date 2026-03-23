import { defineRelationsPart } from 'drizzle-orm';
import { pgTable, integer, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { book } from './books.schema';

export const editionsFormatEnum = pgEnum('editionFormat', [
  'Digital',
  'Hardcover',
  'Paperback',
]);

export const edition = pgTable('editions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  bookId: integer()
    .references(() => book.id)
    .notNull(),
  publisher: varchar({ length: 255 }),
  publicationDate: varchar({ length: 255 }),
  isbn: varchar({ length: 255 }),
  format: editionsFormatEnum(),
});

export const editionsToBooks = defineRelationsPart({ book, edition }, (r) => ({
  edition: {
    book: r.one.book({
      from: r.edition.bookId,
      to: r.book.id,
    }),
  },
  book: {
    editions: r.many.edition(),
  },
}));
