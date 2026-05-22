# Google Books Search

Search the Google Books catalogue to find metadata you can use when adding books to your library.

## Endpoint

```
GET /api/v1/google-books/search
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | **Required.** Search query (title, author, ISBN, etc.) |
| `lang` | string | `"all"` | Language filter: `"en"`, `"es"`, or `"all"` |
| `limit` | number | `20` | Max results (maximum: `40`) |

**Example request:**
```
GET /api/v1/google-books/search?q=dune+frank+herbert&lang=en&limit=5
```

**Example response:**
```json
[
  {
    "googleId": "ydQiEAAAQBAJ",
    "title": "Dune",
    "authors": ["Frank Herbert"],
    "description": "A science fiction epic...",
    "publisher": "Chilton Books",
    "publishedDate": "1965",
    "language": "en",
    "coverUrl": "https://books.google.com/books/content?id=ydQiEAAAQBAJ&printsec=frontcover&img=1&zoom=2",
    "isbn": "9780441013593",
    "categories": ["Science Fiction"],
    "seriesTitle": "Dune Chronicles",
    "seriesBookNumber": "1"
  }
]
```

Use the results to populate the fields of [Import a book](./books.md#import-a-book).

> No Google API key is required. Requests are made to the public Google Books API.
