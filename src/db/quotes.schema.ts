import {
  pgTable,
  integer,
  varchar,
  boolean as pgBoolean,
} from 'drizzle-orm/pg-core';
import { books } from './books.schema';
import { defineRelationsPart } from 'drizzle-orm';

export const quotes = pgTable('quotes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  text: varchar({ length: 255 }).notNull(),
  storedBy: integer().notNull().default(0),
  public: pgBoolean().notNull().default(true),
  bookId: integer()
    .references(() => books.id)
    .notNull(),
});

export const quotesToBooks = defineRelationsPart({ books, quotes }, (r) => ({
  quotes: {
    books: r.one.books({
      from: r.quotes.bookId,
      to: r.books.id,
    }),
  },
  books: {
    quotes: r.many.quotes(),
  },
}));
