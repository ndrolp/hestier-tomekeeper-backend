import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const book = pgTable('books', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  originalTitle: varchar({ length: 255 }),
  seriesId: integer(),
  seriesOrder: integer(),
  coverUrl: varchar({ length: 255 }),
});
