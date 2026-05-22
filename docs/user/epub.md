# EPUB Metadata Extraction

Before adding a book manually, you can upload an `.epub` file to automatically extract its metadata.

## Endpoint

```
POST /api/v1/epub/info
Content-Type: multipart/form-data
```

- Form field name: `file`
- Only `.epub` files are supported
- The file is **not stored** — it is parsed in memory and immediately discarded

**Example (curl):**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/book.epub" \
  http://localhost:3001/api/v1/epub/info
```

**Example response:**
```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "language": "en",
  "publisher": "Chilton Books",
  "description": "A science fiction epic...",
  "isbn": "9780441013593",
  "date": "1965",
  "cover": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "series": "Dune Chronicles",
  "collection": null,
  "subject": ["Science Fiction"]
}
```

The `cover` field contains the cover image as a base64-encoded data URI. You can use the extracted data to pre-fill the fields when calling [Create a book](./books.md#create-a-book) or [Import a book](./books.md#import-a-book).
