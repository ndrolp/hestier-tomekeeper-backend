import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env';
import { editionsToBooks } from '../db/edition.schema';
import { booksToSeries } from '../db/books.schema';

export const db = drizzle(env.DB_URL, {
  relations: { ...booksToSeries, ...editionsToBooks },
});
