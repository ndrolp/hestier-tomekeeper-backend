import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env';
import { seriesBook } from '../db/series.schema';
import { editionBook } from '../db/edition.schema';

export const db = drizzle(env.DB_URL, { relations: { ...seriesBook, ...editionBook } });
