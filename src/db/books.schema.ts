import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { series } from './series.schema';
import { defineRelationsPart } from 'drizzle-orm';

export const book = pgTable('books', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  author: varchar({ length: 255 }).notNull(),
  originalTitle: varchar({ length: 255 }),
  seriesId: integer().references(() => series.id),
  seriesOrder: integer(),
  coverUrl: varchar({ length: 255 }),
});

export const booksToSeries = defineRelationsPart({ book, series }, (r) => ({
  book: {
    series: r.one.series({
      from: r.book.seriesId,
      to: r.series.id,
    }),
  },
  series: {
    books: r.many.book(),
  },
}));
