# QuantEdge — Technology Stack

> **Version:** 1.0.0 | **Status:** Approved | **Date:** June 2026
> **Decision Principle:** Choose boring technology at the core, innovative only at the edges.

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [Database & Storage](#4-database--storage)
5. [AI & ML Layer](#5-ai--ml-layer)
6. [Security Infrastructure](#6-security-infrastructure)
7. [Real-Time Communication](#7-real-time-communication)
8. [Background Jobs & Queuing](#8-background-jobs--queuing)
9. [DevOps & Infrastructure](#9-devops--infrastructure)
10. [External Data APIs](#10-external-data-apis)
11. [Testing Stack](#11-testing-stack)
12. [Monitoring & Observability](#12-monitoring--observability)
13. [Package Reference — Complete List](#13-package-reference--complete-list)
14. [Environment Variables](#14-environment-variables)
15. [Architecture Decision Records (ADRs)](#15-architecture-decision-records-adrs)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 System Architecture Pattern

```
                         ┌─────────────────────────────┐
                         │    CloudFront / CDN          │
                         │    (Static Assets + Edge)    │
                         └─────────────┬───────────────┘
                                       │
                         ┌─────────────▼───────────────┐
                         │    Next.js Frontend          │
                         │    (Vercel / EC2)            │
                         │    Port 3000                 │
                         └─────────────┬───────────────┘
                                       │ REST + WebSocket
                         ┌─────────────▼───────────────┐
                         │    Express.js API            │
                         │    (EC2 / ECS)               │
                         │    Port 8080                 │
                         └──────┬────────────┬─────────┘
                                │            │
              ┌─────────────────▼──┐    ┌───▼──────────────────┐
              │   PostgreSQL 16    │    │   Redis 7             │
              │   (RDS)            │    │   (ElastiCache)       │
              │   Primary data     │    │   Cache + Sessions    │
              │                    │    │   + Job Queue         │
              └────────────────────┘    └──────────────────────┘
                                │
              ┌─────────────────▼──────────────────────────────┐
              │   Background Worker (BullMQ)                   │
              │   - News fetching (every 15 min)               │
              │   - Price alerts checking (every 1 min)        │
              │   - AI Daily Brief (8am ET)                    │
              │   - Backtest jobs (on-demand)                  │
              └────────────────────────────────────────────────┘
```

### 1.2 Request Flow

```
User Browser
  → CloudFront (CDN cache hit → serve, miss → origin)
  → Next.js (SSR pages, static pages, API routes for BFF)
  → Express API (business logic, validated, rate-limited)
  → Redis (cache check — hit: return, miss: fetch)
  → PostgreSQL (query, persist) → Redis (write back)
  → Response chain back to browser
```

### 1.3 AI Request Flow

```
User → Next.js → Express /api/ai/* → Rate limit check
  → Context hash → Redis cache check
    Cache HIT → stream cached response
    Cache MISS → Claude API (streaming)
      → SSE stream to client
      → async: write to Redis (6h TTL)
      → increment user AI usage counter
```

---

## 2. FRONTEND STACK

### 2.1 Core Framework

| Package | Version | Purpose |
|---|---|---|
| **Next.js** | 14.x | React framework, SSR, SSG, routing, API routes |
| **React** | 18.x | UI rendering, Concurrent Mode, Suspense |
| **TypeScript** | 5.x | Full type safety across all frontend code |

**Why Next.js 14 (App Router):**
- Server Components reduce JS bundle size
- Built-in API routes (BFF pattern for secure data fetching)
- Built-in image optimization, code splitting
- React Server Components for static financial content (news, education)
- Streaming with Suspense for progressive loading

### 2.2 Styling

| Package | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 3.x | Utility-first CSS, all layout and spacing |
| **clsx** | 2.x | Conditional class merging |
| **tailwind-merge** | 2.x | Tailwind class conflict resolution |
| **tailwindcss-animate** | 1.x | Tailwind-integrated animation utilities |
| **class-variance-authority (cva)** | 0.7.x | Component variant system |

### 2.3 Component Library

| Package | Version | Purpose |
|---|---|---|
| **shadcn/ui** | Latest | Radix-based unstyled components (customized) |
| **Radix UI** | 1.x | Accessible primitives (via shadcn) |
| **Lucide React** | 0.383.x | Icon library — 1200+ consistent icons |

**shadcn/ui Components Used:**
```
Alert, AlertDialog, Avatar, Badge, Button, Calendar
Card, Checkbox, Command, Dialog, Drawer, DropdownMenu
Form, HoverCard, Input, Label, Menubar, NavigationMenu
Popover, Progress, RadioGroup, ScrollArea, Select
Separator, Sheet, Skeleton, Slider, Switch, Table
Tabs, Textarea, Toast, Toaster, Toggle, Tooltip
```

### 2.4 Data Fetching & State

| Package | Version | Purpose |
|---|---|---|
| **TanStack Query (React Query)** | 5.x | Server state, caching, background refetch |
| **Zustand** | 4.x | Minimal global client state (auth, UI prefs) |
| **Axios** | 1.x | HTTP client with interceptors |

**State Architecture:**
```
React Query →  All server-sourced data (portfolio, stocks, news)
Zustand     →  Auth state, sidebar state, theme, modal state
React State →  Local component state (form inputs, toggles)
```

### 2.5 Charts & Visualizations

| Package | Version | Purpose |
|---|---|---|
| **Lightweight Charts** | 4.x | TradingView chart library — stock prices |
| **Recharts** | 2.x | Portfolio analytics, donut charts, area charts |
| **d3** | 7.x | Correlation heatmap, custom visualizations |

### 2.6 Forms & Validation

| Package | Version | Purpose |
|---|---|---|
| **React Hook Form** | 7.x | Performant forms with minimal re-renders |
| **Zod** | 3.x | Schema validation (shared with backend) |
| **@hookform/resolvers** | 3.x | RHF + Zod integration |

### 2.7 Utilities (Frontend)

| Package | Version | Purpose |
|---|---|---|
| **date-fns** | 3.x | Date formatting, calculations, timezones |
| **numeral** | 2.x | Number formatting ($, %, commas) |
| **DOMPurify** | 3.x | Sanitize HTML in news content (XSS) |
| **next-themes** | 0.3.x | Theme management (dark mode) |
| **sonner** | 1.x | Toast notifications |
| **framer-motion** | 11.x | Complex animations (optional, lazy loaded) |

---

## 3. BACKEND STACK

### 3.1 Runtime & Framework

| Package | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x LTS | Runtime — long-term support |
| **Express.js** | 4.x | HTTP framework — battle-tested, minimal |
| **TypeScript** | 5.x | Full type safety |
| **tsx** | 4.x | TypeScript execution (dev) |
| **tsup** | 8.x | TypeScript bundler (production build) |

**Why Express over Fastify/Hapi:**
- Largest ecosystem of middleware
- Extremely well-documented
- Team familiarity for production debugging
- Adequate performance for this scale

### 3.2 Authentication

| Package | Version | Purpose |
|---|---|---|
| **jsonwebtoken** | 9.x | JWT sign and verify (RS256) |
| **bcrypt** | 5.x | Password hashing, cost factor 12 |
| **speakeasy** | 2.x | TOTP 2FA (RFC 6238) |
| **qrcode** | 1.x | QR code generation for 2FA setup |
| **crypto** (built-in) | — | Token generation, UUID, HMAC |

**JWT Configuration:**
```
Access Token:   RS256, 15-minute expiry, user claims
Refresh Token:  Opaque 64-byte hex, 30-day expiry, stored hashed in DB
2FA Token:      TOTP, 30-second window, speakeasy
Email Tokens:   Crypto random 32-byte hex, 24h expiry (registration)
Reset Tokens:   Crypto random 32-byte hex, 1h expiry (password reset)
```

### 3.3 Security Middleware

| Package | Version | Purpose |
|---|---|---|
| **helmet** | 7.x | Security headers (CSP, HSTS, X-Frame) |
| **cors** | 2.x | CORS configuration |
| **express-rate-limit** | 7.x | IP-based rate limiting |
| **rate-limit-redis** | 4.x | Redis-backed rate limiting (distributed) |
| **express-validator** | 7.x | Input validation middleware |
| **hpp** | 0.2.x | HTTP Parameter Pollution protection |
| **express-mongo-sanitize** | 2.x | NoSQL injection prevention (req.body clean) |

### 3.4 Validation

| Package | Version | Purpose |
|---|---|---|
| **Zod** | 3.x | Schema validation — all API inputs |

**Validation Pattern (all routes):**
```typescript
// Every route MUST use this pattern:
router.post('/trade', 
  validateRequest(tradeSchema),  // Zod schema → 400 on failure
  authenticate,                  // JWT verify → 401 on failure
  authorize('user'),             // RBAC → 403 on failure
  rateLimit(tradeRateLimiter),   // Rate check → 429 on failure
  tradeController.execute        // Business logic
);
```

### 3.5 ORM & Database

| Package | Version | Purpose |
|---|---|---|
| **Prisma** | 5.x | ORM, migrations, schema management |
| **@prisma/client** | 5.x | Type-safe database client |
| **pg** | 8.x | PostgreSQL driver (used by Prisma) |

### 3.6 Caching

| Package | Version | Purpose |
|---|---|---|
| **ioredis** | 5.x | Redis client — production-grade |
| **redis** (alt) | 4.x | Official Redis client (backup) |

### 3.7 Job Queue

| Package | Version | Purpose |
|---|---|---|
| **BullMQ** | 4.x | Redis-backed job queue |
| **@bull-board/express** | 5.x | Admin dashboard for queues |

### 3.8 Real-Time

| Package | Version | Purpose |
|---|---|---|
| **Socket.io** | 4.x | WebSocket server (price updates, notifications) |
| **@socket.io/redis-adapter** | 8.x | Multi-instance Socket.io coordination |

### 3.9 Email

| Package | Version | Purpose |
|---|---|---|
| **@resend/node** | 3.x | Transactional email (verification, alerts) |
| **react-email** | 2.x | Email template rendering |

### 3.10 Backend Utilities

| Package | Version | Purpose |
|---|---|---|
| **winston** | 3.x | Structured logging |
| **winston-daily-rotate-file** | 4.x | Log rotation |
| **morgan** | 1.x | HTTP request logging |
| **node-cron** | 3.x | Cron scheduling (backup to BullMQ) |
| **compression** | 1.x | Gzip response compression |
| **express-async-errors** | 3.x | Async error handler |
| **joi** (removed, Zod used) | — | Replaced by Zod |
| **pino** (alternative logger) | 8.x | High-performance logging |

---

## 4. DATABASE & STORAGE

### 4.1 Primary Database

**PostgreSQL 16** (AWS RDS, db.t3.medium for MVP)

**Why PostgreSQL:**
- ACID compliance — financial data requires strong consistency
- Advanced indexing (B-tree, partial, composite)
- JSONB for flexible AI-generated content storage
- Window functions for time-series analytics queries
- pg_trgm for fast full-text stock search
- Row-level security available if multi-tenant needed

**Connection:**
```
Development:   Local Docker PostgreSQL 16
Staging:       RDS db.t3.micro (1 vCPU, 1GB RAM)
Production:    RDS db.t3.medium (2 vCPU, 4GB RAM) + Read Replica
Pool:          Prisma connection pool, max 10 connections
```

### 4.2 Cache Layer

**Redis 7** (AWS ElastiCache, cache.t3.micro)

**Cache Architecture:**
```
Namespace    TTL      Content
──────────── ──────── ──────────────────────────────────────
price:*      15s      Stock price quotes
quote:*      60s      Extended stock quote with stats
news:all     15m      All market news aggregation
news:{sym}   15m      Symbol-specific news articles
ai:{hash}    6h       AI response cache by context hash
brief:daily  12h      Daily AI market brief
candles:*    1h       Historical OHLCV data (varies by range)
earnings     4h       Upcoming earnings calendar
economic     4h       Economic calendar events
user:{id}    5m       User profile + preferences
sessions:*   30d      Refresh token store
queue:*      —        BullMQ job queue data
alerts:*     —        Price alert subscriptions
```

### 4.3 File Storage

**AWS S3:**
```
Bucket: quantedge-assets
  /avatars/{userId}.webp      — User profile pictures
  /exports/{userId}/*.pdf     — Exported analytics reports
  /exports/{userId}/*.csv     — Exported trade logs
  /backups/*.sql              — Daily DB backups (Glacier lifecycle after 30d)
```

### 4.4 Database Indexing Strategy

```sql
-- Performance-critical indexes (defined in schema)

-- Stock price lookup
CREATE INDEX idx_stock_prices_symbol_time ON stock_prices(symbol, timestamp DESC);

-- Portfolio holdings
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);

-- Transactions (ordered history)
CREATE INDEX idx_transactions_portfolio_id_created ON transactions(portfolio_id, created_at DESC);

-- News search and filtering
CREATE INDEX idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_symbols ON news_articles USING GIN(symbols);

-- User sessions
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Full text search on stocks
CREATE INDEX idx_stocks_fts ON stocks USING GIN(to_tsvector('english', name || ' ' || symbol));

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);

-- Backtests by user
CREATE INDEX idx_backtests_user_id ON backtests(user_id, created_at DESC);
```

---

## 5. AI & ML LAYER

### 5.1 AI Provider

**Anthropic Claude API** (claude-sonnet-4-6)

**Why Claude over OpenAI GPT-4:**
- More consistent financial analysis quality
- Better at following precise formatting instructions
- Native streaming SSE support
- Competitive pricing for token volume
- Strong safety defaults appropriate for financial education

### 5.2 AI Integration Package

```typescript
// @anthropic-ai/sdk — official SDK
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  // NEVER exposed to client
});
```

### 5.3 AI Models by Feature

| Feature | Model | Max Tokens | Temperature | Caching |
|---|---|---|---|---|
| Portfolio Analysis | claude-sonnet-4-6 | 2048 | 0.3 | 6h |
| Strategy Assistant | claude-sonnet-4-6 | 1024 | 0.5 | No |
| Market Research | claude-sonnet-4-6 | 1500 | 0.4 | 2h |
| Backtest Interpreter | claude-sonnet-4-6 | 1500 | 0.2 | No |
| Financial Tutor | claude-sonnet-4-6 | 2048 | 0.6 | No |
| Risk Analyzer | claude-sonnet-4-6 | 1024 | 0.1 | 6h |
| News Summarizer | claude-sonnet-4-6 | 512 | 0.2 | 24h |
| Daily Market Brief | claude-sonnet-4-6 | 1024 | 0.4 | 12h |
| AI Chat | claude-sonnet-4-6 | 1024 | 0.7 | No |

### 5.4 AI Rate Limiting & Cost Control

```typescript
// Per user limits
const AI_LIMITS = {
  perHour:  20,    // Max 20 AI calls per hour per user
  perDay:   100,   // Max 100 AI calls per day per user
  maxTokens: 2048, // Max tokens per response
};

// Global circuit breaker
const AI_GLOBAL = {
  dailyBudget: 50.00,  // USD — auto-pause if exceeded
  alertAt: 40.00,      // Admin email when 80% budget used
};
```

### 5.5 Response Caching (Anti-cost Pattern)

```typescript
// Context hash = SHA-256 of (userId context + request type + key data)
// Identical requests within TTL return cached response
const contextHash = createHash('sha256')
  .update(JSON.stringify({ type, userId, holdings, dateRange }))
  .digest('hex');

const cached = await redis.get(`ai:${contextHash}`);
if (cached) return streamCachedResponse(cached);
// else: call API, stream, then cache
```

---

## 6. SECURITY INFRASTRUCTURE

### 6.1 Rate Limiting Configuration

```typescript
// TIER 1 — Global (all routes)
globalRateLimit: { windowMs: 15 * 60 * 1000, max: 300 }  // 300 req / 15min per IP

// TIER 2 — Auth routes
authRateLimit: { windowMs: 15 * 60 * 1000, max: 10 }  // 10 attempts / 15min

// TIER 3 — API endpoints
apiRateLimit: { windowMs: 1 * 60 * 1000, max: 60 }  // 60 req / min per user

// TIER 4 — AI endpoints (expensive)
aiRateLimit: { windowMs: 60 * 60 * 1000, max: 20 }  // 20 AI calls / hour per user

// TIER 5 — Search (debounce + limit)
searchRateLimit: { windowMs: 1000, max: 5 }  // 5 search req / second per user

// TIER 6 — Trade execution
tradeRateLimit: { windowMs: 1000, max: 1 }  // 1 trade / second (prevent spam)
```

### 6.2 API Key Security

```
RULE: Zero API keys in frontend code. Ever.

Market data APIs  → Backend only, server-side proxy
AI API key        → Backend only, never in API response
Database URL      → Backend only, env var
JWT secret        → Backend only, RSA private key
Redis URL         → Backend only
SMTP credentials  → Backend only

Frontend only knows: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
No NEXT_PUBLIC_ for any secret or API key.
```

### 6.3 Input Validation & Sanitization

```typescript
// Pattern: validate BEFORE processing, sanitize AT boundary

// 1. Type validation (Zod schema on every route)
const tradeSchema = z.object({
  symbol: z.string().regex(/^[A-Z]{1,5}$/).toUpperCase(),
  shares: z.number().positive().max(1000000),
  orderType: z.enum(['MARKET', 'LIMIT']),
  limitPrice: z.number().positive().optional(),
});

// 2. String sanitization (strip HTML, escape special chars)
const sanitize = (str: string) => DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });

// 3. SQL: Only Prisma parameterized queries — no raw string concatenation
// ✅ CORRECT: prisma.user.findFirst({ where: { email: userInput } })
// ❌ WRONG:   db.query(`SELECT * FROM users WHERE email = '${userInput}'`)

// 4. Numeric bounds (financial)
z.number().min(0.01).max(999999.99)   // Price bounds
z.number().int().min(1).max(100000)   // Share count bounds
```

### 6.4 Security Headers (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://s.yimg.com"],
      connectSrc: ["'self'", "wss:", process.env.API_URL],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### 6.5 Audit Logging (All Sensitive Actions)

```typescript
// Actions that MUST be logged:
const AUDITED_ACTIONS = [
  'auth.login', 'auth.logout', 'auth.register',
  'auth.password_reset', 'auth.2fa_enable', 'auth.2fa_disable',
  'trade.buy', 'trade.sell',
  'portfolio.create', 'portfolio.delete',
  'strategy.create', 'strategy.delete',
  'backtest.run',
  'admin.user_suspend', 'admin.user_role_change',
  'ai.portfolio_analysis', 'ai.strategy_create',
];
```

---

## 7. REAL-TIME COMMUNICATION

### 7.1 WebSocket Architecture (Socket.io)

```typescript
// Rooms strategy
socket.join(`user:${userId}`);              // Private user notifications
socket.join(`price:${symbol}`);            // Stock price room
socket.join(`portfolio:${portfolioId}`);   // Portfolio value updates
socket.join(`backtest:${backtestId}`);     // Backtest progress

// Events emitted by server
'price:update'      → { symbol, price, change, changePercent }
'portfolio:update'  → { portfolioId, value, dailyPnl }
'notification:new'  → { id, type, message, data }
'backtest:progress' → { id, step, stepName, percent }
'backtest:complete' → { id, results }
'alert:triggered'   → { alertId, symbol, price, condition }
```

### 7.2 Server-Sent Events (SSE) for AI Streaming

```typescript
// AI responses use SSE (not WebSocket) — simpler, HTTP-native
router.get('/ai/stream', authenticate, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const stream = await anthropic.messages.stream({ ... });
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }
  
  res.write(`data: [DONE]\n\n`);
  res.end();
});
```

---

## 8. BACKGROUND JOBS & QUEUING

### 8.1 BullMQ Queue Configuration

```typescript
// Queue definitions
const queues = {
  priceAlerts:   new Queue('price-alerts',   { connection: redis }),
  newsIngestion: new Queue('news-ingestion', { connection: redis }),
  aiJobs:        new Queue('ai-jobs',        { connection: redis }),
  backtests:     new Queue('backtests',      { connection: redis }),
  emailJobs:     new Queue('emails',         { connection: redis }),
  analytics:     new Queue('analytics',      { connection: redis }),
};
```

### 8.2 Scheduled Jobs

```typescript
// Cron schedule (node-cron)

// Market data refresh (during market hours)
cron.schedule('*/15 * * * 1-5', () => queue.add('refreshPrices', {}));

// News ingestion
cron.schedule('*/15 * * * *', () => queue.add('fetchNews', {}));

// Price alert checking
cron.schedule('* 9-16 * * 1-5', () => queue.add('checkAlerts', {}));

// Daily AI market brief (8am ET on trading days)
cron.schedule('0 13 * * 1-5', () => queue.add('dailyBrief', {}));

// Portfolio snapshots (daily, for performance history)
cron.schedule('0 21 * * 1-5', () => queue.add('snapshotPortfolios', {}));

// Database cleanup (old notifications, expired tokens)
cron.schedule('0 2 * * *', () => queue.add('cleanup', {}));
```

### 8.3 Backtest Worker

```typescript
// Backtest runs in isolated worker thread (no event loop blocking)
backtestQueue.process('backtest', 2, async (job) => {
  // Max concurrency: 2 simultaneous backtests
  // Timeout: 5 minutes
  // On timeout: emit 'backtest:timeout' event, mark as failed
});
```

---

## 9. DEVOPS & INFRASTRUCTURE

### 9.1 Docker Setup

```yaml
# docker-compose.yml (development)
services:
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: quantedge
      POSTGRES_USER: quantedge_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "quantedge_user"]

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes: [redis_data:/data]
    ports: ["6379:6379"]

  backend:
    build: ./apps/backend
    env_file: .env
    depends_on: [postgres, redis]
    ports: ["8080:8080"]
    volumes: [./apps/backend:/app, /app/node_modules]

  frontend:
    build: ./apps/frontend
    env_file: .env.local
    ports: ["3000:3000"]
    depends_on: [backend]
    volumes: [./apps/frontend:/app, /app/node_modules]

  worker:
    build: ./apps/backend
    command: node dist/worker.js
    env_file: .env
    depends_on: [postgres, redis]
```

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test-backend:
    steps:
      - Checkout
      - Setup Node 20
      - Install dependencies
      - Run Prisma generate
      - Run Jest (unit + integration)
      - Upload coverage to Codecov

  test-frontend:
    steps:
      - Checkout
      - Setup Node 20
      - Install dependencies
      - Run TypeScript check
      - Run ESLint
      - Run Vitest

  build:
    needs: [test-backend, test-frontend]
    steps:
      - Build backend (tsup)
      - Build frontend (next build)
      - Build Docker images
      - Push to ECR

  deploy-staging:
    needs: build
    if: branch == 'main'
    steps:
      - Deploy to staging ECS
      - Run smoke tests
      - Notify Slack

  deploy-production:
    needs: deploy-staging
    if: tag matches v*
    steps:
      - Deploy to production ECS
      - Run health checks
      - Notify team
```

### 9.3 AWS Infrastructure

```
Region: us-east-1

Compute:
  EC2 t3.medium (backend) — 2 vCPU, 4GB RAM
  EC2 t3.small (frontend) — OR Vercel for Next.js

Database:
  RDS PostgreSQL 16, db.t3.medium (2 vCPU, 4GB RAM)
  Multi-AZ enabled in production
  Automated backups: 7-day retention

Cache:
  ElastiCache Redis 7, cache.t3.micro (MVP)
  → cache.t3.small (growth)

Storage:
  S3: quantedge-assets (avatars, exports, backups)
  S3: quantedge-logs (CloudWatch log archive)

CDN:
  CloudFront distribution
  Price Class 100 (US + Europe)
  TTL: 86400s static, 0s API

Networking:
  VPC with public + private subnets
  EC2 backend in private subnet
  RDS in private subnet
  NAT Gateway for outbound
  ALB for load balancing + SSL termination

Security:
  ACM certificate (SSL/TLS)
  WAF rules (SQLi, XSS, rate limiting)
  Secrets Manager (API keys, DB credentials)
  IAM roles (least privilege)
  VPC Security Groups

Monitoring:
  CloudWatch Logs
  CloudWatch Metrics + Alarms
  X-Ray distributed tracing
```

---

## 10. EXTERNAL DATA APIs

### 10.1 Market Data — Polygon.io

```typescript
// Base URL: https://api.polygon.io
// Auth: API key in query param or header

// Endpoints used:
GET /v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from}/{to}  // OHLCV
GET /v2/last/trade/{symbol}    // Last trade price
GET /v3/reference/tickers      // Stock search
GET /v2/snapshot/locale/us/markets/stocks/tickers  // All tickers snapshot
GET /v2/snapshot/locale/us/markets/stocks/gainers  // Top gainers
GET /v2/snapshot/locale/us/markets/stocks/losers   // Top losers

// Cache strategy:
// Prices: 15-second Redis TTL
// OHLCV historical: 1-hour Redis TTL
// Reference data: 24-hour Redis TTL
```

### 10.2 News & Fundamentals — Finnhub

```typescript
// Base URL: https://finnhub.io/api/v1
// Auth: token in query param

// Endpoints used:
GET /news?category=general            // Market news
GET /company-news?symbol={sym}        // Company news
GET /quote?symbol={sym}               // Real-time quote
GET /stock/metric?symbol={sym}        // Financial metrics (P/E, EPS, Beta)
GET /earnings/calendar                // Earnings calendar
GET /news-sentiment?symbol={sym}      // Sentiment analysis

// Rate limit: 60 req/min (free), 300 req/min (premium)
// Backend: global rate limiting middleware per provider
```

### 10.3 Economic Data — Alpha Vantage (Fallback)

```typescript
// Base URL: https://www.alphavantage.co/query
// Used as: fallback data source + economic indicators

// Endpoints:
?function=TIME_SERIES_DAILY&symbol={sym}    // Daily OHLCV
?function=OVERVIEW&symbol={sym}             // Company overview
?function=EARNINGS&symbol={sym}             // Earnings history
?function=FEDERAL_FUNDS_RATE               // Risk-free rate for Sharpe
?function=INFLATION                         // Inflation data
?function=GDP                               // GDP data

// Rate limit: 25 req/day (free), 500 req/day (premium)
```

### 10.4 Provider Resilience Pattern

```typescript
// Circuit breaker + fallback chain
async function getQuote(symbol: string) {
  try {
    return await polygonProvider.getQuote(symbol);  // Primary
  } catch (polygonError) {
    logger.warn('Polygon failed, trying Finnhub', { symbol });
    try {
      return await finnhubProvider.getQuote(symbol);  // Fallback 1
    } catch (finnhubError) {
      logger.warn('Finnhub failed, returning cached', { symbol });
      return await redis.get(`price:${symbol}`);  // Fallback 2 — stale cache
    }
  }
}
```

---

## 11. TESTING STACK

### 11.1 Backend Testing

| Tool | Version | Purpose |
|---|---|---|
| **Jest** | 29.x | Unit + integration test runner |
| **Supertest** | 6.x | HTTP endpoint testing |
| **@testcontainers/postgresql** | 10.x | Real PostgreSQL in Docker for tests |
| **@testcontainers/redis** | 10.x | Real Redis in Docker for tests |
| **faker** | 8.x | Test data generation |
| **nock** | 13.x | External HTTP request mocking |

**Coverage targets:**
```
Services (business logic):  > 80%
Controllers:                > 70%
Utilities:                  > 90%
Security middleware:        > 95%
Overall:                    > 70%
```

### 11.2 Frontend Testing

| Tool | Version | Purpose |
|---|---|---|
| **Vitest** | 1.x | Unit test runner (Vite-native) |
| **React Testing Library** | 14.x | Component testing |
| **@testing-library/user-event** | 14.x | User interaction simulation |
| **MSW (Mock Service Worker)** | 2.x | API mocking in tests |
| **Playwright** | 1.x | E2E browser testing |

### 11.3 Test Structure

```
apps/backend/src/
  __tests__/
    unit/
      services/        # Business logic unit tests
      utils/           # Utility function tests
    integration/
      routes/          # Full route tests with DB
      middleware/       # Security middleware tests
    e2e/               # End-to-end API flows

apps/frontend/src/
  __tests__/
    components/        # Component rendering tests
    hooks/             # Custom hook tests
    pages/             # Page integration tests
  e2e/                 # Playwright E2E tests
    auth.spec.ts
    portfolio.spec.ts
    trading.spec.ts
    backtest.spec.ts
```

---

## 12. MONITORING & OBSERVABILITY

### 12.1 Logging Strategy

```typescript
// Winston logger — all log levels
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({ filename: 'logs/error-%DATE%.log', level: 'error' }),
    new DailyRotateFile({ filename: 'logs/combined-%DATE%.log' }),
  ],
});

// Log levels by scenario:
logger.error()  // System errors, unhandled exceptions, DB failures
logger.warn()   // External API failures, rate limit hits, cache misses
logger.info()   // User actions (trades, logins, AI calls), job completions
logger.debug()  // Detailed query logs, middleware flow (dev only)
```

### 12.2 Error Tracking

- **Sentry** (optional v1) — Unhandled exception capture, performance monitoring
- CloudWatch Alarms — P95 latency > 1s, error rate > 1%, CPU > 80%

### 12.3 Health Check Endpoint

```typescript
GET /health
Response:
{
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: ISO8601,
  services: {
    database:  { status, latencyMs },
    redis:     { status, latencyMs },
    polygon:   { status, lastSuccess },
    finnhub:   { status, lastSuccess },
    anthropic: { status, lastSuccess },
  },
  version: "1.0.0",
  uptime: 86400,
}
```

---

## 13. PACKAGE REFERENCE — COMPLETE LIST

### 13.1 Backend package.json

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "@bull-board/express": "^5.x",
    "@prisma/client": "^5.x",
    "@resend/node": "^3.x",
    "bcrypt": "^5.x",
    "bullmq": "^4.x",
    "compression": "^1.x",
    "cors": "^2.x",
    "date-fns": "^3.x",
    "dotenv": "^16.x",
    "express": "^4.x",
    "express-async-errors": "^3.x",
    "express-rate-limit": "^7.x",
    "express-validator": "^7.x",
    "helmet": "^7.x",
    "hpp": "^0.2.x",
    "ioredis": "^5.x",
    "jsonwebtoken": "^9.x",
    "morgan": "^1.x",
    "node-cron": "^3.x",
    "qrcode": "^1.x",
    "socket.io": "^4.x",
    "speakeasy": "^2.x",
    "uuid": "^9.x",
    "winston": "^3.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bcrypt": "*",
    "@types/compression": "*",
    "@types/cors": "*",
    "@types/express": "*",
    "@types/jsonwebtoken": "*",
    "@types/morgan": "*",
    "@types/node": "*",
    "@types/supertest": "*",
    "faker": "^8.x",
    "jest": "^29.x",
    "nock": "^13.x",
    "prisma": "^5.x",
    "supertest": "^6.x",
    "ts-jest": "^29.x",
    "tsup": "^8.x",
    "tsx": "^4.x",
    "typescript": "^5.x"
  }
}
```

### 13.2 Frontend package.json

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "@hookform/resolvers": "^3.x",
    "@radix-ui/react-*": "^1.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "date-fns": "^3.x",
    "d3": "^7.x",
    "dompurify": "^3.x",
    "framer-motion": "^11.x",
    "lightweight-charts": "^4.x",
    "lucide-react": "^0.383.0",
    "next": "14.x",
    "next-themes": "^0.3.x",
    "numeral": "^2.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-hook-form": "^7.x",
    "recharts": "^2.x",
    "socket.io-client": "^4.x",
    "sonner": "^1.x",
    "tailwind-merge": "^2.x",
    "tailwindcss-animate": "^1.x",
    "zod": "^3.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "@playwright/test": "^1.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/react": "^14.x",
    "@testing-library/user-event": "^14.x",
    "@types/dompurify": "*",
    "@types/numeral": "*",
    "@types/react": "*",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.x",
    "msw": "^2.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x",
    "vitest": "^1.x"
  }
}
```

---

## 14. ENVIRONMENT VARIABLES

### 14.1 Backend .env

```bash
# ─── APPLICATION ───
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:3000
API_VERSION=v1

# ─── JWT (RS256 — use RSA key pair) ───
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
JWT_ACCESS_EXPIRY=900        # 15 minutes in seconds
JWT_REFRESH_EXPIRY=2592000   # 30 days in seconds

# ─── DATABASE ───
DATABASE_URL="postgresql://quantedge_user:password@localhost:5432/quantedge"
DATABASE_POOL_SIZE=10

# ─── REDIS ───
REDIS_URL="redis://:password@localhost:6379"
REDIS_PREFIX="qe:"

# ─── MARKET DATA APIs ───
POLYGON_API_KEY=your_polygon_key_here
FINNHUB_API_KEY=your_finnhub_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# ─── AI ───
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_DAILY_BUDGET_USD=50.00
AI_ALERT_THRESHOLD_USD=40.00

# ─── EMAIL ───
RESEND_API_KEY=re_...
EMAIL_FROM="QuantEdge <noreply@quantedge.app>"

# ─── AWS ───
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=quantedge-assets

# ─── SECURITY ───
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300

# ─── CORS ───
ALLOWED_ORIGINS=http://localhost:3000,https://quantedge.app
```

### 14.2 Frontend .env.local

```bash
# ─── Only NEXT_PUBLIC_ vars are safe for frontend ───
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080

# ─── These are NOT public — used only in Next.js server-side ───
# (Note: these are server-side API routes / SSR only, never client-side)
# No market data or AI keys in frontend — ever.
```

---

## 15. ARCHITECTURE DECISION RECORDS (ADRs)

### ADR-001: Express over Fastify
**Decision:** Use Express.js 4.x
**Rationale:** Larger ecosystem, team familiarity, extensive production battle-testing. Fastify's performance gains are negligible at our scale (<50K users).
**Status:** Accepted

### ADR-002: PostgreSQL over MongoDB
**Decision:** Use PostgreSQL 16
**Rationale:** Financial data requires ACID transactions. Relational model is natural for portfolios, holdings, trades. JSONB handles flexible AI outputs. Better analytics with window functions.
**Status:** Accepted

### ADR-003: Monorepo with Turborepo
**Decision:** Use Turborepo for monorepo management
**Rationale:** Shared types (Zod schemas, TypeScript interfaces) between frontend and backend. Unified CI/CD. Single repository to manage.
**Status:** Accepted

### ADR-004: Claude API over OpenAI
**Decision:** Use Anthropic Claude (claude-sonnet-4-6) as primary AI provider
**Rationale:** Better instruction-following for structured financial analysis. Stronger safety defaults. Competitive pricing. Native streaming.
**Status:** Accepted

### ADR-005: BullMQ over node-cron alone
**Decision:** Use BullMQ for all background jobs
**Rationale:** Persistent job queue (survives restarts), retry logic, concurrency control, job monitoring via Bull Board. node-cron only for scheduling job additions.
**Status:** Accepted

### ADR-006: TradingView Lightweight Charts over Recharts for price data
**Decision:** Use TradingView LW Charts for all OHLCV / price time-series
**Rationale:** Purpose-built for financial time-series. High performance with millions of data points. Native candlestick support. Crosshair, zoom, pan built-in.
**Status:** Accepted

### ADR-007: SSE for AI streaming, WebSocket for price/notification
**Decision:** SSE for AI responses, WebSocket for real-time prices and notifications
**Rationale:** SSE is simpler (standard HTTP), naturally unidirectional (AI output only goes client-ward), no reconnection library needed. WebSocket for bidirectional price room subscriptions.
**Status:** Accepted
```

---

*End of QuantEdge Tech Stack v1.0.0*
*Next: See SCHEMA.md for complete database design*
