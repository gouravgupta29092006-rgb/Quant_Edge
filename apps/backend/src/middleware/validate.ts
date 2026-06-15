import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

// ─── Request Validation Middleware Factory ────────────────────
// Creates a middleware that validates req.body against a Zod schema
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        value: e.code,
      }));
      throw new ValidationError(details);
    }

    req.body = result.data;
    next();
  };
}

// ─── Query Params Validation ──────────────────────────────────
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        value: e.code,
      }));
      throw new ValidationError(details);
    }

    // Cast to req.query
    req.query = result.data as typeof req.query;
    next();
  };
}

// ─── Route Params Validation ──────────────────────────────────
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        value: e.code,
      }));
      throw new ValidationError(details);
    }

    req.params = result.data as typeof req.params;
    next();
  };
}

// ─── Standard success response helper ─────────────────────────
export function successResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  const response: Record<string, unknown> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response['meta'] = meta;
  }

  res.status(statusCode).json(response);
}
