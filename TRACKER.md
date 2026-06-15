# QuantEdge — Project Tracker

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Rule:** After EVERY task marked ✅, run the commit command shown. No batching. One task = one commit.
> **GitHub Repo:** `https://github.com/YOUR_USERNAME/quantedge`
> **Branch Strategy:** `main` (prod) ← `develop` (integration) ← `feature/*` (work branches)

---

## HOW TO USE THIS FILE

```
[ ] = Not started
[~] = In progress
[✅] = Complete + committed to GitHub
[⏸] = Blocked / paused
[❌] = Skipped (document reason)
```

**After each ✅ task:**
1. Stage files: `git add -A`
2. Run the commit command shown under that task
3. Push: `git push origin develop`
4. Update this file: change `[ ]` to `[✅]`
5. Move to next task

**Before starting a new Phase:**
- Read the corresponding section in `IMPLEMENTATION.md`
- Cross-reference `TECH_SPEC.md` and `SCHEMA.md` for the relevant module
- Never start Phase N+1 until Phase N is fully committed

---

## QUICK STATUS DASHBOARD

```
Phase 1  — Project Scaffold        [✅] 8/8   tasks  | commit: b29f314, 845e137, 05f561e
Phase 2  — Database & Core         [✅] 6/6   tasks  | commit: 845e137
Phase 3  — Authentication          [✅] 9/12  tasks  | commit: 845e137 (3 tasks pending: email templates, rate limiting, integration tests)
Phase 4  — Market Data             [~]  0/8   tasks  | IN PROGRESS
Phase 5  — Portfolio & Trading     [ ]  0/10  tasks
Phase 6  — Frontend Foundation     [~]  2/8   tasks  | layout, providers done
Phase 7  — Dashboard & Core UI     [ ]  0/9   tasks
Phase 8  — Analytics Engine        [ ]  0/6   tasks
Phase 9  — Strategy Builder        [ ]  0/7   tasks
Phase 10 — Backtesting Engine      [ ]  0/9   tasks
Phase 11 — AI Integration          [ ]  0/10  tasks
Phase 12 — News & Intelligence     [ ]  0/6   tasks
Phase 13 — Real-Time Features      [ ]  0/5   tasks
Phase 14 — Admin Panel             [ ]  0/6   tasks
Phase 15 — Testing                 [ ]  0/8   tasks
Phase 16 — DevOps & Deployment     [ ]  0/8   tasks
─────────────────────────────────────────────
TOTAL                              [~] 25/126 tasks completed

LAST COMMIT: 151d6f5 — 2026-06-15 | chore: exclude Maven target/ build directory
GIT BRANCH:  develop
```

---

## GITHUB REPOSITORY SETUP

### Initial Setup (Do Once)

```bash
# 1. Create repo on GitHub
# Go to https://github.com/new
# Name: quantedge
# Visibility: Private (change to Public when ready to showcase)
# DO NOT initialize with README (we'll push our own)

# 2. Clone and set up locally
git clone https://github.com/YOUR_USERNAME/quantedge.git
cd quantedge

# 3. Create branch structure
git checkout -b develop
git push -u origin develop

# 4. Set default branch to develop on GitHub
# Settings → Branches → Default branch → develop

# 5. Create branch protection rules (Settings → Branches)
# Branch: main
# ✅ Require pull request before merging
# ✅ Require status checks to pass before merging
# ✅ Require branches to be up to date before merging

# 6. Add GitHub Secrets (Settings → Secrets → Actions)
# POLYGON_API_KEY
# FINNHUB_API_KEY
# ALPHA_VANTAGE_API_KEY
# ANTHROPIC_API_KEY
# RESEND_API_KEY
# DATABASE_URL (for CI)
# REDIS_URL (for CI)
# JWT_PRIVATE_KEY
# JWT_PUBLIC_KEY
```

### Feature Branch Workflow

```bash
# For each Phase, create a feature branch:
git checkout develop
git checkout -b feature/phase-1-scaffold
# ... do work, commit each task ...
git push origin feature/phase-1-scaffold
# Create PR: feature/phase-1-scaffold → develop on GitHub
# Merge after review
```

---

## PHASE 1 — PROJECT SCAFFOLD
> **Ref:** IMPLEMENTATION.md §3 | **Est:** 1–2 days
> **Branch:** `feature/phase-1-scaffold`

```bash
git checkout develop && git checkout -b feature/phase-1-scaffold
```

### Task 1.1 — GitHub Repository
```
[ ] Create GitHub repo at https://github.com/new (name: quantedge)
[ ] Set up branch protection rules
[ ] Add GitHub Secrets for CI/CD
```
**Commit:**
```bash
git add .gitignore README.md
git commit -m "chore: initialize quantedge repository"
git push origin feature/phase-1-scaffold
```

---

### Task 1.2 — Monorepo Structure with Turborepo
```
[ ] Create root package.json with workspaces
[ ] Create turbo.json
[ ] Create apps/ and packages/ directories
[ ] Install Turborepo
```
**Commit:**
```bash
git add -A
git commit -m "chore: setup turborepo monorepo with workspace structure"
```

---

### Task 1.3 — Docker Compose for Local Dev
```
[ ] Create docker-compose.yml (PostgreSQL 16 + Redis 7)
[ ] Verify containers start: docker compose up -d
[ ] Verify PostgreSQL accessible on :5432
[ ] Verify Redis accessible on :6379
```
**Commit:**
```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose for PostgreSQL and Redis local development"
```

---

### Task 1.4 — Backend Project Scaffold
```
[ ] Create apps/backend directory structure (all folders from IMPLEMENTATION.md §2)
[ ] Initialize package.json
[ ] Install all backend dependencies (TECH_STACK.md §13.1)
[ ] Configure tsconfig.json
[ ] Create Express type augmentation (express.d.ts)
[ ] Create .env from .env.example
[ ] Generate RSA key pair for JWT
```
**Commit:**
```bash
git add apps/backend/
git commit -m "feat(backend): scaffold Express.js backend with TypeScript configuration"
```

---

### Task 1.5 — Frontend Project Scaffold
```
[ ] Create Next.js 14 app with App Router (npx create-next-app@14)
[ ] Install all frontend dependencies (TECH_STACK.md §13.2)
[ ] Initialize shadcn/ui
[ ] Add all shadcn components
[ ] Configure .env.local
```
**Commit:**
```bash
git add apps/frontend/
git commit -m "feat(frontend): scaffold Next.js 14 with shadcn/ui and Tailwind CSS"
```

---

### Task 1.6 — Shared Package
```
[ ] Create packages/shared directory
[ ] Set up shared TypeScript types (portfolio, strategy, api)
[ ] Configure as workspace package
[ ] Link to both frontend and backend
```
**Commit:**
```bash
git add packages/
git commit -m "feat(shared): add shared TypeScript types package"
```

---

### Task 1.7 — Environment Templates
```
[ ] Create apps/backend/.env.example with all variables from TECH_STACK.md §14.1
[ ] Create apps/frontend/.env.local.example from TECH_STACK.md §14.2
[ ] Verify .env files are in .gitignore (CRITICAL — check before commit)
[ ] Fill in actual API keys in apps/backend/.env (NOT committed)
```
**Commit:**
```bash
git add apps/backend/.env.example apps/frontend/.env.local.example
git commit -m "chore: add environment variable templates with documentation"
```

---

### Task 1.8 — ESLint + Prettier + README
```
[ ] Configure .eslintrc.json (TypeScript rules)
[ ] Configure .prettierrc
[ ] Write README.md (project overview, setup guide, architecture diagram)
[ ] Add badges (build status, license, tech stack)
```
**Commit:**
```bash
git add .eslintrc.json .prettierrc README.md
git commit -m "chore: add ESLint, Prettier, and project README"
```

**Phase 1 Complete — Merge to develop:**
```bash
git push origin feature/phase-1-scaffold
# Create PR on GitHub → merge to develop
git checkout develop && git pull
```

---

## PHASE 2 — DATABASE & CORE BACKEND
> **Ref:** IMPLEMENTATION.md §4 | SCHEMA.md | **Est:** 2–3 days
> **Branch:** `feature/phase-2-database`

