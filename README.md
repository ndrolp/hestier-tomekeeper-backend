# Hestier Tomekeeper Backend

Express + TypeScript backend for the Tomekeeper library API.

## Authentication

The API now expects **JWT Bearer tokens issued by Hestier Warden** on every `/api/v1` route except `/health`.

Static assets under `/covers` and `/ebooks` remain public.

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
