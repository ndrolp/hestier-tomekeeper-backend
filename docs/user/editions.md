# Editions

An edition represents a specific publication of a book — for example, the hardcover first edition, a paperback reprint, or a Kindle ebook.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/editions/book/:bookId` | List all editions for a book |
| `POST` | `/api/v1/editions` | Create an edition |
| `PATCH` | `/api/v1/editions/:id` | Update an edition |
| `DELETE` | `/api/v1/editions/:id` | Delete an edition |

For uploading, downloading, browser reading, and reading-progress endpoints attached to an edition, see [Ebook Files](./ebooks.md).

---

## List editions for a book

```
GET /api/v1/editions/book/:bookId
```

Returns all editions of the given book.

---

## Create an edition

```
POST /api/v1/editions
Content-Type: application/json
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookId` | number | Yes | The book this edition belongs to |
| `name` | string | Yes | Edition name (e.g. `"Kindle Edition"`, `"First Edition"`) |
| `publisher` | string | No | Publisher name |
| `publicationDate` | string | No | Publication date (free-form, e.g. `"1965"` or `"1965-08-01"`) |
| `isbn` | string | No | ISBN-10 or ISBN-13 |
| `format` | string | No | One of `"Digital"`, `"Hardcover"`, `"Paperback"` |
| `language` | string | No | Language code (e.g. `"en"`, `"es"`) |

**Example:**
```json
{
  "bookId": 1,
  "name": "First Edition",
  "publisher": "Chilton Books",
  "publicationDate": "1965",
  "isbn": "9780441013593",
  "format": "Hardcover",
  "language": "en"
}
```

**Response:** `201 Created` with the created edition:
```json
{
  "id": 5,
  "bookId": 1,
  "name": "First Edition",
  "publisher": "Chilton Books",
  "publicationDate": "1965",
  "isbn": "9780441013593",
  "format": "Hardcover",
  "language": "en",
  "filePath": null
}
```

---

## Update an edition

```
PATCH /api/v1/editions/:id
Content-Type: application/json
```

All fields are optional. Same fields as create (except `bookId`, which cannot be changed).

---

## Delete an edition

```
DELETE /api/v1/editions/:id
```

**Response:** `204 No Content`
