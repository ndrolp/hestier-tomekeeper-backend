import 'reflect-metadata';
import express from 'express';
import { defineRoutes } from 'deco-express';
import { HealthController } from './controllers/health.controller';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

defineRoutes([HealthController], app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
