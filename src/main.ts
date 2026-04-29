import 'reflect-metadata';
import path from 'path';
import express from 'express';
import { defineRoutes } from 'deco-express';
import { HealthController } from './controllers/health.controller';
import { env } from './config/env';
import { configDotenv } from 'dotenv';
import { BooksController } from './features/books/books.controller';
import { GoogleBooksController } from './features/google-books/google-books.controller';
import { EditionsController } from './features/editions/editions.controller';
import morgan from 'morgan';
import { EpubController } from './features/epub/epub.controller';
import cors from 'cors';
import { QuotesController } from './features/quotes/quotes.controller';
import { StatisticsController } from './features/statistics/statistics.controller';
configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets
app.use(
  '/covers',
  express.static(path.join(process.cwd(), 'public', 'covers')),
);
app.use(
  '/ebooks',
  express.static(path.join(process.cwd(), 'public', 'ebooks')),
);

if (env.NODE_ENV === 'development') app.use(morgan('combined'));

defineRoutes(
  [
    HealthController,
    BooksController,
    EditionsController,
    EpubController,
    GoogleBooksController,
    QuotesController,
    StatisticsController,
  ],
  app,
  true,
  1,
  env.NODE_ENV === 'development' ? true : false,
);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