```bash
git checkout develop && git checkout -b feature/phase-2-database
```

### Task 2.1 — Prisma Schema
```
[ ] Copy complete schema from SCHEMA.md §2 into apps/backend/prisma/schema.prisma
[ ] Run: npx prisma migrate dev --name init_schema
[ ] Run: npx prisma generate
[ ] Verify all tables exist in database
[ ] Open Prisma Studio to confirm: npx prisma studio
```
**Commit:**
```bash
git add apps/backend/prisma/
git commit -m "feat(db): add complete Prisma schema with all entities and enums"
```

---

### Task 2.2 — Database Indexes
```
[ ] Create migration for custom SQL indexes (SCHEMA.md §4)
[ ] Add pg_trgm extension for stock search
[ ] Add full-text search index on stocks table
[ ] Add all performance-critical composite indexes
[ ] Run migration and verify indexes created
```
**Commit:**
```bash
git add apps/backend/prisma/migrations/
git commit -m "feat(db): add performance indexes and full-text search for stocks"
```

---

### Task 2.3 — Core App + Server Setup
```
[ ] Implement apps/backend/src/app.ts (IMPLEMENTATION.md §4.2)
[ ] Implement apps/backend/src/server.ts
[ ] Configure all security middleware (Helmet, CORS, HPP, compression)
[ ] Add health check endpoint: GET /health
[ ] Test: curl http://localhost:8080/health
```
**Commit:**
```bash
git add apps/backend/src/app.ts apps/backend/src/server.ts
git commit -m "feat(backend): setup Express app with security middleware stack"
```

---

### Task 2.4 — Redis Client + Cache Utilities
```
[ ] Implement apps/backend/src/config/redis.ts
[ ] Implement getCachedOrFetch() pattern
[ ] Implement stale-while-revalidate pattern
[ ] Test Redis connection
```
**Commit:**
```bash
git add apps/backend/src/config/redis.ts
git commit -m "feat(backend): add Redis client with cache-aside and SWR utilities"
```

---

### Task 2.5 — Error Classes + Global Handler
```
[ ] Implement all AppError subclasses (IMPLEMENTATION.md §4.4)
[ ] Implement global error handler middleware (TECH_SPEC.md §15.2)
[ ] Implement 404 not found handler
[ ] Add express-async-errors for async route error catching
```
**Commit:**
```bash
git add apps/backend/src/utils/errors.ts apps/backend/src/middleware/errorHandler.ts
git commit -m "feat(backend): add typed error classes and global error handler"
```

---

### Task 2.6 — Database Seed
```
[ ] Implement apps/backend/prisma/seed.ts (SCHEMA.md §5)
[ ] Add admin user + test user
[ ] Add top 50 US stocks reference data
[ ] Add feature flags
[ ] Run: npx ts-node prisma/seed.ts
[ ] Verify seed data in Prisma Studio
```
**Commit:**
```bash
git add apps/backend/prisma/seed.ts
git commit -m "feat(db): add database seed with stocks, users, and feature flags"
```

**Phase 2 Complete — Merge to develop:**
```bash
git push origin feature/phase-2-database
# PR → develop
```

---

## PHASE 3 — AUTHENTICATION SYSTEM
> **Ref:** IMPLEMENTATION.md §5 | TECH_SPEC.md §2, §12 | **Est:** 3–4 days
> **Branch:** `feature/phase-3-auth`

```bash
git checkout develop && git checkout -b feature/phase-3-auth
```

### Task 3.1 — Auth Zod Schemas
```
[ ] Create apps/backend/src/schemas/auth.schema.ts
[ ] registerSchema, loginSchema, verify2faSchema, forgotSchema
[ ] resetSchema, setup2faSchema, enable2faSchema
[ ] All validation rules from TECH_SPEC.md §14.2
```
**Commit:**
```bash
git add apps/backend/src/schemas/auth.schema.ts
git commit -m "feat(auth): add Zod validation schemas for all auth endpoints"
```

---

### Task 3.2 — JWT Utilities
```
[ ] Implement apps/backend/src/utils/jwt.ts
[ ] signAccessToken() using RS256 + private key
[ ] verifyAccessToken() using public key
[ ] generateRefreshToken() using crypto.randomBytes(64)
[ ] hashToken() using SHA-256 (for DB storage)
```
**Commit:**
```bash
git add apps/backend/src/utils/jwt.ts
git commit -m "feat(auth): add JWT utilities with RS256 asymmetric signing"
```

---

### Task 3.3 — Auth Middleware
```
[ ] Implement authenticate.ts (TECH_SPEC.md §12.2)
[ ] Implement authorize.ts RBAC middleware (TECH_SPEC.md §12.3)
[ ] Implement validateRequest.ts with Zod (TECH_SPEC.md §12.4)
[ ] Implement sanitizeInputs.ts (TECH_SPEC.md §12.5)
```
**Commit:**
```bash
git add apps/backend/src/middleware/
git commit -m "feat(auth): add authenticate, authorize, validate, and sanitize middleware"
```

---

### Task 3.4 — Rate Limiters
```
[ ] Implement all rate limiters from TECH_SPEC.md §13
[ ] globalRateLimit, authRateLimit, apiRateLimit
[ ] aiRateLimit, searchRateLimit, tradeRateLimit
[ ] Use Redis store (rate-limit-redis) for distributed limiting
```
**Commit:**
```bash
git add apps/backend/src/middleware/rateLimiter.ts
git commit -m "feat(security): add tiered rate limiting with Redis-backed store"
```

---

### Task 3.5 — Email Service
```
[ ] Implement apps/backend/src/services/email.service.ts
[ ] sendVerificationEmail() with HTML template
[ ] sendPasswordResetEmail() with HTML template
[ ] sendPriceAlertEmail() for triggered alerts
[ ] sendDailyDigestEmail() for daily portfolio summary
[ ] Test email delivery with Resend sandbox
```
**Commit:**
```bash
git add apps/backend/src/services/email.service.ts
git commit -m "feat(auth): add email service with Resend and HTML email templates"
```

---

### Task 3.6 — Audit Log Utility
```
[ ] Implement apps/backend/src/utils/auditLog.ts
[ ] createAuditLog(userId, action, metadata, request) helper
[ ] Used by every service that modifies sensitive data
```
**Commit:**
```bash
git add apps/backend/src/utils/auditLog.ts
git commit -m "feat(security): add audit log utility for sensitive action tracking"
```

---

### Task 3.7 — Auth Service Core
```
[ ] Implement apps/backend/src/services/auth.service.ts
[ ] register() — hash, create user, send verification email
[ ] verifyEmail() — validate token, activate account
[ ] login() — compare hash, check lock, brute force protection
[ ] refreshToken() — rotate tokens
[ ] logout() — invalidate refresh token
```
**Commit:**
```bash
git add apps/backend/src/services/auth.service.ts
git commit -m "feat(auth): implement core auth service (register, login, refresh, logout)"
```

---

### Task 3.8 — Auth Service — Password & 2FA
```
[ ] forgotPassword() — generate token, send email
[ ] resetPassword() — apply new password, invalidate all sessions
[ ] setup2FA() — generate TOTP secret + QR code
[ ] enable2FA() — verify code, encrypt + store secret
[ ] disable2FA() — verify credentials, remove 2FA
[ ] getSessions() — list active refresh tokens
[ ] revokeSession() — delete specific token
```
**Commit:**
```bash
git add apps/backend/src/services/auth.service.ts
git commit -m "feat(auth): implement 2FA, password reset, and session management"
```

---

### Task 3.9 — Auth Controller
```
[ ] Implement apps/backend/src/controllers/auth.controller.ts
[ ] Thin controllers — call service, format response, handle errors
[ ] All methods from TECH_SPEC.md §2
```
**Commit:**
```bash
git add apps/backend/src/controllers/auth.controller.ts
git commit -m "feat(auth): add auth controller wiring service to HTTP responses"
```

---

### Task 3.10 — Auth Routes
```
[ ] Implement apps/backend/src/routes/auth.routes.ts
[ ] Wire: validateRequest → authenticate → authorize → rateLimit → controller
[ ] All routes from TECH_SPEC.md §2
[ ] Test all routes with curl or Postman
```
**Commit:**
```bash
git add apps/backend/src/routes/auth.routes.ts
git commit -m "feat(auth): add all authentication routes with middleware chain"
```

