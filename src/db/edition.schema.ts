import { defineRelations } from 'drizzle-orm';
import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { book } from './books.schema';

export const edition = pgTable('editions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bookId: integer().notNull(),
  publisher: varchar({ length: 255 }),
  publicationDate: varchar({ length: 255 }),
  isbn: varchar({ length: 255 }),
});

export const editionBook = defineRelations({ book, edition }, (r) => ({
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
