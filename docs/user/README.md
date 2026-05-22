# Hestier Tomekeeper — User Guide

Hestier Tomekeeper is a personal digital library management API. It lets you catalogue books, track multiple editions (including ebook files), record quotes, and search Google Books for metadata.

All API endpoints are available at:

```
http://<host>:<port>/api/v1
```

The default port is `3001`. Every request (except `/health`) must include a valid Bearer access token issued by the Hestier Warden authentication service. Expired tokens are reported with `error: "access_token_expired"` so clients can refresh and retry.

---

## Sections

- [Authentication](./authentication.md)
- [Books](./books.md)
- [Editions](./editions.md)
- [Ebook Files](./ebooks.md)
- [EPUB Metadata Extraction](./epub.md)
- [Quotes](./quotes.md)
- [Google Books Search](./google-books.md)
- [Library Statistics](./statistics.md)
- [Error Responses](./errors.md)
