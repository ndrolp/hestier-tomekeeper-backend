import 'reflect-metadata';
import express from 'express';
import { defineRoutes } from 'deco-express';
import { HealthController } from './controllers/health.controller';
import { env } from './config/env';
import { configDotenv } from 'dotenv';
import { BooksController } from './features/books/books.controller';
import morgan from 'morgan';
configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

if (env.NODE_ENV === 'development') app.use(morgan('combined'));

defineRoutes(
  [HealthController, BooksController],
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
