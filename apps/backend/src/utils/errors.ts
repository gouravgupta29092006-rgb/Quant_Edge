// ─────────────────────────────────────────────────────────────
// Application Error Classes
// Per IMPLEMENTATION.md §2.4 and TECH_SPEC.md §15
// ─────────────────────────────────────────────────────────────

export interface ErrorDetail {
  field?: string;
  message: string;
  value?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: ErrorDetail[],
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace, excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — Validation errors (Zod schema failures)
export class ValidationError extends AppError {
  constructor(details: ErrorDetail[]) {
    super('VALIDATION_ERROR', 'Request validation failed', 400, details);
  }
}

// 401 — Authentication required or token invalid
export class UnauthorizedError extends AppError {
  constructor(
    code: string = 'UNAUTHORIZED',
    message: string = 'Authentication required'
  ) {
    super(code, message, 401);
  }
}

// 403 — Valid auth but insufficient permissions
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

// 404 — Resource not found
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

// 409 — Conflict (duplicate resource)
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super('ALREADY_EXISTS', message, 409);
  }
}

// 422 — Business logic failure (insufficient funds, etc.)
export class UnprocessableError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 422);
  }
}

// 429 — Rate limit exceeded
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

// 502 — External API failure
export class ExternalApiError extends AppError {
  constructor(provider: string, message: string) {
    super('EXTERNAL_API_ERROR', `${provider}: ${message}`, 502);
  }
}

// 503 — Circuit breaker open / service unavailable
export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super('SERVICE_UNAVAILABLE', `${service} is temporarily unavailable`, 503);
  }
}

// Specific domain errors
export class InsufficientCashError extends UnprocessableError {
  constructor(required: number, available: number) {
    super(
      'INSUFFICIENT_CASH',
      `Insufficient cash. Required: $${required.toFixed(2)}, Available: $${available.toFixed(2)}`
    );
  }
}

export class InsufficientSharesError extends UnprocessableError {
  constructor(symbol: string, requested: number, available: number) {
    super(
      'INSUFFICIENT_SHARES',
      `Insufficient shares of ${symbol}. Requested: ${requested}, Available: ${available}`
    );
  }
}

export class PortfolioLimitError extends UnprocessableError {
  constructor() {
    super('PORTFOLIO_LIMIT', 'Maximum of 5 portfolios allowed per user');
  }
}

export class AccountLockedError extends UnauthorizedError {
  constructor(lockedUntil: Date) {
    super(
      'ACCOUNT_LOCKED',
      `Account temporarily locked after too many failed attempts. Try again after ${lockedUntil.toISOString()}`
    );
  }
}

export class EmailNotVerifiedError extends ForbiddenError {
  constructor() {
    super('Email address not verified. Please check your inbox.');
  }
}

export class AccountSuspendedError extends ForbiddenError {
  constructor() {
    super('Account has been suspended. Contact support.');
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(type: string = 'token') {
    super('INVALID_TOKEN', `Invalid or expired ${type}`);
  }
}

export class AiQuotaExceededError extends RateLimitError {
  constructor(type: 'hourly' | 'daily') {
    super(
      type === 'hourly'
        ? 'AI usage limit reached (20 calls/hour). Please wait before making another request.'
        : 'Daily AI usage limit reached (100 calls/day). Quota resets at midnight UTC.'
    );
  }
}

// ─── Type guard ───────────────────────────────────────────────
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
