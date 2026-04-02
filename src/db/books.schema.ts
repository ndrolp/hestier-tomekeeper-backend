import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { series } from './series.schema';
import { defineRelationsPart } from 'drizzle-orm';

export const books = pgTable('books', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  originalTitle: varchar({ length: 255 }),
  seriesId: integer().references(() => series.id),
  seriesOrder: integer(),
  coverUrl: varchar({ length: 255 }),
});

export const booksToSeries = defineRelationsPart({ books, series }, (r) => ({
  books: {
    series: r.one.series({
      from: r.books.seriesId,
      to: r.series.id,
    }),
  },
  series: {
    books: r.many.books(),
  },
}));
