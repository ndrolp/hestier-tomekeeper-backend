# Authentication Middleware

**File:** `src/middlewares/warden-auth.middleware.ts`

The middleware is registered on the `API_PREFIX` router and protects all `/api/v1/*` routes. It skips `OPTIONS` requests (CORS preflight) and the `/health` path.

## Flow

1. Extracts `Authorization: Bearer <token>` from the request header. Returns `401` with `error: "invalid_token"` if missing or malformed.
2. Reads the `kid` (key ID) from the JWT header and calls `jwksClient.getSigningKey(kid)` to fetch the RSA public key from `WARDEN_JWKS_URL`.
3. Verifies the token with `jsonwebtoken.verify` using RS256, validates the `iss` claim against `WARDEN_ISSUER`, and only accepts Warden access tokens.
4. Parses the payload into an `AuthenticatedUser` object and attaches it to `req.auth`.

## Refresh-aware failures

The middleware distinguishes expired access tokens from other token failures:

| Response | Meaning |
|---|---|
| `401 { error: "access_token_expired", message: "Access token expired" }` | The caller should refresh with Warden and retry |
| `401 { error: "invalid_token", message: "Missing or invalid access token" }` | No usable access token was supplied |
| `401 { error: "invalid_token", message: "Invalid access token" }` | Signature, issuer, or token-use validation failed |

## JWKS client configuration

```typescript
const jwksClient = jwks({
  jwksUri: WARDEN_JWKS_URL,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000,   // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});
```

## `req.auth` shape

```typescript
interface AuthenticatedUser {
  subject: string;             // raw "sub" claim
  userId: number;              // sub parsed as integer
  username: string | null;
  roles: string[];
  permissions: WardenPermission[];  // [{ clientId: number, name: string }]
  token: string;               // original raw JWT
}
```

## Using `req.auth` in controllers

Type the request parameter with the `AuthenticatedRequest` generic alias from `src/types/auth.ts`:

```typescript
import { AuthenticatedRequest } from '../../types/auth';

async myHandler(req: AuthenticatedRequest<Params, ResBody, ReqBody, Query>, res: Response) {
  const { userId } = req.auth;
  // ...
}
```

## Authorization

There is no fine-grained RBAC enforced at the route level. All authenticated users have the same access. `roles` and `permissions` are decoded and available on `req.auth` for future use.

The only implicit authorization logic is quote visibility: users only see their own private quotes.
