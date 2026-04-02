import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const series = pgTable('series', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});
