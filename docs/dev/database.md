# Database

## ORM: Drizzle

All database access goes through Drizzle ORM. The client is instantiated in `src/config/database.ts` and exported as `db`:

```typescript
import { db } from '../../config/database';
```

## Schema files

Each entity has its own schema file under `src/db/`. Relations are defined using Drizzle's `defineRelationsPart` (beta API) and merged in `database.ts` at client creation time, enabling cross-module relational queries.

**Example — query a book with relations:**

```typescript
const book = await db.query.books.findFirst({
  where: eq(books.id, id),
  with: {
    authors: { with: { author: true } },
    series: true,
  },
});
```

## Schema management

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `make db-push` | Push schema directly (no migration files, good for local dev) |

Use `db:generate` + `db:migrate` for production schema changes (migration files are tracked in version control). Use `make db-push` during local development for quick iteration.

## Schema reference

### `series`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | PK, identity |
| `name` | `varchar(255)` | NOT NULL |
| `description` | `varchar(255)` | nullable |

### `books`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | PK, identity |
| `title` | `varchar(255)` | NOT NULL |
| `originalTitle` | `varchar(255)` | nullable |
| `seriesId` | `integer` | FK → `series.id`, nullable |
| `seriesOrder` | `integer` | nullable |
| `coverUrl` | `varchar(512)` | nullable |
| `description` | `text` | nullable |

### `authors`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | PK, identity |
| `name` | `varchar(255)` | NOT NULL, UNIQUE |

### `books_to_authors`

| Column | Type | Notes |
|--------|------|-------|
| `bookId` | `integer` | FK → `books.id`, NOT NULL |
| `authorId` | `integer` | FK → `authors.id`, NOT NULL |

### `editions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | PK, identity |
| `name` | `varchar(255)` | NOT NULL |
| `bookId` | `integer` | FK → `books.id`, NOT NULL |
| `publisher` | `varchar(255)` | nullable |
| `publicationDate` | `varchar(255)` | nullable |
| `isbn` | `varchar(255)` | nullable |
| `format` | `editionFormat` enum | `'Digital'` \| `'Hardcover'` \| `'Paperback'` |
| `language` | `varchar(255)` | nullable |
| `filePath` | `varchar(512)` | Full URL to the ebook file, nullable |

### `edition_reading_progress`

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | `integer` | Part of PK, Warden user id |
| `edition_id` | `integer` | Part of PK, FK → `editions.id` |
| `locator` | `varchar(1024)` | NOT NULL, EPUB CFI/current reading location |
| `progress_percentage` | `integer` | nullable, expected range `0-100` |
| `updated_at` | `timestamp` | NOT NULL, DEFAULT NOW() |

### `quotes`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | PK, identity |
| `text` | `varchar(255)` | NOT NULL |
| `storedBy` | `integer` | NOT NULL, DEFAULT `0` (0 = system/public) |
| `public` | `boolean` | NOT NULL, DEFAULT `true` |
| `bookId` | `integer` | FK → `books.id`, NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, DEFAULT NOW() |

## Entity relationships

```
series ──< books >──< books_to_authors >── authors
               └──< editions
                     └──< edition_reading_progress
               └──< quotes
```

## Cascade delete

There is no `ON DELETE CASCADE` at the database level. The `deleteBook` service function manually deletes editions and author links before deleting the book row. If you add new child relations to `books`, update `src/features/books/books.service.ts` → `deleteBook` accordingly.
