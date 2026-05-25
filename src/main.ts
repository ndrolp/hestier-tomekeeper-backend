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
import { EpubController } from './features/epub/epub.controller';
import { QuotesController } from './features/quotes/quotes.controller';
import { StatisticsController } from './features/statistics/statistics.controller';
import { AssetsController } from './features/assets/assets.controller';
import cors from 'cors';
//import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { wardenAuthMiddleware } from './middlewares/warden-auth.middleware';
configDotenv();

const app = express();

app.use(cors());
app.use(express.json());
//app.use(requestLoggerMiddleware);

// Serve static assets
app.use(
  '/covers',
  express.static(path.join(process.cwd(), 'public', 'covers')),
);
app.use(
  '/ebooks',
  express.static(path.join(process.cwd(), 'public', 'ebooks')),
);

app.use(env.API_PREFIX, wardenAuthMiddleware);

defineRoutes(
  [
    HealthController,
    BooksController,
    AssetsController,
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
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
