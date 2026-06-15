import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

// ─── Authentication Middleware ────────────────────────────────
// Validates JWT access token from Authorization header
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('MISSING_TOKEN', 'Bearer token required');
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw new UnauthorizedError('INVALID_TOKEN', 'Invalid or expired access token');
  }
}

// ─── Optional Authentication ──────────────────────────────────
// Attaches user to req if token is present, but doesn't fail if absent
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}

// ─── Role-Based Authorization Middleware ──────────────────────
// Must be used AFTER authenticate()
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `This action requires one of the following roles: ${roles.join(', ')}`
      );
    }

    next();
  };
}

// ─── Convenience role checks ──────────────────────────────────
export const requireAdmin = authorize(UserRole.ADMIN);
export const requireModerator = authorize(UserRole.ADMIN, UserRole.MODERATOR);
