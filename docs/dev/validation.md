# Request Validation

Validation uses **Joi** schemas defined in `<feature>.validators.ts` and applied via the `@Validate` decorator from `deco-express`. If validation fails, `deco-express` returns a `400 Bad Request` response before the handler is called.

## Defining a schema

```typescript
// src/features/books/books.validators.ts
import Joi from 'joi';

export const CreateBookSchema = Joi.object({
  title: Joi.string().required(),
  authorNames: Joi.array().items(Joi.string()),
  seriesId: Joi.number().integer(),
  seriesOrder: Joi.number().integer(),
  coverUrl: Joi.string().uri(),
  description: Joi.string(),
});

export const UpdateBookSchema = Joi.object({
  title: Joi.string(),
  originalTitle: Joi.string().allow(null),
  seriesId: Joi.number().integer().allow(null),
  seriesName: Joi.string(),
  seriesOrder: Joi.number().integer().allow(null),
  coverUrl: Joi.string().uri().allow(null),
  description: Joi.string().allow(null),
  authorNames: Joi.array().items(Joi.string()),
});
```

## Applying to a route

```typescript
@Route('post', '/')
@Validate(CreateBookSchema)
async create(req: AuthenticatedRequest, res: Response) {
  // req.body is already validated here
  const book = await booksService.createBook(req.body);
  res.status(201).json(book);
}
```

## Notes

- Use `.allow(null)` for fields that can be explicitly cleared.
- Use `.required()` only for fields the endpoint cannot function without.
- Partial update schemas (for `PATCH` routes) should have all fields optional.
