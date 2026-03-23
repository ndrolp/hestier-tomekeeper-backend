import { defineRelations } from 'drizzle-orm';
import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { book } from './books.schema';

export const series = pgTable('series', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const seriesBook = defineRelations(
  {
    book,
    series,
  },
  (r) => ({
    book: {
      series: r.one.series({
        from: r.book.seriesId,
        to: r.series.id,
      }),
    },
    series: {
      books: r.many.book(),
    },
  }),
);
