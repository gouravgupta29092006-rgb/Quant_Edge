import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';
import type { Request } from 'express';
import logger from '../utils/logger';

// ─── Redis store for distributed rate limiting ─────────────────
function createRedisStore(prefix: string) {
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => (redis as any).call(...args),
    prefix: `rl:${prefix}:`,
  });
}

// ─── Standard rate limit response ──────────────────────────────
const rateLimitHandler = (req: Request, res: Response): void => {
  logger.warn(`Rate limit exceeded: ${req.ip} → ${req.path}`);
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
};

// ─── TIER 1: Global IP Rate Limit ──────────────────────────────
// 300 requests per 15 minutes per IP
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('global'),
  handler: rateLimitHandler,
  skip: (req: Request) => req.path === '/health',
});

// ─── TIER 2: Auth Route Limiter ────────────────────────────────
// 10 attempts per 15 minutes per IP (prevents brute force)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('auth'),
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

// ─── TIER 3: General API Limiter ──────────────────────────────
// 60 requests per minute per user
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('api'),
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? 'unknown',
});

// ─── TIER 4: AI Endpoint Limiter ──────────────────────────────
// 20 AI calls per hour per user
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('ai'),
  handler: (req: Request, res: Response) => {
    logger.warn(`AI rate limit exceeded for user: ${req.user?.id}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message:
          'AI usage limit reached (20 calls/hour). Please wait before making another request.',
      },
      timestamp: new Date().toISOString(),
    });
  },
  keyGenerator: (req: Request) => `ai:${req.user?.id ?? req.ip ?? 'unknown'}`,
});

// ─── TIER 5: Search Limiter ────────────────────────────────────
// 5 search requests per second per user (debounce enforcement)
export const searchRateLimit = rateLimit({
  windowMs: 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('search'),
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => `search:${req.user?.id ?? req.ip ?? 'unknown'}`,
});

// ─── TIER 6: Trade Rate Limiter ───────────────────────────────
// 1 trade per second (prevents spam/double-submit)
export const tradeRateLimit = rateLimit({
  windowMs: 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('trade'),
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => `trade:${req.user?.id ?? req.ip ?? 'unknown'}`,
});

// ─── Registration Limiter ─────────────────────────────────────
// 5 registrations per IP per hour
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('register'),
  handler: rateLimitHandler,
});

// ─── Password Reset Limiter ───────────────────────────────────
// 3 requests per email per hour
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('pwd-reset'),
  handler: rateLimitHandler,
  keyGenerator: (req: Request) =>
    `pwd:${(req.body as { email?: string }).email ?? req.ip ?? 'unknown'}`,
});

// Fix missing import
import type { Response } from 'express';
