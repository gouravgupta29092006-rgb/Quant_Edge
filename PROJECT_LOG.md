# QuantEdge - Project Log

> Chronological record of all significant work sessions. Most recent entry first.

---

## 2026-08-13 - Phase 18: Security Audit & Hardening

**Commit:** `76d39bd` | **Branch:** `develop`

### Full Codebase Security Scan

Scanned all `.java`, `.ts`, `.tsx`, `.yml`, `.yaml`, `.properties`, `.bat`, `.ps1` files for:
- Hardcoded secrets/credentials
- XSS-vulnerable token storage
- Open/unauthenticated API endpoints
- Actuator exposure
- CORS misconfigurations
- Sensitive env vars in frontend bundle

### Vulnerabilities Found & Fixed

| Severity | Issue | Fix |
|----------|-------|-----|
| HIGH | Registration form broken: frontend sent `{username, displayName}`, backend expected `{firstName, lastName}` | Rewrote register/page.tsx fields; updated authStore.ts RegisterData interface |
| MEDIUM | JWT access token stored in localStorage (XSS readable by malicious scripts) | Moved to in-memory module-scoped variable in api.ts |
| MEDIUM | /actuator/metrics publicly accessible without authentication | SecurityConfig: /actuator/** requires ADMIN role; application.yml: expose health only |
| MEDIUM | start.bat contained hardcoded DB password `devpassword123` | Rewrote start.bat to load all credentials from .env dynamically |
| MEDIUM | start.bat not in .gitignore (could leak credentials if committed) | Added to .gitignore along with start.ps1, start.sh |
| LOW | Frontend password validation missing special-char check (mismatch with backend @Pattern) | Added `[@#$%^&+=!]` regex check to validate() in register/page.tsx |

### New Files
- `SECURITY.md` - Full security policy: architecture, trade-offs, reporting process, checklists, fix log

### False Positives Identified
- `sk-` pattern matched "Sharpe" in analytics comments and npm registry URL - not real secrets
- `NEXT_PUBLIC_` env vars contain only API URLs - safe to be public by design

---

## 2026-08-06 - Phase 17: Automated Integration Testing (100% Pass)

**Commit:** `9801dd3` | **Branch:** `develop`

### Work Done
- Built `run_tests.ps1` - 48 automated API test cases across 11 modules
- Discovered and fixed all backend 500 errors
- Achieved 100% pass rate: 48/48 tests green

### Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| GET /portfolios -> 500 | Jackson serialized lazy Portfolio.user outside Hibernate session | @JsonIgnore on user, holdings, transactions, snapshots |
| POST /watchlist -> 500 | Jackson serialized lazy WatchlistItem.watchlist | @JsonIgnore on watchlist |
| POST /strategies -> 500 | ImmutableCollections.MapN cast to String in Hibernate JSON handler | Object -> Map<String,Object>, Map.of() -> new HashMap<>() |
| POST /strategies wrong key -> 500 | Controller only read `config` key; test sent `parameters` | Accept both keys with safe instanceof cast |

---

## 2026-08-06 - Docs: All MD Files Updated

**Commit:** `2c9ecd0` | **Branch:** `develop`

Updated CURRENT_STATUS.md, PROJECT_LOG.md, TRACKER.md, DEPLOYMENT.md, frontend/README.md to reflect Phase 17 completion.

---

## 2026-07-31 - Redis Optional + Frontend Watchlist

**Commits:** `389de00`, `607a8ee` | **Branch:** `develop`

- Fixed Redis startup crash: @ConditionalOnBean on all Redis-dependent beans
- MarketDataService: Optional<RedisTemplate> - graceful fallback to Caffeine L1 cache
- Completed Watchlist frontend page with full-featured data table

---

## 2026-07-20 - Phase 15: Unit Testing Complete

**Commits:** `aff91a3`, `68e808b` | **Branch:** `develop`

- Fixed all 38 unit tests
- JwtServiceTest (16), AuthServiceTest (9), PortfolioServiceTest (8), BacktestServiceTest (5)
- Properly separated unit tests from integration tests via Maven Surefire excludes

---

## 2026-07-01 - Phase 16: DevOps & Docker

**Commit:** `5c60d31` | **Branch:** `develop`

- Multi-stage Dockerfile for backend and frontend
- docker-compose.yml for local full-stack dev
- GitHub Actions CI pipeline

---

## 2026-06-28 - Phase 11-13: AI, News, Real-Time

**Commit:** `dd673da` | **Branch:** `develop`

- Google Gemini Flash integration (5 endpoints)
- News service with Finnhub + caching
- STOMP WebSocket real-time price streaming
- Frontend WebSocket provider + live quote subscriptions

---

## 2026-06-20 - Phase 9-10: Strategy Builder + Backtesting

**Commit:** `ed547d3` | **Branch:** `develop`

- Strategy CRUD with JSONB rule storage
- Backtesting: SMA, RSI, Buy-and-Hold engines
- Analytics: Sharpe, max drawdown, win rate

---

## 2026-06-15 - Phase 6-8: Frontend Foundation + Dashboard

**Commits:** `7e5c8de`, `ed547d3` | **Branch:** `develop`

- Next.js 14 App Router, Zustand state management
- All 10 app pages, JWT auth flow with auto-refresh

---

## 2026-06-13 - Phase 1-5: Full Backend Foundation

**Commits:** `b29f314`, `845e137`, `1dd2328`, `cdeb952` | **Branch:** `develop`

- Maven monorepo, Spring Boot 3.3 backend
- Flyway migrations, 15 DB tables, complete JPA entity layer
- JWT auth (HS512, access + refresh token rotation)
- Portfolio paper trading engine with atomic transactions
- Market data integration, email service, Swagger/OpenAPI

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
| 2026-08-06 | Integration Tests 48/48 - 100% pass (Phase 17) | `9801dd3` |
| 2026-08-13 | Security Audit - 6 issues fixed, SECURITY.md (Phase 18) | `76d39bd` |