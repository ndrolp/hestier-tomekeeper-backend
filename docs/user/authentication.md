# Authentication

All `/api/v1/*` endpoints require a valid **access token** issued by Hestier Warden.

Include it in the `Authorization` header of every protected request:

```
Authorization: Bearer <your_access_token>
```

When the access token expires, the API responds with:

```json
{
  "error": "access_token_expired",
  "message": "Access token expired"
}
```

Refresh the session through Hestier Warden, then retry the request with the new access token.

If the token is missing or invalid, the server responds with `401 Unauthorized` and `error: "invalid_token"`.

The `/health` endpoint is public and does not require authentication.
