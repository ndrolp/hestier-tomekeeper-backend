# Dependency Reference

## Production dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP framework |
| `deco-express` | Decorator-based routing (`@Controller`, `@Route`, `@Validate`) |
| `reflect-metadata` | Required for TypeScript decorators to function |
| `drizzle-orm` | Type-safe ORM for PostgreSQL |
| `pg` | PostgreSQL client (node-postgres) |
| `jsonwebtoken` | JWT verification |
| `jwks-rsa` | Fetches and caches RSA public keys from a JWKS endpoint |
| `joi` | Request body validation |
| `multer` | Multipart form / file upload handling |
| `cors` | CORS headers middleware |
| `morgan` | HTTP request logger |
| `epub2` | EPUB file parser (metadata and cover extraction) |

## Development dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `ts-node` | Run TypeScript directly (used by nodemon) |
| `nodemon` | File watcher for dev server restarts |
| `tsx` | Fast TypeScript execution |
| `drizzle-kit` | DB schema management CLI and Drizzle Studio |
| `dotenv` | `.env` file loader |
| `eslint` + plugins | Linting |
| `prettier` | Code formatting |
| `husky` | Git hooks |
| `lint-staged` | Run linters on staged files only |
| `@commitlint/cli` + `config-conventional` | Conventional commit message enforcement |
