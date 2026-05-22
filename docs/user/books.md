# Books

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/books` | List books (paginated, searchable) |
| `GET` | `/api/v1/books/:id` | Get a single book |
| `POST` | `/api/v1/books` | Create a book |
| `POST` | `/api/v1/books/import` | Import a book (resolves series by name, downloads cover) |
| `PATCH` | `/api/v1/books/:id` | Update a book |
| `DELETE` | `/api/v1/books/:id` | Delete a book |

---

## List books

```
GET /api/v1/books
```

Returns a paginated list of books in your library.

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | `""` | Filter by title, original title, or series name |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Results per page |
| `orderBy` | string | `"title"` | Sort field (any book column, or `"seriesName"`) |

**Example request:**
```
GET /api/v1/books?query=dune&page=1&limit=5
```

**Example response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dune",
      "authors": ["Frank Herbert"],
      "originalTitle": null,
      "seriesId": 1,
      "seriesOrder": 1,
      "seriesName": "Dune Chronicles",
      "coverUrl": "http://localhost:3001/covers/abc123.jpg",
      "description": "A science fiction epic set on the desert planet Arrakis.",
      "publisher": "Chilton Books",
      "publishedDate": "1965",
      "language": "en",
      "isbn": "9780441013593"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 5
}
```

---

## Get a single book

```
GET /api/v1/books/:id
```

Returns a single book by its numeric ID.

---

## Create a book

```
POST /api/v1/books
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Book title |
| `authorNames` | string[] | No | List of author names |
| `originalTitle` | string | No | Title in the original language |
| `seriesId` | number | No | Existing series ID |
| `seriesOrder` | number | No | Position within the series |
| `coverUrl` | string (URL) | No | Cover image URL |
| `description` | string | No | Book description/synopsis |
| `edition` | object | No | First edition to create alongside the book (see [Editions](./editions.md)) |

**Example:**
```json
{
  "title": "Dune",
  "authorNames": ["Frank Herbert"],
  "seriesId": 1,
  "seriesOrder": 1,
  "description": "A science fiction epic set on the desert planet Arrakis."
}
```

**Response:** `201 Created` with the created book object.

---

## Import a book

```
POST /api/v1/books/import
Content-Type: application/json
```

Similar to creating a book, but with two conveniences:

- Provide `seriesName` (a string) instead of `seriesId`. The series is looked up by name, or created automatically if it does not exist.
- If `coverUrl` points to a remote image, it is downloaded and re-hosted locally.

**Additional field:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seriesName` | string | No | Series name (alternative to `seriesId`) |

This endpoint is designed to be used together with [Google Books Search](./google-books.md): search for a book, take the result, and pass it directly to import.

---

## Update a book

```
PATCH /api/v1/books/:id
Content-Type: application/json
```

All fields are optional. Only the fields you include will be updated.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | New title |
| `originalTitle` | string \| null | Original language title (null to clear) |
| `seriesId` | number \| null | Series ID (null to remove from series) |
| `seriesName` | string | Series name (alternative to `seriesId`; creates series if new) |
| `seriesOrder` | number \| null | Order in series |
| `coverUrl` | string \| null | Cover image URL |
| `description` | string \| null | Description |
| `authorNames` | string[] | Replaces **all** existing authors |

---

## Delete a book

```
DELETE /api/v1/books/:id
```

Permanently deletes the book along with all its editions and author associations. **This action cannot be undone.**

**Response:** `204 No Content`
