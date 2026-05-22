import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { editions } from './edition.schema';

export const editionReadingProgress = pgTable(
  'edition_reading_progress',
  {
    userId: integer('user_id').notNull(),
    editionId: integer('edition_id')
      .references(() => editions.id)
      .notNull(),
    locator: varchar({ length: 1024 }).notNull(),
    progressPercentage: integer('progress_percentage'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.editionId] })],
);
