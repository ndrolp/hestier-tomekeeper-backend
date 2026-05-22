# Hestier Tomekeeper Backend

Express + TypeScript backend for the Tomekeeper library API.

## Authentication

The API expects **access-token Bearer JWTs issued by Hestier Warden** on every `/api/v1` route except `/health`.

When an access token expires, protected endpoints return `401` with `error: "access_token_expired"`. Clients should refresh against Warden and retry the request with the new access token.

Static assets under `/covers` and `/ebooks` remain public.

## EPUB reader support

Digital editions keep the existing download flow, and EPUB editions also support protected in-browser reading.

- `GET /api/v1/editions/:id/file` serves the ebook inline for authenticated readers.
- `GET /api/v1/editions/:id/progress` returns the current user's saved EPUB reading position.
- `PUT /api/v1/editions/:id/progress` stores the current user's reading locator and percentage.

Reading progress is stored per `(user_id, edition_id)` in the `edition_reading_progress` table.

## Environment

Copy `.env.example` to `.env` and adjust the values if needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Tomekeeper backend port | `3000` |
| `API_PREFIX` | API prefix | `/api/v1` |
| `WARDEN_ISSUER` | Expected JWT issuer from Warden | `warden` |
| `WARDEN_JWKS_URL` | Warden JWKS endpoint used to verify tokens | `http://localhost:3000/.well-known/jwks.json` |
| `DB_HOST` | PostgreSQL host | `127.0.0.1` |
| `DB_USER` | PostgreSQL user | `admin` |
| `DB_PASSWORD` | PostgreSQL password | `admin` |
| `DB_NAME` | PostgreSQL database name | `tomekeeper` |
| `DB_PORT` | PostgreSQL port | `5432` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the backend with nodemon |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run the built server |
| `npm run lint` | Run ESLint |

Run `npm run db:migrate` after pulling schema changes so the reader progress table exists in PostgreSQL.

## Request logs

Inbound HTTP requests are appended to `logs/requests.log`.
