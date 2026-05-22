# Adding a New Feature Module

Follow these steps to add a new feature (e.g. `shelves`).

## 1. Create the schema file

`src/db/shelves.schema.ts`:

```typescript
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const shelves = pgTable('shelves', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: integer('user_id').notNull(),
});
```

## 2. Register relations (if needed)

If your schema defines relations with `defineRelationsPart`, import and merge them in `src/config/database.ts` when the Drizzle client is created.

## 3. Push the schema

```bash
make db-push
```

## 4. Create the feature module

```
src/features/shelves/
├── shelves.controller.ts   # HTTP handlers
├── shelves.service.ts      # Business logic and DB queries
├── shelves.types.ts        # TypeScript interfaces
└── shelves.validators.ts   # Joi schemas
```

**Controller skeleton:**

```typescript
import { Controller, Route, Validate } from 'deco-express';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { shelvesService } from './shelves.service';
import { CreateShelfSchema } from './shelves.validators';

@Controller('/shelves')
export class ShelvesController {

  @Route('get', '/')
  async list(req: AuthenticatedRequest, res: Response) {
    const shelves = await shelvesService.listShelves(req.auth.userId);
    res.json(shelves);
  }

  @Route('post', '/')
  @Validate(CreateShelfSchema)
  async create(req: AuthenticatedRequest, res: Response) {
    const shelf = await shelvesService.createShelf(req.body, req.auth.userId);
    res.status(201).json(shelf);
  }
}
```

## 5. Wire the controller

In `src/main.ts`, add `ShelvesController` to the `defineRoutes` array:

```typescript
defineRoutes([
  BooksController,
  EditionsController,
  // ...
  ShelvesController,
], app, { prefix: API_PREFIX });
```
