import type { ParamsDictionary, Request } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import type { JwtPayload } from 'jsonwebtoken';

export interface WardenPermission {
  clientId: number;
  name: string;
}

export interface WardenJwtPayload extends JwtPayload {
  sub?: string;
  user_name?: string;
  roles?: string[];
  permissions?: WardenPermission[];
}

export interface AuthenticatedUser {
  subject: string;
  userId: number;
  username: string | null;
  roles: string[];
  permissions: WardenPermission[];
  token: string;
}

export type AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = Request<P, ResBody, ReqBody, ReqQuery> & {
  auth: AuthenticatedUser;
};
