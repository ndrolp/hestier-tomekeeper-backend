import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtHeader } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '../config/env';
import type { AuthenticatedUser, WardenJwtPayload } from '../types/auth';

type RequestWithAuth = Request & {
  auth?: AuthenticatedUser;
};

type GetPublicKeyCallback = (error: Error | null, signingKey?: string) => void;

const client = jwksClient({
  jwksUri: env.WARDEN_JWKS_URL,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function isPublicPath(pathname: string): boolean {
  return pathname === '/health' || pathname === '/health/';
}

function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null;

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

function getSigningKey(
  header: JwtHeader,
  callback: GetPublicKeyCallback,
): void {
  if (!header.kid) {
    callback(new Error('Token header is missing a key identifier'));
    return;
  }

  client
    .getSigningKey(header.kid)
    .then((key) => callback(null, key.getPublicKey()))
    .catch((error) => callback(error));
}

async function verifyToken(token: string): Promise<AuthenticatedUser> {
  const payload = await new Promise<WardenJwtPayload>((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        algorithms: ['RS256'],
        issuer: env.WARDEN_ISSUER,
      },
      (error, decoded) => {
        if (error) {
          reject(error);
          return;
        }

        if (!decoded || typeof decoded === 'string') {
          reject(new Error('Token payload is invalid'));
          return;
        }

        resolve(decoded as WardenJwtPayload);
      },
    );
  });

  if (!payload.sub) {
    throw new Error('Token subject is missing');
  }

  const userId = Number.parseInt(payload.sub, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Token subject is invalid');
  }

  return {
    subject: payload.sub,
    userId,
    username: payload.user_name ?? null,
    roles: payload.roles ?? [],
    permissions: payload.permissions ?? [],
    token,
  };
}

export async function wardenAuthMiddleware(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  if (req.method === 'OPTIONS' || isPublicPath(req.path)) {
    return next();
  }

  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    req.auth = await verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
