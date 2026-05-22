# Quotes

Save memorable quotes from the books in your library.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/books/:id/quotes` | Add a quote to a book |
| `GET` | `/api/v1/books/:id/quotes` | List quotes for a specific book |
| `GET` | `/api/v1/quotes` | List all quotes across your library |

---

## Add a quote to a book

```
POST /api/v1/books/:id/quotes
Content-Type: application/json
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The quote text |
| `public` | boolean | No | Whether others can see this quote (default: `true`) |

**Example:**
```json
{
  "text": "The spice must flow.",
  "public": true
}
```

**Response:** `201 Created` with the created quote object.

---

## List quotes for a book

```
GET /api/v1/books/:id/quotes
```

Returns all quotes for the given book that are visible to you: your own quotes and any public quotes.

---

## List all your quotes

```
GET /api/v1/quotes
```

Returns all quotes visible to you across your entire library.

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page |

Each quote includes a nested `books` field with `{ id, title }` so you know which book it belongs to.