---

### Task 3.11 — Auth Integration Tests
```
[ ] Test: POST /auth/register (success, duplicate email, weak password)
[ ] Test: POST /auth/login (success, wrong password, locked account)
[ ] Test: POST /auth/refresh (success, expired token, invalid token)
[ ] Test: POST /auth/logout (success)
[ ] Test: POST /auth/forgot-password (always returns 200)
[ ] Test: POST /auth/reset-password (success, expired link, used link)
[ ] Test: Rate limiting (exceed auth rate limit)
[ ] Test: SQL injection attempt in email field
[ ] All tests pass: npx jest --testPathPattern=auth
```
**Commit:**
```bash
git add apps/backend/src/__tests__/integration/routes/auth.test.ts
git commit -m "test(auth): add comprehensive auth integration tests with edge cases"
```

---

### Task 3.12 — Auth Frontend Pages
```
[ ] /auth/login — form, error states, 2FA redirect, loading button
[ ] /auth/register — form, password strength meter, loading
[ ] /auth/forgot-password — form, success state
[ ] /auth/reset-password — form, token validation
[ ] /auth/verify-email — auto-verify on load, success/error states
[ ] /auth/two-factor — 6-digit input, auto-submit, error state
[ ] Auth store (Zustand) — access token in memory, user in persist
[ ] Axios interceptor for auto-refresh (IMPLEMENTATION.md §8.3)
[ ] Route protection middleware (redirect /app/* if not authed)
```
**Commit:**
```bash
git add apps/frontend/src/app/\(auth\)/ apps/frontend/src/store/ apps/frontend/src/lib/api/client.ts
git commit -m "feat(frontend): implement all auth pages with complete form validation and UX"
```

**Phase 3 Complete — Merge to develop:**
```bash
git push origin feature/phase-3-auth
# PR → develop
```

---

## PHASE 4 — MARKET DATA LAYER
> **Ref:** IMPLEMENTATION.md §6 | TECH_SPEC.md §4 | **Est:** 2–3 days
> **Branch:** `feature/phase-4-market-data`

### Task 4.1 — Polygon Provider
```
[ ] Implement apps/backend/src/providers/polygon.provider.ts
[ ] getQuote(symbol) — cached 15s
[ ] getHistoricalPrices(symbol, from, to, interval) — cached 1h
[ ] getMarketMovers(type) — cached 60s
[ ] searchStocks(query) — not cached (live search)
[ ] getMarketSnapshot() — cached 15s
```
**Commit:**
```bash
git commit -m "feat(markets): implement Polygon.io market data provider with caching"
```

---

### Task 4.2 — Finnhub Provider
```
[ ] Implement apps/backend/src/providers/finnhub.provider.ts
[ ] getCompanyNews(symbol) — cached 15m
[ ] getStockMetrics(symbol) — cached 1h
[ ] getEarningsCalendar(from, to) — cached 4h
[ ] getNewsSentiment(symbol) — cached 1h
[ ] getMarketNews() — cached 15m
```
**Commit:**
```bash
git commit -m "feat(markets): implement Finnhub provider for news and fundamentals"
```

---

### Task 4.3 — Alpha Vantage Provider (Fallback)
```
[ ] Implement apps/backend/src/providers/alphaVantage.provider.ts
[ ] getHistoricalPrices() — fallback for Polygon
[ ] getRiskFreeRate() — Fed Funds Rate for Sharpe calculation, cached 24h
[ ] getCompanyOverview(symbol) — cached 24h
```
**Commit:**
```bash
git commit -m "feat(markets): implement Alpha Vantage provider as data fallback"
```

---

### Task 4.4 — Market Data Factory (Resilience)
```
[ ] Implement apps/backend/src/providers/marketData.factory.ts
[ ] getQuoteWithFallback(symbol) — Polygon → Finnhub → stale cache
[ ] getHistoricalWithFallback(symbol, range) — Polygon → Alpha Vantage
[ ] Circuit breaker: track failure counts per provider
[ ] Log all provider failures with provider name
```
**Commit:**
```bash
git commit -m "feat(markets): add market data factory with fallback chain and circuit breaker"
```

---

### Task 4.5 — Markets Service
```
[ ] Implement apps/backend/src/services/markets.service.ts
[ ] getOverview() — indices + market status
[ ] searchStocks(query) — DB trigram search first, provider fallback
[ ] getStockDetail(symbol) — quote + stats + watchlist status
[ ] getChart(symbol, range) — historical OHLCV for TradingView
[ ] getMovers(type) — gainers/losers/active
[ ] getSectors() — sector performance breakdown
[ ] getEarningsCalendar(from, to)
[ ] getWatchlist(userId) — with live prices
[ ] addToWatchlist(userId, symbol)
[ ] removeFromWatchlist(userId, symbol)
```
**Commit:**
```bash
git commit -m "feat(markets): implement markets service with all data operations"
```

---

### Task 4.6 — Markets Routes + Controller
```
[ ] Implement routes: GET /markets/overview, /search, /stocks/:symbol
[ ] GET /markets/stocks/:symbol/chart, /movers, /sectors
[ ] GET /markets/calendar/earnings
[ ] GET/POST/DELETE /markets/watchlist
[ ] Test all endpoints with Postman/curl
```
**Commit:**
```bash
git commit -m "feat(markets): add all market data routes and controllers"
```

---

### Task 4.7 — Stock Reference Data Sync
```
[ ] Create BullMQ job: syncStockReference
[ ] Fetch active US tickers from Polygon
[ ] Upsert into stocks table (symbol, name, exchange, sector)
[ ] Schedule: run once on startup, then weekly
[ ] Run initial sync to populate stocks table
```
**Commit:**
```bash
git commit -m "feat(markets): add stock reference data sync job for all US tickers"
```

---

### Task 4.8 — Markets Frontend
```
[ ] /app/markets/overview — indices, sector heatmap, movers
[ ] /app/markets/stocks/[symbol] — stock detail page
[ ] StockSearch component (debounced, dropdown results)
[ ] PriceChart component (TradingView, time ranges, chart types)
[ ] WatchlistWidget (sparklines, add/remove)
[ ] All with skeleton loading and error states
```
**Commit:**
```bash
git commit -m "feat(frontend): implement markets module with stock detail and search"
```

**Phase 4 Complete — Merge to develop:**
```bash
git push origin feature/phase-4-market-data && # PR → develop
```

---

## PHASE 5 — PORTFOLIO & TRADING
> **Ref:** IMPLEMENTATION.md §7 | TECH_SPEC.md §3 | **Est:** 3–4 days
> **Branch:** `feature/phase-5-portfolio`

### Task 5.1 — Portfolio Zod Schemas
```
[ ] createPortfolioSchema, tradeSchema, cashSchema
[ ] All validation rules from TECH_SPEC.md §14.1
```
**Commit:** `feat(portfolio): add portfolio and trade validation schemas`

### Task 5.2 — Portfolio Service — CRUD
```
[ ] getPortfolios(userId) with live prices from Redis
[ ] createPortfolio(userId, data) with 5-portfolio limit check
[ ] getPortfolio(portfolioId, userId) with holdings enriched
[ ] updatePortfolio(portfolioId, data)
[ ] deletePortfolio(portfolioId, userId) soft delete
```
**Commit:** `feat(portfolio): implement portfolio CRUD service with live price enrichment`

### Task 5.3 — Trade Execution Service
```
[ ] executeTrade() inside Prisma $transaction (IMPLEMENTATION.md §7 Step 5.1)
[ ] BUY: cash check, holding upsert, average cost calc
[ ] SELL: shares check, holding update/delete, proceeds credit
[ ] Transaction record creation
[ ] Audit log: TRADE_BUY or TRADE_SELL
[ ] WebSocket emit: portfolio:update
```
**Commit:** `feat(portfolio): implement atomic trade execution with Prisma transactions`

