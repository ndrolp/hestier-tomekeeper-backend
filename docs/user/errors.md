# Error Responses

| Status | Meaning |
|--------|---------|
| `400 Bad Request` | Invalid or missing fields in the request body |
| `401 Unauthorized` | Missing or invalid access token, or an expired token that must be refreshed through Warden |
| `404 Not Found` | The requested resource does not exist |
| `500 Internal Server Error` | An unexpected server error occurred |

All error responses include a JSON body with a `message` field describing the problem. Authentication failures also include an `error` code:

```json
{ "message": "title is required" }
```

```json
{ "error": "access_token_expired", "message": "Access token expired" }
```

---

## Health Check

A public endpoint to verify the service is running. No authentication required.

```
GET /health
```

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2026-05-17T12:00:00.000Z" }
```
