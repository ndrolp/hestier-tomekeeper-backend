# Code Quality and Git Conventions

## Linting and formatting

| Tool | Config file | Commands |
|------|-------------|---------|
| ESLint | `eslint.config.mjs` | `npm run lint` / `npm run lint:fix` |
| Prettier | `.prettierrc`, `.prettierignore` | `npm run format` / `npm run format:check` |

## Git hooks

[Husky](https://typicode.github.io/husky/) runs two checks on every commit:

- **lint-staged** — runs `eslint --fix` and `prettier --write` on all staged `.ts` files under `src/`
- **commitlint** — enforces [Conventional Commits](https://www.conventionalcommits.org/) format on the commit message

## Commit message format

```
<type>(<scope>): <subject>
```

**Allowed types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`, `ci`, `build`

**Examples:**
```
feat(books): add import endpoint
fix(editions): handle missing file on download
chore(deps): update drizzle-orm to 1.0.0-beta.22
docs(readme): update setup instructions
```

Commits that do not follow this format will be rejected by the pre-commit hook.