### Task 5.4 — Portfolio Chart Data
```
[ ] getChart(portfolioId, range, benchmark) from portfolio_snapshots
[ ] Normalize benchmark to same starting value (100%)
[ ] Handle missing snapshot dates (interpolate or skip)
```
**Commit:** `feat(portfolio): add portfolio performance chart with benchmark comparison`

### Task 5.5 — Cash Management Service
```
[ ] manageCash(portfolioId, type, amount)
[ ] DEPOSIT: increment cash_balance, create CASH_DEPOSIT transaction
[ ] WITHDRAWAL: check sufficient balance, decrement
[ ] Max balance: $10,000,000
```
**Commit:** `feat(portfolio): add virtual cash deposit and withdrawal`

### Task 5.6 — Daily Portfolio Snapshot Job
```
[ ] BullMQ job: snapshotPortfolios (runs 4:30pm ET on trading days)
[ ] For each active portfolio: calculate total_value, holdings_value, daily_return
[ ] Create portfolio_snapshot record
[ ] Used as source for performance charts
```
**Commit:** `feat(portfolio): add daily portfolio snapshot background job`

### Task 5.7 — Portfolio Routes + Controllers
```
[ ] All routes from TECH_SPEC.md §3
[ ] GET/POST /portfolios, GET/PUT/DELETE /portfolios/:id
[ ] GET /portfolios/:id/chart, GET /portfolios/:id/transactions
[ ] POST /portfolios/:id/trade, POST /portfolios/:id/cash
[ ] Test trade execution with Postman
```
**Commit:** `feat(portfolio): add all portfolio routes with full middleware chain`

### Task 5.8 — Portfolio Integration Tests
```
[ ] Test: create portfolio, buy stock, sell stock, view holdings
[ ] Test: insufficient cash error, insufficient shares error
[ ] Test: portfolio limit (6th portfolio rejected)
[ ] Test: ownership check (cannot access other user's portfolio)
[ ] Test: average cost calculation (multiple buys at different prices)
```
**Commit:** `test(portfolio): add portfolio and trade execution integration tests`

### Task 5.9 — Portfolio Frontend — Holdings + Transactions
```
[ ] /app/portfolio/[portfolioId] — full portfolio page
[ ] Holdings table with live P&L (color coded)
[ ] Transactions table (paginated, filterable)
[ ] Performance chart tab
[ ] Allocation tab with donut chart (Recharts)
[ ] Portfolio selector dropdown
```
**Commit:** `feat(frontend): implement portfolio module with holdings and transactions`

### Task 5.10 — Trade Modal
```
[ ] TradeModal component (Buy/Sell form)
[ ] Order type toggle (Market/Limit)
[ ] Shares stepper (+1, +10, +100 buttons)
[ ] Real-time estimated cost calculation
[ ] Available cash display
[ ] All button states (idle, loading, success, error)
[ ] Client-side pre-validation before API call
```
**Commit:** `feat(frontend): add trade modal with real-time cost calculation and validation`

**Phase 5 Complete — Merge to develop.**

---

## PHASE 6 — FRONTEND FOUNDATION
> **Ref:** IMPLEMENTATION.md §8 | DESIGN.md | **Est:** 2–3 days
> **Branch:** `feature/phase-6-frontend-foundation`

### Task 6.1 — Design Tokens (Tailwind + CSS)
```
[ ] Apply all color tokens from DESIGN.md §3.1 to globals.css
[ ] Extend tailwind.config.ts with all custom colors
[ ] Add shimmer keyframe for skeletons
[ ] Add pulse-ring keyframe for live indicators
[ ] Add all CSS custom properties as Tailwind tokens
```
**Commit:** `feat(design): add complete design token system with Tailwind integration`

### Task 6.2 — Skeleton Components
```
[ ] SkeletonCard, SkeletonText, SkeletonTitle, SkeletonNumber
[ ] SkeletonTable (header + N rows), SkeletonChart
[ ] SkeletonBadge, SkeletonAvatar, SkeletonSpark
[ ] All use shimmer animation from design tokens
```
**Commit:** `feat(frontend): add complete skeleton loading component library`

### Task 6.3 — Empty State Components
```
[ ] All 8 empty states from DESIGN.md §11
[ ] EmptyPortfolio, EmptyWatchlist, EmptyStrategies
[ ] EmptyBacktests, EmptyNews, EmptyNotifications
[ ] EmptySearch, EmptyTransactions
[ ] Each with icon, title, description, CTA button
```
**Commit:** `feat(frontend): add empty state components for all data collections`

### Task 6.4 — Error Components
```
[ ] WidgetError (in-widget retry button)
[ ] PageError (full page error with retry)
[ ] InlineFieldError (form field error)
[ ] Toast notifications (sonner integration)
[ ] All error states from DESIGN.md §12
```
**Commit:** `feat(frontend): add error state components and toast notification system`

### Task 6.5 — App Layout (Sidebar + Topbar)
```
[ ] Sidebar.tsx — nav items, active state, collapse behavior
[ ] Topbar.tsx — logo, search, AI button, notifications, avatar
[ ] BottomNav.tsx — 5 items for mobile
[ ] app/(app)/layout.tsx — compose layout components
[ ] Responsive behavior: sidebar hidden on mobile, bottom nav shown
```
**Commit:** `feat(frontend): implement responsive app shell with sidebar and topbar`

### Task 6.6 — React Query Setup
```
[ ] apps/frontend/src/lib/queryClient.ts — configure QueryClient
[ ] Providers wrapper component (QueryClientProvider, ThemeProvider)
[ ] Default staleTime: 30s, retry: 2
[ ] Error boundary integration
```
**Commit:** `feat(frontend): configure React Query with optimized defaults`

### Task 6.7 — Socket.io Client
```
[ ] apps/frontend/src/lib/socket.ts — singleton Socket.io client
[ ] Auto-authenticate with access token on connect
[ ] useWebSocket() hook for room subscription management
[ ] Handle reconnection gracefully
```
**Commit:** `feat(frontend): add WebSocket client with authentication and reconnection`

### Task 6.8 — Utility Functions
```
[ ] utils.ts: cn(), formatCurrency($), formatPercent(%), formatNumber(K/M/B)
[ ] formatDate(), formatRelativeTime(), formatMarketCap()
[ ] constants.ts: API_URL, SOCKET_URL, TIME_RANGES, CHART_COLORS
[ ] validators.ts: shared Zod schemas for frontend forms
```
**Commit:** `feat(frontend): add utility functions and shared constants`

**Phase 6 Complete — Merge to develop.**

---

## PHASE 7 — DASHBOARD & CORE UI
> **Ref:** IMPLEMENTATION.md §9 | DESIGN.md §17 | APPFLOW.md §4 | **Est:** 3–4 days
> **Branch:** `feature/phase-7-dashboard`

### Task 7.1 — Portfolio Hero Widget
```
[ ] Shows: value, daily P&L, total return, risk score, health score
[ ] Portfolio selector dropdown
[ ] Color-coded P&L (green/red with icons)
[ ] Animated number counter on load
[ ] Skeleton loading state
```
**Commit:** `feat(dashboard): implement portfolio hero widget with animated metrics`

### Task 7.2 — Performance Chart Widget
```
[ ] TradingView area chart integrated
[ ] Time range tabs: 1D/1W/1M/3M/1Y/All
[ ] Purple line + gradient fill
[ ] Crosshair tooltip with date + value
[ ] Auto-resize on container change
[ ] Skeleton: flat gray rectangle
```
**Commit:** `feat(dashboard): add TradingView performance chart with time range controls`

### Task 7.3 — Watchlist Widget
```
[ ] Shows top 8 watchlist items
[ ] Ticker, price, % change, 7-day sparkline
[ ] Color-coded green/red
[ ] "Add Stock" quick-add button
[ ] "View All" link
[ ] Real-time price updates via WebSocket
```
**Commit:** `feat(dashboard): implement watchlist widget with sparklines and live prices`

### Task 7.4 — Market Movers Widget
```
[ ] Three tabs: Gainers / Losers / Active
[ ] Shows top 5 per tab
[ ] Percentage bar visualization
[ ] Click → navigate to stock detail
[ ] Auto-refresh every 60s with subtle indicator
```
**Commit:** `feat(dashboard): add market movers widget with tab navigation`

