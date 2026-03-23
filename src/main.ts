import 'reflect-metadata';
import express from 'express';
import { defineRoutes } from 'deco-express';
import { HealthController } from './controllers/health.controller';
import { env } from './config/env';
import { db } from './config/database';
import { book } from './db/books.schema';
import { series } from './db/series.schema';
import { edition } from './db/edition.schema';
import { configDotenv } from 'dotenv';
configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

defineRoutes([HealthController], app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (env.NODE_ENV === 'development') {
    seedDatabase();
  }
});

const seedDatabase = async () => {
  const newSeries = await db
    .insert(series)
    .values({
      name: 'The Lord of the Rings',
    })
    .returning();

  const newBook = await db
    .insert(book)
    .values({
      title: 'The Fellowship of the Ring',
      author: 'J.R.R. Tolkien',
      seriesId: newSeries[0]?.id ?? 1,
      seriesOrder: 1,
    })
    .returning();

  await db.insert(edition).values({
    name: 'First Edition',
    bookId: newBook[0]?.id ?? 1,
    format: 'Hardcover',
    isbn: '978-0547928210',
  });
};
