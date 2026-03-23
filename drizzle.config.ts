import { defineConfig } from 'drizzle-kit';
import { configDotenv } from 'dotenv';

configDotenv();

export default defineConfig({
  out: './drizzle',
  schema: './src/db',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME}`,
  },
});
