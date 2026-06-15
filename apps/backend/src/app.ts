import 'express-async-errors';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

// Middleware
import { globalRateLimit } from './middleware/rateLimiter';
import { sanitizeInputs } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import marketsRoutes from './routes/markets.routes';
import analyticsRoutes from './routes/analytics.routes';
import strategiesRoutes from './routes/strategies.routes';
import backtestsRoutes from './routes/backtests.routes';
import newsRoutes from './routes/news.routes';
import aiRoutes from './routes/ai.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';

import logger from './utils/logger';

const app: Application = express();

// ─── Trust proxy (for rate limiting behind load balancer) ───
app.set('trust proxy', 1);

// ─── Security Headers (Helmet) ────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', process.env.FRONTEND_URL ?? ''],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ─── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
  })
);

// ─── Compression ──────────────────────────────────────────────
app.use(compression());

// ─── Request ID ───────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// ─── HTTP Logging ─────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
    skip: (req) => req.path === '/health',
  })
);

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── HTTP Parameter Pollution Protection ──────────────────────
app.use(hpp());

// ─── NoSQL Injection Prevention ───────────────────────────────
app.use(mongoSanitize());

// ─── Global Rate Limit ────────────────────────────────────────
app.use(globalRateLimit);

// ─── Input Sanitization ───────────────────────────────────────
app.use(sanitizeInputs);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'quantedge-api',
      version: process.env.npm_package_version ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────
const apiPrefix = `/api/${process.env.API_VERSION ?? 'v1'}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/portfolios`, portfolioRoutes);
app.use(`${apiPrefix}/markets`, marketsRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/strategies`, strategiesRoutes);
app.use(`${apiPrefix}/backtests`, backtestsRoutes);
app.use(`${apiPrefix}/news`, newsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler (MUST be last) ──────────────────────
app.use(errorHandler);

export default app;
