# Scripts Reference

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server with hot reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled production build (`dist/main.js`) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run db:generate` | Generate Drizzle migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:studio` | Open Drizzle Studio (visual database browser) |

## Makefile targets

| Target | Description |
|--------|-------------|
| `make db-push` | Push schema directly to DB without generating migration files |
| `make env` | Copy `.env.example` to `.env` |
