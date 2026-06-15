# QuantEdge — Implementation Guide

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Purpose:** Step-by-step implementation reference. Each Phase maps directly to TRACKER.md milestones.
> **Rule:** Read relevant section of TECH_SPEC.md and SCHEMA.md before writing any code.

---

## TABLE OF CONTENTS

1. [Prerequisites & Environment Setup](#1-prerequisites--environment-setup)
2. [Repository Structure](#2-repository-structure)
3. [Phase 1 — Project Scaffold](#3-phase-1--project-scaffold)
4. [Phase 2 — Database & Core Backend](#4-phase-2--database--core-backend)
5. [Phase 3 — Authentication System](#5-phase-3--authentication-system)
6. [Phase 4 — Market Data Layer](#6-phase-4--market-data-layer)
7. [Phase 5 — Portfolio & Trading](#7-phase-5--portfolio--trading)
8. [Phase 6 — Frontend Foundation](#8-phase-6--frontend-foundation)
9. [Phase 7 — Dashboard & Core UI](#9-phase-7--dashboard--core-ui)
10. [Phase 8 — Analytics Engine](#10-phase-8--analytics-engine)
11. [Phase 9 — Strategy Builder](#11-phase-9--strategy-builder)
12. [Phase 10 — Backtesting Engine](#12-phase-10--backtesting-engine)
13. [Phase 11 — AI Integration](#13-phase-11--ai-integration)
14. [Phase 12 — News & Intelligence](#14-phase-12--news--intelligence)
15. [Phase 13 — Real-Time Features](#15-phase-13--real-time-features)
16. [Phase 14 — Admin Panel](#16-phase-14--admin-panel)
17. [Phase 15 — Testing](#17-phase-15--testing)
18. [Phase 16 — DevOps & Deployment](#18-phase-16--devops--deployment)
19. [Coding Conventions](#19-coding-conventions)
20. [Common Patterns Reference](#20-common-patterns-reference)

---

## 1. PREREQUISITES & ENVIRONMENT SETUP

### 1.1 Required Software

```bash
# Verify all installed before starting
node --version      # Must be >= 20.x LTS
npm --version       # Must be >= 10.x
docker --version    # Must be >= 24.x
docker compose version  # Must be >= 2.x
git --version       # Must be >= 2.x
psql --version      # PostgreSQL client (optional but helpful)
redis-cli --version # Redis client (optional but helpful)
```

### 1.2 Accounts Required

```
GitHub          → Repository hosting (create account if needed)
Polygon.io      → Market data API (free tier: starter)
Finnhub         → News & sentiment API (free tier)
Alpha Vantage   → Economic data fallback (free tier)
Anthropic       → Claude API (pay-as-you-go)
Resend          → Email delivery (free tier: 100/day)
AWS             → Cloud hosting (free tier for 12 months) — Optional for dev
```

### 1.3 API Keys Checklist

```bash
# Copy and fill in apps/backend/.env:
POLYGON_API_KEY=          # https://polygon.io/dashboard/api-keys
FINNHUB_API_KEY=          # https://finnhub.io/dashboard/api-keys
ALPHA_VANTAGE_API_KEY=    # https://www.alphavantage.co/support/#api-key
ANTHROPIC_API_KEY=        # https://console.anthropic.com/api-keys
RESEND_API_KEY=           # https://resend.com/api-keys
```

### 1.4 RSA Key Generation (JWT)

```bash
# Run once, store safely — DO NOT commit private.pem
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Convert to single-line for .env (escape newlines)
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' keys/private.pem
# Copy output → JWT_PRIVATE_KEY in .env
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' keys/public.pem
# Copy output → JWT_PUBLIC_KEY in .env
```

---

## 2. REPOSITORY STRUCTURE

```
quantedge/                          ← Monorepo root
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  ← CI pipeline (test + lint)
│       └── deploy.yml              ← CD pipeline (build + deploy)
│
├── apps/
│   ├── frontend/                   ← Next.js 14 App Router
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                ← App Router pages
│   │   │   │   ├── (auth)/         ← Auth route group
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (app)/          ← Protected route group
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── markets/
│   │   │   │   │   ├── portfolio/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── strategies/
│   │   │   │   │   ├── backtests/
│   │   │   │   │   ├── news/
│   │   │   │   │   ├── ai/
│   │   │   │   │   ├── notifications/
│   │   │   │   │   ├── settings/
│   │   │   │   │   ├── admin/
│   │   │   │   │   └── layout.tsx  ← App layout (sidebar + topbar)
│   │   │   │   ├── layout.tsx      ← Root layout
│   │   │   │   └── page.tsx        ← Landing page
│   │   │   ├── components/
│   │   │   │   ├── ui/             ← shadcn components (auto-generated)
│   │   │   │   ├── layout/         ← Sidebar, Topbar, BottomNav
│   │   │   │   ├── charts/         ← TradingView + Recharts wrappers
│   │   │   │   ├── portfolio/      ← Portfolio-specific components
│   │   │   │   ├── markets/        ← Stock/markets components
│   │   │   │   ├── analytics/      ← Analytics components
│   │   │   │   ├── strategies/     ← Strategy builder components
│   │   │   │   ├── backtests/      ← Backtest components
│   │   │   │   ├── news/           ← News components
│   │   │   │   ├── ai/             ← AI panel components
│   │   │   │   ├── notifications/  ← Notification components
│   │   │   │   ├── settings/       ← Settings components
│   │   │   │   ├── admin/          ← Admin panel components
│   │   │   │   ├── shared/         ← Skeletons, empty states, errors
│   │   │   │   └── landing/        ← Landing page sections
│   │   │   ├── hooks/              ← Custom React hooks
│   │   │   │   ├── usePortfolio.ts
│   │   │   │   ├── useMarketData.ts
│   │   │   │   ├── useAI.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useAuth.ts
│   │   │   ├── lib/
│   │   │   │   ├── api/            ← Axios instance + API functions
│   │   │   │   │   ├── client.ts   ← Axios config + interceptors
│   │   │   │   │   ├── auth.api.ts
│   │   │   │   │   ├── portfolio.api.ts
│   │   │   │   │   ├── markets.api.ts
│   │   │   │   │   ├── analytics.api.ts
│   │   │   │   │   ├── strategies.api.ts
│   │   │   │   │   ├── backtests.api.ts
│   │   │   │   │   ├── news.api.ts
│   │   │   │   │   ├── ai.api.ts
│   │   │   │   │   └── notifications.api.ts
│   │   │   │   ├── socket.ts       ← Socket.io client singleton
│   │   │   │   ├── queryClient.ts  ← React Query setup
│   │   │   │   ├── utils.ts        ← cn(), formatCurrency(), formatDate()
│   │   │   │   ├── constants.ts    ← App-wide constants
│   │   │   │   └── validators.ts   ← Shared Zod schemas
│   │   │   ├── store/
│   │   │   │   ├── auth.store.ts   ← Auth state (Zustand)
│   │   │   │   ├── ui.store.ts     ← Sidebar, modal, theme
│   │   │   │   └── portfolio.store.ts ← Active portfolio selection
│   │   │   └── types/              ← TypeScript interfaces
│   │   │       ├── api.types.ts
│   │   │       ├── portfolio.types.ts
│   │   │       ├── market.types.ts
│   │   │       └── strategy.types.ts
│   │   ├── .env.local
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/                    ← Express.js API
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts     ← Prisma client singleton
│       │   │   ├── redis.ts        ← Redis client
│       │   │   ├── socket.ts       ← Socket.io server setup
│       │   │   ├── queue.ts        ← BullMQ queue definitions
│       │   │   └── constants.ts    ← App constants
│       │   ├── middleware/
│       │   │   ├── authenticate.ts ← JWT verification
│       │   │   ├── authorize.ts    ← RBAC role check
│       │   │   ├── validate.ts     ← Zod validation middleware
│       │   │   ├── rateLimiter.ts  ← All rate limiter configs
│       │   │   ├── sanitize.ts     ← Input sanitization
│       │   │   └── errorHandler.ts ← Global error handler
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── portfolio.routes.ts
│       │   │   ├── markets.routes.ts
│       │   │   ├── analytics.routes.ts
│       │   │   ├── strategies.routes.ts
│       │   │   ├── backtests.routes.ts
│       │   │   ├── news.routes.ts
│       │   │   ├── ai.routes.ts
│       │   │   ├── notifications.routes.ts
│       │   │   └── admin.routes.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── portfolio.controller.ts
│       │   │   ├── markets.controller.ts
│       │   │   ├── analytics.controller.ts
│       │   │   ├── strategies.controller.ts
│       │   │   ├── backtests.controller.ts
│       │   │   ├── news.controller.ts
│       │   │   ├── ai.controller.ts
│       │   │   ├── notifications.controller.ts
│       │   │   └── admin.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── portfolio.service.ts
│       │   │   ├── markets.service.ts
│       │   │   ├── analytics.service.ts
│       │   │   ├── strategies.service.ts
│       │   │   ├── backtest.service.ts
│       │   │   ├── news.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── email.service.ts
│       │   ├── providers/           ← External API wrappers
│       │   │   ├── polygon.provider.ts
│       │   │   ├── finnhub.provider.ts
│       │   │   ├── alphaVantage.provider.ts
│       │   │   └── anthropic.provider.ts
│       │   ├── workers/             ← BullMQ job handlers
│       │   │   ├── priceAlerts.worker.ts
│       │   │   ├── newsIngestion.worker.ts
│       │   │   ├── aiJobs.worker.ts
│       │   │   ├── backtest.worker.ts
│       │   │   └── email.worker.ts
│       │   ├── jobs/                ← Cron job schedulers
│       │   │   └── scheduler.ts    ← All cron definitions
│       │   ├── utils/
│       │   │   ├── jwt.ts
│       │   │   ├── cache.ts         ← getCachedOrFetch pattern
│       │   │   ├── analytics.ts     ← Sharpe, VaR, Max Drawdown calc
│       │   │   ├── backtest.ts      ← Backtesting engine core
│       │   │   ├── indicators.ts    ← SMA, EMA, RSI, MACD, etc.
│       │   │   ├── formatters.ts    ← Response formatters
│       │   │   ├── auditLog.ts      ← Audit log helper
│       │   │   └── errors.ts        ← AppError class + error types
│       │   ├── schemas/             ← Zod validation schemas
│       │   │   ├── auth.schema.ts
│       │   │   ├── portfolio.schema.ts
│       │   │   ├── markets.schema.ts
│       │   │   ├── strategies.schema.ts
│       │   │   ├── backtests.schema.ts
│       │   │   └── ai.schema.ts
│       │   ├── types/               ← TypeScript types
│       │   │   ├── express.d.ts     ← Augment Request with .user
│       │   │   └── index.ts
│       │   ├── app.ts               ← Express app setup
│       │   ├── server.ts            ← HTTP + WebSocket server start
│       │   └── worker.ts            ← BullMQ worker process entry
│       ├── prisma/
│       │   ├── schema.prisma        ← Database schema
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── .env
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── packages/
│   └── shared/                     ← Shared types between frontend + backend
│       ├── src/
│       │   ├── types/
│       │   │   ├── portfolio.types.ts
│       │   │   ├── strategy.types.ts
│       │   │   └── api.types.ts
│       │   └── schemas/            ← Shared Zod schemas
│       └── package.json
│
├── docker-compose.yml              ← Local dev environment
├── docker-compose.prod.yml         ← Production compose
├── .gitignore
├── .eslintrc.json
├── turbo.json                      ← Turborepo config
└── package.json                    ← Root workspace package.json
```

---

## 3. PHASE 1 — PROJECT SCAFFOLD

> **Estimated Time:** 1–2 days | **Tracker:** Tasks 1.1–1.8

### Step 1.1 — GitHub Repository Setup

```bash
# Create repo on GitHub first (quantedge), then:
mkdir quantedge && cd quantedge
git init
git remote add origin https://github.com/YOUR_USERNAME/quantedge.git

# Create .gitignore (critical — add BEFORE first commit)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
dist/
build/

# Environment variables — NEVER commit these
.env
.env.local
.env.*.local
apps/backend/.env
apps/frontend/.env.local

# Keys — NEVER commit
keys/
*.pem

# Logs
logs/
*.log
npm-debug.log*

# Database
*.sqlite

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln

# Testing
coverage/

# Turbo
.turbo/
EOF

git add .gitignore
git commit -m "chore: initialize repository with .gitignore"
git push -u origin main
```

### Step 1.2 — Turborepo Monorepo Setup

```bash
# Initialize Turborepo
npx create-turbo@latest . --skip-install

# Or manually:
cat > package.json << 'EOF'
{
  "name": "quantedge",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:generate": "cd apps/backend && npx prisma generate",
    "db:migrate": "cd apps/backend && npx prisma migrate dev",
    "db:seed": "cd apps/backend && npx ts-node prisma/seed.ts",
    "db:studio": "cd apps/backend && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.x",
    "@typescript-eslint/eslint-plugin": "^7.x",
    "@typescript-eslint/parser": "^7.x"
  }
}
EOF

cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] },
    "lint": {}
  }
}
EOF

npm install
git add -A && git commit -m "chore: setup turborepo monorepo structure"
```

### Step 1.3 — Docker Compose (Local Dev)

```bash
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: quantedge_postgres
    environment:
      POSTGRES_DB: quantedge
      POSTGRES_USER: quantedge_user
      POSTGRES_PASSWORD: devpassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quantedge_user -d quantedge"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: quantedge_redis
    command: redis-server --requirepass devpassword123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "devpassword123", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF

docker compose up -d
docker compose ps  # Verify both running
git add docker-compose.yml && git commit -m "chore: add docker-compose for local development"
```

### Step 1.4 — Backend Scaffold

```bash
mkdir -p apps/backend/src/{config,middleware,routes,controllers,services,providers,workers,jobs,utils,schemas,types}
mkdir -p apps/backend/prisma/migrations
cd apps/backend

# Initialize package.json
npm init -y

# Install all backend dependencies (see TECH_STACK.md section 13.1)
npm install express @anthropic-ai/sdk @prisma/client @resend/node bcrypt bullmq compression cors date-fns dotenv express-async-errors express-rate-limit express-validator helmet hpp ioredis jsonwebtoken morgan node-cron qrcode socket.io speakeasy uuid winston zod @socket.io/redis-adapter rate-limit-redis express-mongo-sanitize

npm install -D typescript ts-jest jest supertest faker nock prisma tsup tsx @types/bcrypt @types/compression @types/cors @types/express @types/jsonwebtoken @types/morgan @types/node @types/supertest @types/qrcode

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Express augmentation (types)
cat > src/types/express.d.ts << 'EOF'
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
EOF

cd ../..
git add -A && git commit -m "feat: scaffold backend Express.js application"
```

### Step 1.5 — Frontend Scaffold

```bash
# Create Next.js 14 app with App Router
npx create-next-app@14 apps/frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd apps/frontend

# Install all frontend dependencies (see TECH_STACK.md section 13.2)
npm install @anthropic-ai/sdk @hookform/resolvers @tanstack/react-query axios class-variance-authority clsx date-fns dompurify framer-motion lightweight-charts lucide-react next-themes numeral react-hook-form recharts socket.io-client sonner tailwind-merge tailwindcss-animate zod zustand d3

npm install -D @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/dompurify @types/numeral msw vitest

# Install shadcn/ui
npx shadcn-ui@latest init
# Select: Dark mode, CSS variables, src directory

# Add all shadcn components needed
npx shadcn-ui@latest add alert alert-dialog avatar badge button calendar card checkbox command dialog drawer dropdown-menu form hover-card input label menubar navigation-menu popover progress radio-group scroll-area select separator sheet skeleton slider switch table tabs textarea toast toggle tooltip

cd ../..
git add -A && git commit -m "feat: scaffold frontend Next.js 14 application with shadcn/ui"
```

### Step 1.6 — Environment Files Setup

```bash
# Backend .env template
cat > apps/backend/.env.example << 'EOF'
# Copy to .env and fill in values
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:3000
API_VERSION=v1

JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=2592000

DATABASE_URL=postgresql://quantedge_user:devpassword123@localhost:5432/quantedge
REDIS_URL=redis://:devpassword123@localhost:6379
REDIS_PREFIX=qe:

POLYGON_API_KEY=
FINNHUB_API_KEY=
ALPHA_VANTAGE_API_KEY=

ANTHROPIC_API_KEY=
AI_DAILY_BUDGET_USD=50.00

RESEND_API_KEY=
EMAIL_FROM=QuantEdge <noreply@quantedge.app>

BCRYPT_ROUNDS=12
EOF

cp apps/backend/.env.example apps/backend/.env
# Fill in .env with actual values

# Frontend .env.local
cat > apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
EOF

git add apps/backend/.env.example && git commit -m "chore: add environment variable templates"
```

---

## 4. PHASE 2 — DATABASE & CORE BACKEND

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 2.1–2.6

### Step 2.1 — Prisma Schema

```bash
# Copy complete schema from SCHEMA.md to apps/backend/prisma/schema.prisma
# Then run initial migration:

cd apps/backend
npx prisma migrate dev --name init_schema
npx prisma generate

# Verify tables created:
npx prisma studio
# Or: psql postgresql://quantedge_user:devpassword123@localhost:5432/quantedge -c "\dt"

git add -A && git commit -m "feat(db): create initial database schema with Prisma"
```

### Step 2.2 — Core App Setup

```typescript
// apps/backend/src/app.ts
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';

import { globalRateLimit } from './middleware/rateLimiter';
import { sanitizeInputs } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import all routes
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import marketsRoutes from './routes/markets.routes';
// ... all routes

const app = express();

// Security middleware
app.use(helmet({ /* config from TECH_SPEC.md section 6.4 */ }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(globalRateLimit);
app.use(sanitizeInputs);

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// Health check
app.get('/health', healthCheckHandler);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/markets', marketsRoutes);
// ... all routes

// Error handling (MUST be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
```

```typescript
// apps/backend/src/server.ts
import http from 'http';
import app from './app';
import { initializeSocket } from './config/socket';
import { initializeQueues } from './config/queue';
import { startScheduler } from './jobs/scheduler';
import { redis } from './config/redis';
import { prisma } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 8080;

async function startServer() {
  // Verify DB connection
  await prisma.$connect();
  logger.info('✅ Database connected');

  // Verify Redis connection
  await redis.ping();
  logger.info('✅ Redis connected');

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket
  initializeSocket(server);
  logger.info('✅ WebSocket initialized');

  // Initialize BullMQ queues
  initializeQueues();
  logger.info('✅ Job queues initialized');

  // Start cron scheduler
  startScheduler();
  logger.info('✅ Job scheduler started');

  server.listen(PORT, () => {
    logger.info(`🚀 QuantEdge API running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — graceful shutdown');
    server.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
```

```bash
git add -A && git commit -m "feat(backend): setup Express app with all security middleware"
```

### Step 2.3 — Redis Client

```typescript
// apps/backend/src/config/redis.ts
import { Redis } from 'ioredis';
import logger from '../utils/logger';

export const redis = new Redis(process.env.REDIS_URL!, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  lazyConnect: true,
  enableReadyCheck: true,
  keyPrefix: process.env.REDIS_PREFIX || 'qe:',
});

redis.on('connect', () => logger.info('Redis: connected'));
redis.on('error', (err) => logger.error('Redis error:', err));
redis.on('close', () => logger.warn('Redis: connection closed'));

// Cache utility
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (err) {
    logger.warn('Cache read failed, proceeding with fetch', { key, err });
  }
  const data = await fetchFn();
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn('Cache write failed', { key, err });
  }
  return data;
}

git add -A && git commit -m "feat(backend): configure Redis client with cache utility"
```

### Step 2.4 — Error Classes

```typescript
// apps/backend/src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: any[]) {
    super('VALIDATION_ERROR', 'Request validation failed', 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = 'Authentication required') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super('ALREADY_EXISTS', message, 409);
  }
}

export class UnprocessableError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 422);
  }
}

git add -A && git commit -m "feat(backend): add typed error classes"
```

### Step 2.5 — Database Seeding

```bash
# Implement seed.ts (see SCHEMA.md section 5)
cd apps/backend
npx ts-node prisma/seed.ts

git add -A && git commit -m "feat(db): add database seed with initial data"
```

---

## 5. PHASE 3 — AUTHENTICATION SYSTEM

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 3.1–3.12
> **Reference:** TECH_SPEC.md sections 2, 12

### Step 3.1 — Auth Service

Implement `apps/backend/src/services/auth.service.ts` with these methods:
- `register(data)` — hash password, create user, send verification email
- `verifyEmail(token)` — verify token, activate account
- `login(email, password)` — verify creds, check lock, return tokens or 2fa flag
- `verify2FA(code, interimToken)` — TOTP verification
- `refreshToken(rawToken)` — rotate refresh token
- `logout(rawToken)` — invalidate token
- `forgotPassword(email)` — generate + send reset email
- `resetPassword(token, newPassword)` — apply reset
- `setup2FA(userId)` — generate TOTP secret + QR code
- `enable2FA(userId, code, secret)` — verify + enable
- `disable2FA(userId, password, code)` — verify + disable
- `getSessions(userId)` — list active sessions
- `revokeSession(userId, sessionId)` — delete specific token

```bash
git add -A && git commit -m "feat(auth): implement core authentication service"
```

### Step 3.2 — Auth Middleware

```bash
# Implement authenticate.ts, authorize.ts — see TECH_SPEC.md section 12.2-12.3
git add -A && git commit -m "feat(auth): add JWT authentication middleware"
```

### Step 3.3 — Auth Routes + Controllers

```bash
# Implement all routes from TECH_SPEC.md section 2
# Wire up: schema validation → authenticate → authorize → controller → service
git add -A && git commit -m "feat(auth): add all authentication routes and controllers"
```

### Step 3.4 — Email Service

```typescript
// apps/backend/src/services/email.service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Verify your QuantEdge account',
    html: verificationEmailTemplate(firstName, verifyUrl),
  });
}

// Also implement: sendPasswordResetEmail, sendAlertEmail, sendDailyDigest
```

```bash
git add -A && git commit -m "feat(auth): add email service with Resend"
```

### Step 3.5 — Auth Integration Test

```bash
# Write tests for: register, login, refresh, logout, forgot/reset password
# See testing patterns in TECH_STACK.md section 11
git add -A && git commit -m "test(auth): add authentication integration tests"
```

---

## 6. PHASE 4 — MARKET DATA LAYER

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 4.1–4.8

### Step 4.1 — Market Data Providers

```typescript
// apps/backend/src/providers/polygon.provider.ts
import axios from 'axios';
import { getCachedOrFetch, redis } from '../config/redis';

const BASE_URL = 'https://api.polygon.io';
const API_KEY = process.env.POLYGON_API_KEY;

export class PolygonProvider {
  async getQuote(symbol: string) {
    return getCachedOrFetch(
      `price:${symbol}`,
      15,
      async () => {
        const { data } = await axios.get(
          `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${API_KEY}`
        );
        return mapPolygonQuote(data);
      }
    );
  }

  async getHistoricalPrices(symbol: string, from: string, to: string, interval: string) {
    const cacheKey = `candles:${symbol}:${interval}:${from}:${to}`;
    return getCachedOrFetch(cacheKey, 3600, async () => {
      const { data } = await axios.get(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${API_KEY}`
      );
      return data.results?.map(mapOHLCV) ?? [];
    });
  }

  async getMarketMovers(type: 'gainers' | 'losers') {
    return getCachedOrFetch(`movers:${type}`, 60, async () => {
      const { data } = await axios.get(
        `${BASE_URL}/v2/snapshot/locale/us/markets/stocks/${type}?apiKey=${API_KEY}`
      );
      return data.tickers?.slice(0, 20).map(mapMover) ?? [];
    });
  }

  async searchStocks(query: string) {
    const { data } = await axios.get(
      `${BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(query)}&market=stocks&active=true&limit=10&apiKey=${API_KEY}`
    );
    return data.results?.map(mapSearchResult) ?? [];
  }
}
```

```typescript
// apps/backend/src/providers/finnhub.provider.ts
// Implement: getCompanyNews, getStockMetrics, getEarningsCalendar, getSentiment
```

```typescript
// Circuit breaker pattern (resilience)
// apps/backend/src/providers/marketData.factory.ts
export async function getQuoteWithFallback(symbol: string) {
  try {
    return await polygonProvider.getQuote(symbol);
  } catch {
    try { return await finnhubProvider.getQuote(symbol); }
    catch { return await getStaleCache(symbol); }
  }
}
```

```bash
git add -A && git commit -m "feat(markets): implement market data providers with fallback chain"
```

### Step 4.2 — Markets Routes

```bash
# Implement all routes from TECH_SPEC.md section 4
# GET /markets/overview, /search, /stocks/:symbol, /movers, /sectors
git add -A && git commit -m "feat(markets): add all market data routes"
```

### Step 4.3 — Stock Search (Full-Text)

```sql
-- Add in migration: full-text + trigram indexes (SCHEMA.md section 4)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_stocks_name_trgm ON stocks USING GIN(name gin_trgm_ops);
CREATE INDEX idx_stocks_fts ON stocks USING GIN(to_tsvector('english', name || ' ' || symbol));
```

```bash
git add -A && git commit -m "feat(markets): add full-text stock search with trigram matching"
```

---

## 7. PHASE 5 — PORTFOLIO & TRADING

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 5.1–5.10

### Step 5.1 — Portfolio Service

Implement `apps/backend/src/services/portfolio.service.ts`:
- `getPortfolios(userId)` — with live prices from Redis
- `createPortfolio(userId, data)` — enforce 5-portfolio limit
- `getPortfolio(portfolioId, userId)` — with holdings + prices
- `getChart(portfolioId, range, benchmark)` — from snapshots
- `executeTrade(portfolioId, tradeData, userId)` — core trade logic
- `getTransactions(portfolioId, filters)` — paginated
- `manageCash(portfolioId, type, amount)` — deposit/withdraw

**Critical: Trade execution logic**
```typescript
async function executeTrade(portfolioId: string, trade: TradeInput, userId: string) {
  // 1. Get current price
  const currentPrice = await getQuoteWithFallback(trade.symbol);
  const price = trade.orderType === 'LIMIT' ? trade.limitPrice! : currentPrice.price;

  // 2. Use Prisma transaction (atomic operation)
  return await prisma.$transaction(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, user_id: userId, is_deleted: false },
      include: { holdings: { where: { symbol: trade.symbol } } },
    });

    if (!portfolio) throw new NotFoundError('Portfolio');

    const totalCost = trade.shares * price;

    if (trade.type === 'BUY') {
      if (portfolio.cash_balance < totalCost)
        throw new UnprocessableError('INSUFFICIENT_CASH', `Need $${totalCost}, have $${portfolio.cash_balance}`);

      // Update or create holding
      const existingHolding = portfolio.holdings[0];
      if (existingHolding) {
        const newShares = existingHolding.shares + trade.shares;
        const newAvgCost = (existingHolding.shares * existingHolding.average_cost + totalCost) / newShares;
        await tx.holding.update({
          where: { id: existingHolding.id },
          data: { shares: newShares, average_cost: newAvgCost, total_cost: newShares * newAvgCost },
        });
      } else {
        await tx.holding.create({
          data: { portfolio_id: portfolioId, symbol: trade.symbol, shares: trade.shares, average_cost: price, total_cost: totalCost },
        });
      }
      await tx.portfolio.update({ where: { id: portfolioId }, data: { cash_balance: { decrement: totalCost } } });

    } else { // SELL
      const holding = portfolio.holdings[0];
      if (!holding || holding.shares < trade.shares)
        throw new UnprocessableError('INSUFFICIENT_SHARES', 'Not enough shares to sell');

      const proceeds = trade.shares * price;
      const newShares = holding.shares - trade.shares;

      if (newShares === 0) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        await tx.holding.update({ where: { id: holding.id }, data: { shares: newShares } });
      }
      await tx.portfolio.update({ where: { id: portfolioId }, data: { cash_balance: { increment: proceeds } } });
    }

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        portfolio_id: portfolioId,
        symbol: trade.symbol,
        type: trade.type,
        order_type: trade.orderType,
        shares: trade.shares,
        price_per_share: price,
        total_amount: trade.type === 'BUY' ? -totalCost : totalCost,
      },
    });

    return transaction;
  });
}
```

```bash
git add -A && git commit -m "feat(portfolio): implement portfolio management and trade execution"
```

---

## 8. PHASE 6 — FRONTEND FOUNDATION

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 6.1–6.8

### Step 6.1 — Tailwind Config with Design Tokens

```typescript
// apps/frontend/tailwind.config.ts
// Add all CSS custom properties as Tailwind tokens
// Map every color from DESIGN.md section 3.1
```

### Step 6.2 — Global CSS

```css
/* apps/frontend/src/app/globals.css */
/* Import all CSS variables from DESIGN.md section 3.1 */
/* Add shimmer keyframe for skeleton loading */
/* Add pulse-ring for live indicators */
```

### Step 6.3 — Axios Client + Interceptors

```typescript
// apps/frontend/src/lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // For httpOnly cookie refresh token
  timeout: 30000,
});

// Request interceptor: attach access token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        failedQueue.forEach(p => p.resolve(newToken));
        failedQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        useAuthStore.getState().logout();
        window.location.href = '/auth/login?session=expired';
        return Promise.reject(refreshError);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default client;
```

```bash
git add -A && git commit -m "feat(frontend): setup Axios client with JWT refresh interceptor"
```

### Step 6.4 — Auth Store (Zustand)

```typescript
// apps/frontend/src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'qe-auth', partialize: (state) => ({ user: state.user }) }
    // Note: accessToken NOT persisted — in-memory only for security
  )
);
```

```bash
git add -A && git commit -m "feat(frontend): add Zustand auth and UI stores"
```

### Step 6.5 — App Layout (Sidebar + Topbar)

```bash
# Implement:
# - apps/frontend/src/components/layout/Sidebar.tsx
# - apps/frontend/src/components/layout/Topbar.tsx
# - apps/frontend/src/components/layout/BottomNav.tsx
# - apps/frontend/src/app/(app)/layout.tsx
# Follow DESIGN.md section 7.6 exactly for visual spec
git add -A && git commit -m "feat(frontend): implement app shell with sidebar and topbar"
```

### Step 6.6 — Shared Components Library

```bash
# Implement skeleton components (DESIGN.md section 10):
# SkeletonCard, SkeletonTable, SkeletonChart, SkeletonNumber, SkeletonText

# Implement empty states (DESIGN.md section 11):
# EmptyPortfolio, EmptyWatchlist, EmptyStrategies, EmptyBacktests

# Implement error states (DESIGN.md section 12):
# WidgetError, PageError, InlineError

git add -A && git commit -m "feat(frontend): add skeleton, empty state, and error components"
```

### Step 6.7 — Auth Pages

```bash
# Implement:
# /auth/login — form with all states (loading, error, 2FA redirect)
# /auth/register — with password strength meter
# /auth/forgot-password
# /auth/reset-password
# /auth/verify-email
# /auth/two-factor

git add -A && git commit -m "feat(frontend): implement all authentication pages"
```

---

## 9. PHASE 7 — DASHBOARD & CORE UI

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 7.1–7.9

### Step 7.1 — Dashboard Page

```bash
# Implement /app/dashboard with:
# - PortfolioHero widget
# - PerformanceChart (TradingView LW Charts area chart)
# - WatchlistWidget
# - MarketMoversWidget
# - AIInsightPanel (collapsed, with "Analyze" button)
# - NewsWidget (5 articles)
# - DailyBriefWidget
# All with skeleton loading states
git add -A && git commit -m "feat(dashboard): implement main dashboard with all widgets"
```

### Step 7.2 — TradingView Charts Integration

```typescript
// apps/frontend/src/components/charts/PriceChart.tsx
'use client';
import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';

export function PriceChart({ data, type = 'area' }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94A3B8' },
      grid: { vertLines: { color: 'rgba(45,55,72,0.4)' }, horzLines: { color: 'rgba(45,55,72,0.4)' } },
      crosshair: { vertLine: { color: 'rgba(148,163,184,0.4)' }, horzLine: { color: 'rgba(148,163,184,0.4)' } },
      width: chartRef.current.clientWidth,
      height: 300,
    });
    chartInstance.current = chart;

    const series = type === 'candlestick'
      ? chart.addCandlestickSeries({ upColor: '#22C55E', downColor: '#EF4444', borderVisible: false, wickUpColor: '#22C55E', wickDownColor: '#EF4444' })
      : chart.addAreaSeries({ lineColor: '#8B5CF6', topColor: 'rgba(139,92,246,0.3)', bottomColor: 'rgba(139,92,246,0)', lineWidth: 2 });

    series.setData(data);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => chart.resize(chartRef.current!.clientWidth, 300));
    ro.observe(chartRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, [data, type]);

  return <div ref={chartRef} className="w-full" />;
}
```

```bash
git add -A && git commit -m "feat(charts): implement TradingView Lightweight Charts wrapper"
```

### Step 7.3 — Markets Module

```bash
# Implement:
# /app/markets/overview — market overview page
# /app/markets/stocks/[symbol] — stock detail page
# Stock search component with debounce
# Market movers widget
# Sector heatmap

git add -A && git commit -m "feat(markets): implement markets module with stock detail page"
```

### Step 7.4 — Portfolio Module

```bash
# Implement:
# /app/portfolio/[portfolioId] — portfolio with tabs
# Holdings table with live P&L
# Transactions table (paginated)
# Performance chart with benchmark
# Trade modal (Buy/Sell form)
# Portfolio selector

git add -A && git commit -m "feat(portfolio): implement portfolio module with trading"
```

---

## 10. PHASE 8 — ANALYTICS ENGINE

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 8.1–8.6

```bash
# Backend: implement analytics.service.ts
# - Calculate all metrics (see TECH_SPEC.md section 18)
# - Sharpe, Sortino, MaxDrawdown, VaR, Beta, Correlation

# Frontend: implement /app/analytics
# - Performance tab
# - Risk tab
# - Allocation tab with donut chart
# - Correlation heatmap (D3)
# - AI analytics explanation

git add -A && git commit -m "feat(analytics): implement full analytics engine and UI"
```

---

## 11. PHASE 9 — STRATEGY BUILDER

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 9.1–9.7

```bash
# Backend: strategies.service.ts + strategies.routes.ts
# Frontend: visual rule builder
# - Drag-and-drop condition blocks
# - Indicator parameter inputs
# - AND/OR logic toggle
# - Strategy library with CRUD
# - Natural language input mode

git add -A && git commit -m "feat(strategies): implement visual strategy builder"
```

---

## 12. PHASE 10 — BACKTESTING ENGINE

> **Estimated Time:** 4–5 days | **Tracker:** Tasks 10.1–10.9

```bash
# Backend: backtest.worker.ts (runs in worker thread)
# - Implement all indicators (TECH_SPEC.md section 19)
# - Signal evaluation engine
# - Trade simulation loop
# - Performance metrics calculation
# - WebSocket progress events

# Frontend: /app/backtests/run + /app/backtests/[id]
# - Configuration form
# - Step progress tracker (5 steps)
# - Results dashboard
# - Equity curve chart
# - Trade log table
# - Monthly returns heatmap

git add -A && git commit -m "feat(backtests): implement backtesting engine with progress tracking"
```

---

## 13. PHASE 11 — AI INTEGRATION

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 11.1–11.10

```bash
# Backend: ai.service.ts
# - SSE streaming implementation
# - Context hash + Redis caching
# - Rate limiting enforcement
# - All AI feature prompts (portfolio, tutor, research, etc.)

# Frontend: /app/ai module
# - AI Insights feature cards
# - Streaming response display with cursor
# - Status message rotation
# - Usage quota display
# - AI chat interface

git add -A && git commit -m "feat(ai): implement full AI integration with streaming and caching"
```

---

## 14. PHASE 12 — NEWS & INTELLIGENCE

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 12.1–12.6

```bash
# Backend:
# - newsIngestion.worker.ts (BullMQ job)
# - News summarization AI job
# - Daily brief generation (8am cron)
# - Sentiment calculation

# Frontend: /app/news
# - Market News tab
# - Personalized Feed tab
# - Daily Brief tab
# - Article modal with AI summary

git add -A && git commit -m "feat(news): implement news aggregation and AI intelligence"
```

---

## 15. PHASE 13 — REAL-TIME FEATURES

> **Estimated Time:** 2 days | **Tracker:** Tasks 13.1–13.5

```bash
# Backend: socket.ts WebSocket server
# - Price room subscriptions
# - Portfolio update emissions
# - Notification broadcasting
# - Backtest progress streaming

# Backend: priceAlerts.worker.ts
# - Alert checking cron (every minute during market hours)
# - Deduplication with Redis lock
# - Notification creation

# Frontend: useWebSocket.ts hook
# - Connection management
# - Room subscriptions
# - Live price updates in UI
# - Notification real-time

git add -A && git commit -m "feat(realtime): implement WebSocket price feeds and notifications"
```

---

## 16. PHASE 14 — ADMIN PANEL

> **Estimated Time:** 2 days | **Tracker:** Tasks 14.1–14.6

```bash
# Frontend: /app/admin
# - Users management table
# - System health dashboard
# - AI usage charts
# - Audit log viewer
# - Feature flags management

git add -A && git commit -m "feat(admin): implement admin panel with all management features"
```

---

## 17. PHASE 15 — TESTING

> **Estimated Time:** 3–4 days | **Tracker:** Tasks 15.1–15.8

```bash
# Backend unit tests:
npx jest --coverage
# Target: >70% overall, >80% services, >95% security middleware

# Frontend component tests:
npx vitest --coverage

# E2E tests (Playwright):
npx playwright test
# Cover: auth flow, trade execution, backtest run, AI interaction

git add -A && git commit -m "test: add comprehensive test suite (unit + integration + e2e)"
```

---

## 18. PHASE 16 — DEVOPS & DEPLOYMENT

> **Estimated Time:** 2–3 days | **Tracker:** Tasks 16.1–16.8

```bash
# Dockerfiles for backend + frontend
# GitHub Actions CI/CD pipeline
# AWS setup: EC2, RDS, ElastiCache, S3, CloudFront
# Environment setup in AWS Secrets Manager
# SSL certificate via ACM
# CloudWatch monitoring + alarms

git add -A && git commit -m "chore(devops): add Dockerfiles and GitHub Actions CI/CD pipeline"
git add -A && git commit -m "chore(deploy): configure AWS infrastructure and deployment"
```

---

## 19. CODING CONVENTIONS

### TypeScript
```typescript
// ✅ Always type function parameters and return values
async function getPortfolio(id: string, userId: string): Promise<Portfolio> {}

// ✅ Use interfaces for data shapes, types for unions/utility
interface PortfolioSummary { id: string; name: string; totalValue: number; }
type OrderType = 'MARKET' | 'LIMIT';

// ✅ Use async/await, never raw Promises
// ❌ NEVER use `any` — use `unknown` then narrow
// ❌ NEVER use non-null assertion (!) unless absolutely certain
```

### API Layer
```typescript
// ✅ Every route must have: validate → authenticate → authorize → handler
// ✅ Every service method wrapped in try/catch
// ✅ Every external API call cached appropriately
// ✅ Every sensitive action writes audit log
// ❌ NEVER put business logic in controllers (only in services)
// ❌ NEVER access DB directly in controllers
```

### Frontend
```typescript
// ✅ All data fetching via React Query hooks
// ✅ All forms via React Hook Form + Zod
// ✅ All CSS via Tailwind utility classes
// ✅ Every async UI state: loading skeleton → data/error
// ❌ NEVER use direct fetch() — use Axios client
// ❌ NEVER hardcode colors — use CSS custom property classes
// ❌ NEVER store sensitive data in localStorage
```

### Git Commits (Conventional Commits)
```
feat(scope):     New feature
fix(scope):      Bug fix
chore(scope):    Maintenance, tooling, config
docs(scope):     Documentation
test(scope):     Tests
refactor(scope): Code refactor (no behavior change)
perf(scope):     Performance improvement

Scopes: auth, portfolio, markets, analytics, strategies,
        backtests, ai, news, notifications, admin, db,
        frontend, backend, devops, realtime

Examples:
  feat(auth): add TOTP 2FA with QR code setup
  fix(portfolio): correct average cost calculation on partial sell
  feat(ai): implement streaming portfolio analysis with SSE
  chore(db): add composite index for stock price queries
```

---

## 20. COMMON PATTERNS REFERENCE

### Pattern 1: Protected Route (Express)
```typescript
router.post('/trade',
  validateRequest(tradeSchema),   // Zod validation → 400
  authenticate,                   // JWT → 401
  authorize('USER', 'ADMIN'),     // RBAC → 403
  tradeRateLimit,                 // Rate limit → 429
  tradeController.execute         // Business logic
);
```

### Pattern 2: React Query Hook
```typescript
export function usePortfolio(portfolioId: string) {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfolioApi.getPortfolio(portfolioId),
    staleTime: 30 * 1000,   // 30 seconds
    retry: 2,
    enabled: !!portfolioId,
  });
}
```

### Pattern 3: Loading/Error/Data Component
```tsx
function PortfolioHero({ portfolioId }: { portfolioId: string }) {
  const { data, isLoading, error } = usePortfolio(portfolioId);
  
  if (isLoading) return <PortfolioHeroSkeleton />;
  if (error) return <WidgetError onRetry={() => refetch()} />;
  if (!data) return <EmptyPortfolio />;
  
  return <PortfolioHeroContent portfolio={data} />;
}
```

### Pattern 4: SSE AI Streaming (Frontend)
```typescript
async function streamAIAnalysis(portfolioId: string, onChunk: (text: string) => void) {
  const response = await fetch(`${API_URL}/ai/portfolio/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolioId }),
  });
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'token') onChunk(data.content);
    }
  }
}
```

### Pattern 5: Cache Utility
```typescript
// Always use getCachedOrFetch — never inline Redis calls in routes
const data = await getCachedOrFetch(
  `sectors`,       // Key
  300,             // TTL seconds
  () => fetchSectorData()  // Fallback
);
```

---

*End of QuantEdge Implementation Guide v1.0.0*
*See TRACKER.md for task-by-task progress tracking and GitHub commit requirements*
