import 'reflect-metadata';
import path from 'path';
import express from 'express';
import { defineRoutes } from 'deco-express';
import { HealthController } from './controllers/health.controller';
import { env } from './config/env';
import { configDotenv } from 'dotenv';
import { BooksController } from './features/books/books.controller';
import { GoogleBooksController } from './features/google-books/google-books.controller';
import morgan from 'morgan';
import { EpubController } from './features/epub/epub.controller';
import cors from 'cors';
configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve downloaded cover images
app.use(
  '/covers',
  express.static(path.join(process.cwd(), 'public', 'covers')),
);

if (env.NODE_ENV === 'development') app.use(morgan('combined'));

defineRoutes(
  [HealthController, BooksController, EpubController, GoogleBooksController],
  app,
  true,
  1,
  env.NODE_ENV === 'development' ? true : false,
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (env.NODE_ENV === 'development') {
  }
});
