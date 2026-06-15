import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, isAppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string; value?: unknown }>;
  };
  timestamp: string;
  requestId?: string;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.requestId;
  const timestamp = new Date().toISOString();

  // ─── Handle AppError (Operational) ──────────────────────────
  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      logger.error(`[${requestId}] ${err.code}: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.warn(`[${requestId}] ${err.code}: ${err.message}`, {
        path: req.path,
        method: req.method,
      });
    }

    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp,
      requestId,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // ─── Handle Zod Validation Errors ───────────────────────────
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      value: e.code,
    }));

    const validationError = new ValidationError(details);

    logger.warn(`[${requestId}] Validation error`, { details, path: req.path });

    const response: ErrorResponse = {
      success: false,
      error: {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details,
      },
      timestamp,
      requestId,
    };

    res.status(400).json(response);
    return;
  }

  // ─── Handle Prisma Errors ────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const fields = (err.meta?.['target'] as string[]) ?? [];
      const response: ErrorResponse = {
        success: false,
        error: {
          code: 'ALREADY_EXISTS',
          message: `${fields.join(', ')} already exists`,
        },
        timestamp,
        requestId,
      };
      res.status(409).json(response);
      return;
    }

    if (err.code === 'P2025') {
      // Record not found
      const response: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
        timestamp,
        requestId,
      };
      res.status(404).json(response);
      return;
    }

    logger.error(`[${requestId}] Prisma error ${err.code}:`, err);
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred',
      },
      timestamp,
      requestId,
    };
    res.status(500).json(response);
    return;
  }

  // ─── Handle Unknown Errors (Programming Bugs) ────────────────
  const error = err instanceof Error ? err : new Error('An unexpected error occurred');

  logger.error(`[${requestId}] Unhandled error:`, {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
    },
    timestamp,
    requestId,
  };

  res.status(500).json(response);
}
