# QuantEdge - Project Log

> Chronological record of all significant work sessions. Most recent entry first.

---

## 2026-08-06 - Phase 17: Automated Integration Testing (100% Pass)

**Commit:** `9801dd3` | **Branch:** `develop`

### Work Done
- Built comprehensive automated API test suite (run_tests.ps1) - 48 test cases across 11 modules
- Identified and fixed all backend 500 errors discovered by tests
- Achieved **100% pass rate: 48/48 tests green**

### Bugs Discovered & Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| GET /portfolios -> 500 | Jackson serialized lazy Portfolio.user outside Hibernate session | @JsonIgnore on user, holdings, transactions, snapshots |
| POST /watchlist -> 500 | Jackson serialized lazy WatchlistItem.watchlist | @JsonIgnore on watchlist |
| POST /strategies -> 500 | ImmutableCollections.MapN cast to String in Hibernate JSON handler | Object -> Map<String,Object>, Map.of() -> new HashMap<>() |
| POST /strategies wrong key -> 500 | Controller only read config key, test sent parameters | Accept both parameters + config with safe instanceof cast |
| Redis required at startup | App crash without local Redis | @ConditionalOnBean on all Redis-dependent beans |

### Test Suite Modules
- Auth: register, login, wrong pwd, refresh, profile, no-auth 401
- Portfolio: CRUD, trade, transactions
- Watchlist: add, list, delete
- Market Data: quote, search, chart, movers, indices, company
- Analytics: metrics, equity curve
- Strategies: CRUD, backtests
- News: global + by symbol
- AI: ask, analyse portfolio/stock, explain strategy
- Security: no token, bad JWT, XSS, SQL injection
- Cleanup: logout

---

## 2026-07-31 - Redis Optional + Frontend Watchlist

**Commits:** `389de00`, `607a8ee` | **Branch:** `develop`

### Work Done
- Fixed Redis startup crash with @ConditionalOnBean on all Redis-dependent beans
- Made MarketDataService.redisTemplate an Optional<RedisTemplate> - graceful fallback to Caffeine L1 cache
- Completed Watchlist frontend page with full-featured data table

---

## 2026-07-20 - Phase 15: Unit Testing Complete

**Commits:** `aff91a3`, `68e808b` | **Branch:** `develop`

### Work Done
- Fixed all 38 unit tests
- Test classes: JwtServiceTest (16), AuthServiceTest (9), PortfolioServiceTest (8), BacktestServiceTest (5)
- Properly separated unit tests from integration tests with Maven Surefire excludes

---

## 2026-07-01 - Phase 16: DevOps & Docker

**Commit:** `5c60d31` | **Branch:** `develop`

### Work Done
- Multi-stage Dockerfile for backend (JDK 25 builder -> JRE runtime)
- Multi-stage Dockerfile for frontend (Node builder -> Nginx server)
- docker-compose.yml for local full-stack development
- GitHub Actions CI pipeline (.github/workflows/ci.yml)

---

## 2026-06-28 - Phase 11-13: AI, News, Real-Time

**Commit:** `dd673da` | **Branch:** `develop`

### Work Done
- Integrated Google Gemini Flash via REST API - 5 AI endpoints
- News service pulling from Finnhub with caching
- STOMP WebSocket server for real-time price streaming
- Frontend WebSocket provider and live quote subscriptions

---

## 2026-06-20 - Phase 9-10: Strategy Builder + Backtesting

**Commit:** `ed547d3` | **Branch:** `develop`

### Work Done
- Strategy CRUD backend with JSONB rule storage (Hibernate @JdbcTypeCode)
- Backtesting engine: SMA Crossover, RSI, Buy-and-Hold strategies
- Frontend Strategy Builder page with parameter forms
- Analytics engine with Sharpe, max drawdown, win rate metrics

---

## 2026-06-15 - Phase 6-8: Frontend Foundation + Dashboard

**Commits:** `7e5c8de`, `ed547d3` | **Branch:** `develop`

### Work Done
- Next.js 14 App Router frontend with Zustand state management
- All 10 app pages built and functional
- JWT auth flow with automatic refresh on 401
- 7-widget dashboard

---

## 2026-06-13 - Phase 1-5: Full Backend Foundation

**Commits:** `b29f314`, `845e137`, `1dd2328`, `cdeb952` | **Branch:** `develop`

### Work Done
- Maven monorepo with Spring Boot 3.3 backend
- Flyway migrations for all 15 database tables
- Complete JPA entity layer
- JWT authentication (HS512, access + refresh token rotation)
- Portfolio paper trading engine with atomic transactions
- Market data integration (Finnhub + Alpha Vantage)
- Email service via Resend
- Swagger/OpenAPI documentation

---

## Project Milestones

| Date | Milestone | Commit |
|------|-----------|--------|
| 2026-06-13 | Full backend foundation (Phases 1-5) | `845e137` |
| 2026-06-15 | Frontend + Dashboard (Phases 6-7) | `7e5c8de` |
| 2026-06-20 | Strategy, Backtest, Analytics (Phases 8-10) | `ed547d3` |
| 2026-06-28 | AI, News, Real-Time (Phases 11-13) | `dd673da` |
| 2026-07-01 | DevOps + Docker (Phase 16) | `5c60d31` |
| 2026-07-20 | Unit Tests 38/38 (Phase 15) | `aff91a3` |
| 2026-07-31 | Redis optional + Watchlist UI | `389de00` |
| 2026-08-06 | Integration Tests 48/48 - 100% pass | `9801dd3` |