### Task 7.5 — AI Insights Panel
```
[ ] Collapsed default view with latest insight preview
[ ] "Analyze Portfolio" button with AI variant styling
[ ] Status messages rotating while generating
[ ] Streaming text display with cursor
[ ] Feature type tabs (Portfolio / Risk / Performance)
[ ] Usage quota badge
```
**Commit:** `feat(dashboard): add AI insights panel with streaming response display`

### Task 7.6 — News Widget
```
[ ] 5 most recent articles
[ ] Source badge, headline, timestamp, sentiment badge
[ ] Click → Article modal with AI summary
[ ] "View All" link
[ ] Skeleton: 5 row skeletons
```
**Commit:** `feat(dashboard): implement news widget with article preview modal`

### Task 7.7 — Daily AI Brief Widget
```
[ ] Show today's brief (fetched from /news/brief/today)
[ ] Truncated preview with "Expand" button
[ ] Full brief in modal
[ ] Sentiment indicator on brief
[ ] "Not yet generated" state for early morning
```
**Commit:** `feat(dashboard): add daily AI market brief widget`

### Task 7.8 — Market Status Indicator
```
[ ] "MARKET OPEN" green pulse or "MARKET CLOSED" gray
[ ] Shows time until next open/close
[ ] "15 MIN DELAY" badge next to all price data
[ ] Real-time countdown timer
```
**Commit:** `feat(dashboard): add live market status indicator with countdown`

### Task 7.9 — Dashboard Page Composition
```
[ ] apps/frontend/src/app/(app)/dashboard/page.tsx
[ ] All widgets in responsive grid (DESIGN.md §13.1 layout)
[ ] Parallel data fetching with React Query
[ ] Full skeleton on initial load
[ ] All widgets individually handle their loading/error states
[ ] Test on mobile viewport (responsive grid collapse)
```
**Commit:** `feat(dashboard): compose full dashboard with responsive widget grid`

**Phase 7 Complete — Merge to develop.**

---

## PHASE 8 — ANALYTICS ENGINE
> **Ref:** IMPLEMENTATION.md §10 | TECH_SPEC.md §18 | **Est:** 2–3 days
> **Branch:** `feature/phase-8-analytics`

### Task 8.1 — Analytics Calculation Utilities
```
[ ] apps/backend/src/utils/analytics.ts
[ ] annualizedReturn(), annualizedVolatility()
[ ] sharpeRatio(), sortinoRatio()
[ ] maxDrawdown(), valueAtRisk()
[ ] beta(), alpha(), correlationMatrix()
[ ] diversificationScore(), calmarRatio()
[ ] All formulas from TECH_SPEC.md §18
[ ] Unit tests for each calculation
```
**Commit:** `feat(analytics): implement all financial analytics calculations with tests`

### Task 8.2 — Analytics Service
```
[ ] Implement apps/backend/src/services/analytics.service.ts
[ ] computeAnalytics(portfolioId, period, benchmark)
[ ] Cache result in Redis (5min TTL)
[ ] Load portfolio snapshots for period
[ ] Fetch benchmark returns (SPY/QQQ/DIA)
[ ] Compute all metrics, return structured response
```
**Commit:** `feat(analytics): implement analytics service with Redis caching`

### Task 8.3 — Analytics Routes
```
[ ] GET /analytics/:portfolioId (TECH_SPEC.md §5)
[ ] POST /analytics/:portfolioId/export (queue PDF job)
[ ] GET /analytics/:portfolioId/monthly-returns
```
**Commit:** `feat(analytics): add analytics API routes`

### Task 8.4 — Analytics Frontend — Performance Tab
```
[ ] Context bar: portfolio selector, period picker, benchmark selector
[ ] 4-metric summary cards (Return, Sharpe, MaxDD, VaR)
[ ] Cumulative return chart (portfolio vs benchmark)
[ ] Monthly returns bar chart (green/red by sign)
[ ] Best/worst periods table
```
**Commit:** `feat(analytics): implement performance analytics tab`

### Task 8.5 — Analytics Frontend — Risk + Allocation Tabs
```
[ ] Risk tab: volatility gauge, Sharpe/Sortino cards, VaR histogram, drawdown chart
[ ] Allocation tab: sector donut (Recharts), historical allocation area chart
[ ] Correlation heatmap (D3 color scale, green → red)
[ ] Benchmark tab: Alpha/Beta cards, tracking error, information ratio
```
**Commit:** `feat(analytics): implement risk, allocation, and benchmark analytics tabs`

### Task 8.6 — AI Analytics Explanation
```
[ ] "Explain My Analytics" button in analytics page
[ ] Calls POST /ai/portfolio/analyze with analysisType=full
[ ] Streaming response displayed below metrics
[ ] Plain-English explanation of all key metrics
[ ] Copy + share buttons on completion
```
**Commit:** `feat(analytics): add AI-powered plain-English analytics explanation`

**Phase 8 Complete — Merge to develop.**

---

## PHASE 9 — STRATEGY BUILDER
> **Est:** 3–4 days | **Branch:** `feature/phase-9-strategies`

### Task 9.1 — Strategy Schema + Service
```
[ ] createStrategySchema with rule validation (TECH_SPEC.md §6)
[ ] apps/backend/src/services/strategies.service.ts
[ ] CRUD: create, get, update, delete, duplicate
[ ] Validate rules for conflicts (e.g., SMA period must be > 0)
```
**Commit:** `feat(strategies): implement strategy service with rule validation`

### Task 9.2 — Indicator Library (Backend)
```
[ ] apps/backend/src/utils/indicators.ts
[ ] SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP, OBV
[ ] Each returns (number | null)[] array
[ ] Unit tests for each indicator with known values
```
**Commit:** `feat(strategies): add complete technical indicator library with tests`

### Task 9.3 — Strategy Routes + Controller
```
[ ] All routes from TECH_SPEC.md §6
[ ] GET/POST /strategies, GET/PUT/DELETE /strategies/:id
[ ] POST /strategies/:id/analyze (AI confidence)
```
**Commit:** `feat(strategies): add strategy routes and controller`

### Task 9.4 — Visual Rule Builder Frontend
```
[ ] Condition block component (indicator + condition + comparator)
[ ] AND/OR connector toggle between blocks
[ ] Drag-and-drop reordering (dnd-kit)
[ ] Entry conditions section + Exit conditions section
[ ] Position sizing panel (%, Fixed $, Fixed shares)
[ ] Stop loss / Take profit inputs
```
**Commit:** `feat(strategies): implement visual strategy rule builder with drag-and-drop`

### Task 9.5 — Indicator Panel
```
[ ] Categorized indicator library sidebar
[ ] Search indicators input
[ ] Click to add to canvas with default params
[ ] Inline param editing (period, deviation, etc.)
```
**Commit:** `feat(strategies): add indicator library panel with parameter configuration`

### Task 9.6 — Natural Language Strategy Input
```
[ ] Text area with placeholder examples
[ ] "Convert to Strategy" button
[ ] Calls POST /ai/strategy/parse (streaming)
[ ] Parsed rules appear in visual builder
[ ] User can review and edit before saving
```
**Commit:** `feat(strategies): add natural language to strategy conversion via AI`

### Task 9.7 — Strategy Confidence Meter
```
[ ] "Analyze Strategy" button (AI variant)
[ ] Calls POST /strategies/:id/analyze (streaming)
[ ] Confidence score gauge (0-100)
[ ] AI notes on strengths/weaknesses/market conditions
[ ] Warning badges for common issues
```
**Commit:** `feat(strategies): add AI strategy confidence meter with viability assessment`

**Phase 9 Complete — Merge to develop.**

---

## PHASE 10 — BACKTESTING ENGINE
> **Est:** 4–5 days | **Branch:** `feature/phase-10-backtests`

### Task 10.1 — Backtest Schema + Service Setup
```
[ ] backtestConfigSchema with all validations (TECH_SPEC.md §6)
[ ] Date range max 10 years, start < end
[ ] apps/backend/src/services/backtest.service.ts
[ ] createBacktest() — create record + queue BullMQ job
[ ] getBacktest(id, userId) — with ownership check
[ ] getBacktests(userId) — paginated history
```
**Commit:** `feat(backtests): setup backtest service and BullMQ queue integration`

