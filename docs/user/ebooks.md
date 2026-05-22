# Ebook Files

You can attach an ebook file to any edition, download it later, and read EPUB editions in the browser.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/editions/:id/upload` | Upload an ebook file |
| `GET` | `/api/v1/editions/:id/download` | Download the ebook file |
| `GET` | `/api/v1/editions/:id/file` | Stream the ebook file inline for authenticated reading |
| `GET` | `/api/v1/editions/:id/progress` | Get the authenticated user's saved reading progress |
| `PUT` | `/api/v1/editions/:id/progress` | Save the authenticated user's reading progress |

---

## Upload an ebook

```
POST /api/v1/editions/:id/upload
Content-Type: multipart/form-data
```

- Form field name: `file`
- Accepted formats: `.epub`, `.pdf`, `.mobi`, `.azw3`, `.cbz`, `.cbr`
- Maximum file size: **100 MB**

**Example (curl):**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/book.epub" \
  http://localhost:3001/api/v1/editions/5/upload
```

**Response:** `200 OK` with the updated edition object. The `filePath` field contains a URL to download the file.

---

## Download an ebook

```
GET /api/v1/editions/:id/download
```

Returns the ebook file as a download attachment. The response includes `Content-Disposition: attachment`, which causes browsers and HTTP clients to prompt a file save.

---

## Read an EPUB in the browser

```
GET /api/v1/editions/:id/file
Authorization: Bearer <access-token>
```

Returns the ebook file with inline-friendly headers so the frontend reader can open it in place. This endpoint is intended for authenticated browser reading and does not replace the download endpoint.

Only EPUB editions are currently rendered in-browser by the frontend. Other formats should continue using the download endpoint.

---

## Get reading progress

```
GET /api/v1/editions/:id/progress
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "editionId": 5,
  "userId": 12,
  "locator": "epubcfi(/6/14!/4/2/8)",
  "progressPercentage": 37,
  "updatedAt": "2026-05-22T09:05:00.000Z"
}
```

If the user has not started this edition yet, the response is `200 OK` with `null`.

---

## Save reading progress

```
PUT /api/v1/editions/:id/progress
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "locator": "epubcfi(/6/14!/4/2/8)",
  "progressPercentage": 37
}
```

- `locator` is required.
- `progressPercentage` is optional, but when provided it must be an integer from `0` to `100`.

**Response:** `200 OK` with the saved reading progress object.
