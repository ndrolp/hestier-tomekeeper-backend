# Local Setup

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- A running instance of **Hestier Warden** (or any compatible JWKS-issuing auth service)

## Steps

```bash
# 1. Install dependencies
npm install

# 2. Create and populate the environment file
cp .env.example .env
# Edit .env with your database credentials and Warden URL

# 3. Push the database schema
make db-push

# 4. Start the development server
npm run dev
```

The server starts on the port defined in `.env` (default `3001`).

## Environment variables

Defined and typed in `src/config/env.ts`. Missing variables emit a console warning at startup.

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `"development"` | Enables Morgan logging when `"development"` |
| `PORT` | `3001` | TCP port the server listens on |
| `API_PREFIX` | `"/api/v1"` | URL prefix for all API routes |
| `WARDEN_ISSUER` | `"warden"` | Expected `iss` claim in incoming access tokens |
| `WARDEN_JWKS_URL` | `"http://localhost:3000/.well-known/jwks.json"` | JWKS endpoint of the auth service |
| `DB_HOST` | `"localhost"` | PostgreSQL host |
| `DB_USER` | — | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DB_NAME` | — | PostgreSQL database name |
| `DB_PORT` | `5432` | PostgreSQL port |

A `DB_URL` connection string is assembled at load time from the `DB_*` variables and used by both Drizzle ORM and `drizzle-kit`.

The backend does not refresh tokens itself. It validates Warden-issued access tokens and reports `access_token_expired` so callers can refresh through Warden.
