# Architecture Overview

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + TypeScript |
| HTTP Framework | Express (v5) |
| Routing / Decorators | `deco-express` |
| ORM | Drizzle ORM (PostgreSQL) |
| Database | PostgreSQL |
| Validation | Joi |
| Authentication | Warden access-token JWT verification (RS256) via `jsonwebtoken` + `jwks-rsa` |
| File uploads | Multer |
| EPUB parsing | `epub2` |
| Module system | CommonJS (`"type": "commonjs"`) |

## Project structure

```
hestier-tomekeeper-backend/
├── src/
│   ├── main.ts                     # App entry point
│   ├── config/
│   │   ├── env.ts                  # Typed environment variable exports
│   │   └── database.ts             # Drizzle ORM client instantiation
│   ├── controllers/
│   │   └── health.controller.ts    # Public /health endpoint
│   ├── db/                         # Drizzle schema definitions (one per entity)
│   │   ├── books.schema.ts
│   │   ├── author.schema.ts
│   │   ├── edition.schema.ts
│   │   ├── quotes.schema.ts
│   │   └── series.schema.ts
│   ├── features/                   # Feature modules
│   │   ├── books/
│   │   ├── editions/
│   │   ├── epub/
│   │   ├── google-books/
│   │   ├── covers/
│   │   ├── quotes/
│   │   └── statistics/
│   ├── middlewares/
│   │   └── warden-auth.middleware.ts
│   ├── types/
│   │   └── auth.ts                 # Shared auth types
│   └── utils/
│       └── firs.seed.ts            # Development seed data
├── drizzle.config.ts               # drizzle-kit configuration
├── makefile
├── package.json
└── tsconfig.json
```

### Feature module layout

Each module under `src/features/` follows a consistent four-file structure:

```
features/<name>/
├── <name>.controller.ts   # HTTP handlers (decorators, calls service)
├── <name>.service.ts      # Business logic (DB queries, transformations)
├── <name>.types.ts        # TypeScript interfaces
└── <name>.validators.ts   # Joi schemas for request body validation
```

## Application bootstrap

`src/main.ts` performs these steps in order:

1. Creates the Express app
2. Registers global middleware: `cors`, `express.json`, static file serving for `public/covers/` and `public/ebooks/`
3. Conditionally registers `morgan` logging (`NODE_ENV === 'development'`)
4. Applies `wardenAuthMiddleware` to the `API_PREFIX` router
5. Calls `defineRoutes(controllers, app, { prefix: API_PREFIX })` from `deco-express`
6. Starts listening on `PORT`

## Request lifecycle

```
HTTP request
  → cors
  → express.json (body parsing)
  → wardenAuthMiddleware (access-token verification → req.auth)
  → deco-express dispatches to controller method
  → @Validate decorator runs Joi schema (if present)
  → Controller calls service method
  → Service queries DB via Drizzle
  → Controller sends JSON response
```

## Decorator-based routing

Controllers are plain TypeScript classes using `deco-express` decorators:

```typescript
import { Controller, Route, Validate } from 'deco-express';

@Controller('/books')
export class BooksController {

  @Route('get', '/')
  async list(req: AuthenticatedRequest<...>, res: Response) {
    const result = await booksService.searchBooks(req.query, req.auth.userId);
    res.json(result);
  }

  @Route('post', '/')
  @Validate(CreateBookSchema)
  async create(req: AuthenticatedRequest<...>, res: Response) {
    const book = await booksService.createBook(req.body);
    res.status(201).json(book);
  }
}
```

Register all controllers in `main.ts`:

```typescript
defineRoutes([
  BooksController,
  EditionsController,
  EpubController,
  GoogleBooksController,
  QuotesController,
  StatisticsController,
], app, { prefix: API_PREFIX });
```