### Task 10.2 — Backtest Engine Core
```
[ ] apps/backend/src/utils/backtest.ts
[ ] runBacktest(config) — full simulation
[ ] loadHistoricalPrices() from DB
[ ] calculateAllIndicators() using indicators.ts
[ ] evaluateEntrySignal() — AND/OR condition chains
[ ] evaluateExitSignal() — including stop loss / take profit
[ ] simulateTrades() — position management loop
[ ] calculateMetrics() — all result metrics
[ ] computeMonthlyReturns() — calendar grid data
```
**Commit:** `feat(backtests): implement core backtesting simulation engine`

### Task 10.3 — Backtest Worker (BullMQ)
```
[ ] apps/backend/src/workers/backtest.worker.ts
[ ] Runs in worker_threads for CPU isolation
[ ] Max concurrency: 2 simultaneous backtests
[ ] Timeout: 5 minutes (graceful failure)
[ ] Emit progress via WebSocket on each step
[ ] Save results to DB on completion
[ ] Mark status: COMPLETED / FAILED / TIMEOUT
```
**Commit:** `feat(backtests): implement BullMQ worker with progress WebSocket events`

### Task 10.4 — Backtest Routes
```
[ ] POST /backtests/run — TECH_SPEC.md §6
[ ] GET /backtests/:id — full results
[ ] GET /backtests — paginated history
[ ] DELETE /backtests/:id — delete with ownership check
```
**Commit:** `feat(backtests): add backtest API routes`

### Task 10.5 — Backtest Config Frontend
```
[ ] /app/backtests/run — configuration form
[ ] Strategy selector (from user's saved strategies)
[ ] Symbol search input
[ ] Date range picker
[ ] Initial capital + commission inputs
[ ] Position sizing radio group
[ ] "Run Backtest" button with loading state
```
**Commit:** `feat(frontend): implement backtest configuration form`

### Task 10.6 — Step Progress Tracker
```
[ ] 5-step visual progress tracker
[ ] Real-time updates via WebSocket (backtest:progress)
[ ] Step names: Load Data → Indicators → Simulation → Evaluation → Report
[ ] Active step: purple animated bar
[ ] Completed steps: green checkmark
[ ] Cancel button
[ ] Timeout error state with suggestions
```
**Commit:** `feat(frontend): add 5-step backtest progress tracker with WebSocket updates`

### Task 10.7 — Backtest Results Page
```
[ ] /app/backtests/[id] — full results dashboard
[ ] Summary metrics bar (Return, CAGR, Sharpe, MaxDD, WinRate, Trades)
[ ] Equity curve chart (portfolio vs buy-and-hold, TradingView)
[ ] Monthly returns calendar heatmap (D3)
```
**Commit:** `feat(frontend): implement backtest results with equity curve and heatmap`

### Task 10.8 — Trade Log Table
```
[ ] Paginated trade log (25 per page)
[ ] Sortable by date, P&L, duration
[ ] Filter: All / Profitable / Losing
[ ] Row shows: entry/exit dates, prices, shares, P&L $, P&L %
[ ] Color-coded P&L cells
[ ] Download CSV button
```
**Commit:** `feat(frontend): add sortable trade log with export functionality`

### Task 10.9 — AI Backtest Interpretation
```
[ ] Auto-triggered after results load
[ ] Streaming via SSE
[ ] Explains: return vs benchmark, risk metrics, trade quality, improvements
[ ] "Regenerate" button for fresh analysis
```
**Commit:** `feat(backtests): add AI backtest interpretation with streaming`

**Phase 10 Complete — Merge to develop.**

---

## PHASE 11 — AI INTEGRATION
> **Est:** 3–4 days | **Branch:** `feature/phase-11-ai`

### Task 11.1 — Anthropic Provider
```
[ ] apps/backend/src/providers/anthropic.provider.ts
[ ] stream(prompt, systemPrompt, options) — SSE streaming
[ ] complete(prompt, systemPrompt, options) — JSON response
[ ] Context hash generation (SHA-256)
[ ] Redis cache check before API call
[ ] Post-completion: cache response + log AI interaction
```
**Commit:** `feat(ai): implement Anthropic Claude provider with caching and usage tracking`

### Task 11.2 — AI Service — Portfolio Analysis
```
[ ] portfolioAnalysis(portfolioId, userId, analysisType) streaming
[ ] Build rich context: holdings, prices, analytics snapshot
[ ] System prompt: financial analyst persona, structured output
[ ] Cache TTL: 6 hours by context hash
```
**Commit:** `feat(ai): implement AI portfolio analysis with streaming and caching`

### Task 11.3 — AI Service — Strategy & Research
```
[ ] strategyParse(description) — JSON response (not streaming)
[ ] strategyAnalyze(strategyId) — streaming confidence assessment
[ ] marketResearch(query, context) — streaming
[ ] All with appropriate cache TTLs
```
**Commit:** `feat(ai): implement AI strategy parsing and market research`

### Task 11.4 — AI Service — Tutor, Risk, News
```
[ ] financialTutor(concept, level) — streaming
[ ] riskAnalysis(portfolioId) — streaming
[ ] newsExplainer(articleId) — JSON (cached 24h per article)
[ ] backtestInterpret(backtestId) — streaming
[ ] dailyBrief generation — called by cron job
```
**Commit:** `feat(ai): implement AI tutor, risk analyzer, and news explainer`

### Task 11.5 — AI Rate Limiting + Usage Tracking
```
[ ] checkDailyAiLimit middleware (TECH_SPEC.md §8)
[ ] Increment ai_calls_today on each successful AI call
[ ] Reset daily count (check ai_calls_date vs today)
[ ] GET /ai/usage endpoint
[ ] Admin: global daily budget check (pause if > $50)
```
**Commit:** `feat(ai): add AI rate limiting with per-user quota and budget controls`

### Task 11.6 — AI Routes
```
[ ] POST /ai/portfolio/analyze — SSE streaming
[ ] POST /ai/strategy/parse — JSON
[ ] POST /ai/research — SSE streaming
[ ] POST /ai/tutor — SSE streaming
[ ] POST /ai/backtest/interpret — SSE streaming
[ ] POST /ai/chat — SSE streaming
[ ] GET /ai/usage
```
**Commit:** `feat(ai): add all AI API routes with rate limiting middleware`

### Task 11.7 — AI Insights Frontend Module
```
[ ] /app/ai — feature selection cards
[ ] Usage quota display (calls remaining today/this hour)
[ ] AI loading states: rotating status messages + pulsing brain icon
[ ] Streaming text display: progressive reveal with blinking cursor
[ ] Copy response button
[ ] "Save to PDF" button
```
**Commit:** `feat(frontend): implement AI insights module with streaming UI`

### Task 11.8 — AI Chat Interface
```
[ ] Chat bubble layout (user right, AI left)
[ ] Input bar with send button + Enter shortcut
[ ] Message history in Zustand (session only)
[ ] "Clear Chat" button
[ ] Example prompt chips in empty state
[ ] AI typing indicator during stream
[ ] Rate limit warning at 80% quota used
```
**Commit:** `feat(frontend): implement AI chat interface with conversation history`

### Task 11.9 — Financial Tutor Frontend
```
[ ] Concept search input
[ ] Category pills (Basics, Metrics, Strategies, Risk, Markets)
[ ] Streaming explanation display
[ ] Related concepts chips (click → new query)
[ ] Beginner/Intermediate/Advanced level toggle
```
**Commit:** `feat(frontend): implement interactive AI financial tutor`

### Task 11.10 — Daily Brief Generation Job
```
[ ] BullMQ job: generateDailyBrief
[ ] Cron: 8am ET on trading days
[ ] Fetch yesterday's recap data (top movers, index returns)
[ ] Fetch today's economic events
[ ] Call Claude API with structured prompt
[ ] Save to ai_daily_briefs table
[ ] Cache in Redis: brief:daily:{date}
```
**Commit:** `feat(ai): implement automated daily AI market brief generation`

**Phase 11 Complete — Merge to develop.**

---

## PHASE 12 — NEWS & INTELLIGENCE
> **Est:** 2–3 days | **Branch:** `feature/phase-12-news`

### Task 12.1 — News Ingestion Worker
```
[ ] apps/backend/src/workers/newsIngestion.worker.ts
[ ] Fetch from Finnhub + Polygon news endpoints
[ ] Deduplicate by external_id and URL
[ ] Extract ticker mentions from headline/excerpt
[ ] Create news_articles + news_stock_mentions records
[ ] Queue AI summarization job per article
[ ] Runs every 15 minutes (cron)
```
**Commit:** `feat(news): implement news ingestion worker with deduplication`

### Task 12.2 — News AI Summarization Job
```
[ ] BullMQ job: summarize-article (low priority)
[ ] Call Claude: generate 1-paragraph summary
[ ] Detect sentiment: BULLISH / BEARISH / NEUTRAL
[ ] Extract 3-5 key bullet points
[ ] Save to news_summaries table
[ ] Cache: ai:news:{articleId} (24h TTL)
```
**Commit:** `feat(news): add AI article summarization with sentiment analysis job`

### Task 12.3 — News Service + Routes
```
[ ] apps/backend/src/services/news.service.ts
[ ] getMarketNews(page, category) — paginated
[ ] getStockNews(symbol) — last 30 articles
[ ] getPersonalizedNews(userId) — based on holdings + watchlist
[ ] getDailyBrief(date) — from ai_daily_briefs table
[ ] All routes from TECH_SPEC.md §7
```
**Commit:** `feat(news): implement news service with personalized feed and all routes`

### Task 12.4 — News Frontend — Market Tab
```
[ ] Article card with: source, sentiment badge, headline, excerpt, time, tickers
[ ] Category filter pills
[ ] Date range filter
[ ] "N new articles" banner (auto-refresh polling)
[ ] Article modal: full preview + AI summary + sentiment + related stocks
```
**Commit:** `feat(frontend): implement market news tab with AI summaries`

### Task 12.5 — News Frontend — Personalized + Brief Tabs
```
[ ] Personalized tab: articles filtered by holdings/watchlist
[ ] Context tag on each article ("You own AAPL · +1.2%")
[ ] Empty state: "Add stocks to see personalized news"
[ ] Daily Brief tab: full brief with sections, generated timestamp
[ ] Share + Download buttons on brief
```
**Commit:** `feat(frontend): implement personalized news feed and daily AI brief tab`

### Task 12.6 — Sentiment Calculation Job
```
[ ] BullMQ job: computeSentiment (daily, per symbol)
[ ] Aggregate article sentiments for each symbol
[ ] Write to sentiment_scores table
[ ] Display in stock detail page sentiment section
```
**Commit:** `feat(news): add daily sentiment score aggregation job`

**Phase 12 Complete — Merge to develop.**

---

## PHASE 13 — REAL-TIME FEATURES
> **Est:** 2 days | **Branch:** `feature/phase-13-realtime`

### Task 13.1 — Socket.io Server Setup
```
[ ] apps/backend/src/config/socket.ts
[ ] Authenticate on connect (verify JWT from auth.token)
[ ] Join user room: user:{userId}
[ ] Price room management (subscribe/unsubscribe events)
[ ] Portfolio room management
[ ] Backtest room management
[ ] Multi-instance support with Redis adapter
```
**Commit:** `feat(realtime): implement Socket.io server with JWT auth and room management`

### Task 13.2 — Price Update Broadcaster
```
[ ] Background job: refreshPrices (every 15s during market hours)
[ ] Fetch updated prices for all subscribed symbols
[ ] Emit 'price:update' to subscribed rooms
[ ] Emit 'portfolio:update' to affected portfolio rooms
[ ] Update Redis cache with new prices
```
**Commit:** `feat(realtime): add live price broadcasting to subscribed WebSocket rooms`

### Task 13.3 — Notifications System
```
[ ] apps/backend/src/services/notification.service.ts
[ ] createNotification(userId, data) — save + emit via WebSocket
[ ] getNotifications(userId, filters) — paginated
[ ] markAsRead(notificationId, userId)
[ ] markAllRead(userId)
[ ] deleteNotification(notificationId, userId)
[ ] All routes from TECH_SPEC.md §9
```
**Commit:** `feat(notifications): implement notification service with real-time delivery`

### Task 13.4 — Price Alert Checker Worker
```
[ ] apps/backend/src/workers/priceAlerts.worker.ts
[ ] Runs every minute during market hours
[ ] Load all active alerts (distinct symbols)
[ ] Compare current price (Redis) to threshold
[ ] evaluateAlert() for each condition type
[ ] Redis lock for deduplication (5min window)
[ ] triggerAlert() — update status, create notification, emit WebSocket
```
**Commit:** `feat(realtime): implement price alert checker with deduplication`

### Task 13.5 — Notifications Frontend
```
[ ] Bell icon with unread count badge
[ ] Notification drawer (slide-in from right)
[ ] Notification types with icons and colors
[ ] Click → mark read + navigate
[ ] /app/notifications — full page with filters
[ ] Settings → Notifications tab (alert management)
[ ] "Create Price Alert" form in settings
```
**Commit:** `feat(frontend): implement notification center and price alert management`

**Phase 13 Complete — Merge to develop.**

---

## PHASE 14 — ADMIN PANEL
> **Est:** 2 days | **Branch:** `feature/phase-14-admin`

### Task 14.1 — Admin Service
```
[ ] getUsers(filters, pagination) for admin
[ ] updateUser(userId, data) — role change / suspend
[ ] getSystemHealth() — DB + Redis + API status
[ ] getAiUsage(period) — aggregate stats
[ ] getAuditLogs(filters, pagination)
[ ] Feature flag CRUD
```
**Commit:** `feat(admin): implement admin service with user management and monitoring`

### Task 14.2 — Admin Routes
```
[ ] All routes from TECH_SPEC.md §10
[ ] All protected with: authenticate + authorize('ADMIN')
[ ] Rate limit admin routes separately (lower limit)
```
**Commit:** `feat(admin): add admin API routes with role-based protection`

### Task 14.3 — Admin Users Management
```
[ ] /app/admin/users — paginated, searchable table
[ ] Suspend / restore user with reason modal
[ ] Change role dropdown
[ ] User detail page: profile, AI usage, audit log
```
**Commit:** `feat(admin): implement user management interface`

### Task 14.4 — System Health Dashboard
```
[ ] /app/admin — overview with platform metrics
[ ] API status cards (Polygon, Finnhub, Claude, Resend)
[ ] Cache stats (hit rate, memory)
[ ] Queue status (pending, failed jobs)
[ ] Real-time refresh every 30s
```
**Commit:** `feat(admin): implement system health monitoring dashboard`

### Task 14.5 — AI Usage + Audit Log
```
[ ] /app/admin/ai-usage — usage charts (Recharts)
[ ] Daily cost tracker with budget progress bar
[ ] Top users by usage table
[ ] /app/admin/audit-logs — filterable audit log table
[ ] Export audit log to CSV
```
**Commit:** `feat(admin): implement AI usage analytics and audit log viewer`

### Task 14.6 — Feature Flags Management
```
[ ] /app/admin/feature-flags — list with toggle switches
[ ] Scope selector (global / role / user)
[ ] Per-user override capability
[ ] Changes take effect immediately (no restart required)
[ ] Frontend respects feature flags via API
```
**Commit:** `feat(admin): implement feature flag management with real-time toggle`

**Phase 14 Complete — Merge to develop.**

---

## PHASE 15 — TESTING
> **Est:** 3–4 days | **Branch:** `feature/phase-15-testing`

### Task 15.1 — Backend Unit Tests: Analytics
```
[ ] Test each calculation (Sharpe, Sortino, VaR, MaxDD, Beta)
[ ] Edge cases: single holding, zero returns, all negative returns
[ ] npm run test -- --testPathPattern=analytics.utils
```
**Commit:** `test(analytics): add unit tests for all financial calculation utilities`

### Task 15.2 — Backend Unit Tests: Indicators
```
[ ] Test SMA, EMA with known values
[ ] Test RSI boundary conditions (0, 100)
[ ] Test MACD signal crossovers
[ ] All indicator outputs match reference implementations
```
**Commit:** `test(backtests): add unit tests for all technical indicator calculations`

### Task 15.3 — Backend Integration Tests: Portfolio
```
[ ] Create portfolio → buy → sell → verify holdings
[ ] Average cost recalculation on multiple buys
[ ] Insufficient cash rejection
[ ] Insufficient shares rejection
[ ] Concurrent trades (race condition test)
[ ] Portfolio limit enforcement
```
**Commit:** `test(portfolio): add portfolio and trade execution integration tests`

### Task 15.4 — Backend Integration Tests: Security
```
[ ] Rate limiter correctly blocks after threshold
[ ] SQL injection attempt in ticker field → rejected
[ ] XSS payload in name field → sanitized
[ ] JWT tampering → 401
[ ] Token replay after logout → 401
[ ] RBAC: user accessing admin route → 403
```
**Commit:** `test(security): add security middleware integration tests`

### Task 15.5 — Backend Integration Tests: Backtest
```
[ ] Run backtest with known data → verify expected results
[ ] Timeout scenario → status set to TIMEOUT
[ ] Invalid date range → validation error
[ ] Progress WebSocket events emitted correctly
```
**Commit:** `test(backtests): add backtest engine integration tests`

### Task 15.6 — Frontend Component Tests
```
[ ] TradeModal: form validation, insufficient cash state, success/error
[ ] PortfolioHero: renders with data, skeleton on loading, error state
[ ] PriceChart: renders without crashing, time range changes
[ ] HoldingsTable: P&L color coding, empty state
[ ] AuthForm: validation errors shown inline
```
**Commit:** `test(frontend): add component tests for critical UI elements`

### Task 15.7 — E2E Tests (Playwright)
```
[ ] Auth flow: register → verify → login → logout
[ ] Trading flow: search stock → buy → view in portfolio → sell
[ ] Backtest flow: create strategy → configure backtest → view results
[ ] AI flow: analyze portfolio → verify streaming works
[ ] All E2E tests pass: npx playwright test
```
**Commit:** `test(e2e): add Playwright end-to-end tests for critical user flows`

### Task 15.8 — Coverage Report
```
[ ] Run full test suite: npm test -- --coverage
[ ] Services coverage > 80%
[ ] Security middleware coverage > 95%
[ ] Overall coverage > 70%
[ ] Fix any tests below threshold before proceeding
```
**Commit:** `test: achieve target test coverage with all suites passing`

**Phase 15 Complete — Merge to develop.**

---

## PHASE 16 — DEVOPS & DEPLOYMENT
> **Est:** 2–3 days | **Branch:** `feature/phase-16-devops`

### Task 16.1 — Backend Dockerfile
```
[ ] Multi-stage build (build stage + production stage)
[ ] Node 20 alpine base image
[ ] Only production dependencies in final image
[ ] Non-root user for security
[ ] Health check instruction
```
**Commit:** `chore(devops): add multi-stage Dockerfile for backend`

### Task 16.2 — Frontend Dockerfile
```
[ ] Multi-stage Next.js build
[ ] Standalone output mode (next.config.js: output: 'standalone')
[ ] Environment variables injected at runtime
[ ] Health check
```
**Commit:** `chore(devops): add multi-stage Dockerfile for Next.js frontend`

### Task 16.3 — GitHub Actions CI Pipeline
```
[ ] .github/workflows/ci.yml
[ ] Trigger: push + pull_request to develop and main
[ ] Jobs: test-backend (Jest), test-frontend (Vitest), lint (ESLint)
[ ] Use Docker service containers for PostgreSQL + Redis in CI
[ ] Upload coverage to Codecov
[ ] Fail PR if coverage drops below threshold
```
**Commit:** `chore(ci): add GitHub Actions CI pipeline with test and lint jobs`

### Task 16.4 — GitHub Actions CD Pipeline
```
[ ] .github/workflows/deploy.yml
[ ] Trigger: push to main (after PR merge)
[ ] Build Docker images + push to AWS ECR
[ ] Deploy to staging (auto) → run smoke tests
[ ] Deploy to production (manual approval gate)
[ ] Notify on success/failure (GitHub notification)
```
**Commit:** `chore(ci): add GitHub Actions CD pipeline with staging and production deploy`

### Task 16.5 — AWS Infrastructure Setup
```
[ ] Create VPC with public + private subnets
[ ] Launch RDS PostgreSQL 16 (db.t3.medium)
[ ] Launch ElastiCache Redis 7 (cache.t3.micro)
[ ] Launch EC2 t3.medium for backend
[ ] Configure Security Groups (DB only accessible from backend)
[ ] Set up S3 bucket for assets + exports
[ ] Configure CloudFront distribution
[ ] Install SSL certificate via ACM
```
**Commit:** `chore(infra): document AWS infrastructure setup in DEPLOYMENT.md`

### Task 16.6 — AWS Secrets Manager
```
[ ] Store all API keys and DB credentials in Secrets Manager
[ ] Backend reads secrets at startup (not from .env in production)
[ ] IAM role for EC2 with Secrets Manager read permission
[ ] Rotate DB password policy
```
**Commit:** `chore(security): configure AWS Secrets Manager for production credentials`

### Task 16.7 — CloudWatch Monitoring
```
[ ] Set up CloudWatch Log Groups for backend logs
[ ] Create alarms: API error rate > 1%, P95 latency > 1s
[ ] CPU > 80% alarm on EC2
[ ] Redis memory > 80% alarm
[ ] RDS connections > 80% alarm
[ ] Email alert to admin on alarm trigger
```
**Commit:** `chore(monitoring): configure CloudWatch alarms and log groups`

### Task 16.8 — Production Deployment + Smoke Tests
```
[ ] Run: npx prisma migrate deploy (production)
[ ] Deploy backend + frontend containers
[ ] Verify: GET https://api.quantedge.app/health → all green
[ ] Verify: https://quantedge.app loads
[ ] Test auth flow on production
[ ] Test trade execution on production
[ ] Test AI analysis on production
[ ] All smoke tests pass
```
**Commit:** `chore(deploy): production deployment verified with smoke tests passing`

**Phase 16 Complete — Merge feature branch to develop, then develop → main:**
```bash
git push origin feature/phase-16-devops
# PR: feature → develop → approve → merge
git checkout develop && git pull
git checkout main && git merge develop
git tag v1.0.0
git push origin main --tags
# 🎉 QuantEdge v1.0.0 deployed to production
```

---

## POST-LAUNCH MONITORING CHECKLIST

```
Week 1:
[ ] Monitor CloudWatch error rates daily
[ ] Check AI API cost dashboard daily
[ ] Review audit logs for suspicious activity
[ ] Monitor RDS performance insights
[ ] Check cache hit rates (target: >60%)

Month 1:
[ ] Review user analytics (DAU, feature usage)
[ ] Identify slowest API endpoints (optimize with caching)
[ ] Review AI response quality (sample user sessions)
[ ] Update stocks reference data (new tickers, delistings)
[ ] Security dependency audit: npm audit

Ongoing:
[ ] Weekly: Review and close failing jobs in Bull Board
[ ] Monthly: Rotate API keys
[ ] Monthly: Review and archive old audit logs
[ ] Quarterly: Load test (k6) — simulate 500 concurrent users
```

---

## NOTES SECTION

> Use this area to document decisions, blockers, and discoveries during development.

```
[DATE] [DECISION]: 
Example: 2026-06-15 [DECISION]: Switched from Polygon free tier to starter ($29/mo) 
         because free tier limited to 5 API calls/min, insufficient for 15s price refresh.

[DATE] [BLOCKER]: 
Example: 2026-06-20 [BLOCKER]: Backtest engine timing out on 10-year SPY data.
         Fix: Reduced to max 5 years, added DB query index.

[DATE] [DISCOVERY]:
Example: 2026-06-25 [DISCOVERY]: TradingView LW Charts requires data sorted ASC by time.
         All historical data queries must include orderBy: { timestamp: 'asc' }
```

---

*End of QuantEdge Tracker v1.0.0*
*Total tasks: 126 | Estimated total time: 8–12 weeks (solo developer)*
*See IMPLEMENTATION.md for detailed build instructions for each Phase*
