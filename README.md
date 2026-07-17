<div align="center">

<img src="https://img.shields.io/badge/QuantEdge-AI%20Financial%20Platform-6366f1?style=for-the-badge&logo=chart-line&logoColor=white" alt="QuantEdge Banner"/>

# QuantEdge

### AI-Powered Virtual Trading & Portfolio Intelligence Platform

*Simulate. Analyze. Strategize. All for free.*

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

> **QuantEdge** is a production-grade, full-stack financial platform built for learning, portfolio simulation, and strategy research. It combines real-time market data, AI-powered insights, a quantitative backtesting engine, and professional analytics — all at **zero cost** using free-tier APIs and open-source tooling.
>
> ⚠️ **Strictly educational. No real money is ever involved.**

---

## ✨ Feature Overview

| Module | What it does |
|--------|-------------|
| 🔐 **Authentication** | JWT + Refresh Token rotation, 2FA (TOTP), email verification, password reset |
| 📊 **Virtual Portfolio** | Paper-trade stocks with real market prices, track P&L, holdings, transactions |
| 📈 **Analytics Engine** | Sharpe Ratio, Max Drawdown, Beta, VaR, Alpha, Correlation Matrix, Equity Curve |
| 🧠 **Strategy Builder** | Create, save, and manage quantitative trading rule sets (SMA, RSI, custom) |
| ⚡ **Backtesting Engine** | Async multi-strategy backtesting engine — SMA Crossover, RSI, Buy & Hold |
| 🌐 **Market Intelligence** | Real-time quotes, OHLCV charts, market movers, sector indices, company profiles |
| 📰 **News & Sentiment** | Paginated market news with keyword search and category filtering |
| 🤖 **AI Analyst** | Gemini-powered portfolio analysis, stock analysis, strategy explanation, backtest review |
| 👁 **Watchlist** | Persistent watchlist with real-time price monitoring via WebSocket |
| ⚙️ **Settings** | Profile management, password change, notification preferences |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   QuantEdge Frontend                      │
│          Next.js 14 App Router  ·  Port 3000             │
│    Zustand State  ·  Tailwind CSS  ·  WebSocket Client   │
└──────────────────────┬───────────────────────────────────┘
                       │  REST API (JSON)  +  STOMP/WebSocket
┌──────────────────────▼───────────────────────────────────┐
│                   QuantEdge Backend                       │
│           Spring Boot 3.3  ·  Java 21  ·  Port 8080      │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Layer  │  │  REST APIs   │  │  WebSocket    │  │
│  │  JWT HS512   │  │  11 Ctrlrs   │  │  STOMP/WS     │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Backtest    │  │  AI Service  │  │  Scheduler    │  │
│  │  Engine      │  │  (Gemini)    │  │  (Snapshots)  │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└──────┬───────────────────┬───────────────────────────────┘
       │                   │
┌──────▼──────┐    ┌───────▼───────┐    ┌───────────────┐
│ PostgreSQL  │    │     Redis      │    │  External APIs│
│     16      │    │   (Cache +     │    │ Finnhub       │
│  (Primary   │    │  Rate Limit)   │    │ AlphaVantage  │
│   + Flyway) │    │               │    │ Gemini AI     │
└─────────────┘    └───────────────┘    └───────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 | Language (Virtual Threads ready) |
| Spring Boot | 3.3.0 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM & repository layer |
| Spring WebSocket | — | STOMP real-time price streaming |
| Spring AI | — | Gemini API integration |
| Flyway | 10.x | Database migrations (V1–V8) |
| JJWT | — | JWT generation & validation (HS512) |
| Lombok | — | Boilerplate reduction |
| Maven | 3.9 | Build tool |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 | React framework (App Router) |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 3.x | Utility-first styling |
| Zustand | 4.x | Global state management |
| Recharts | — | Analytics & chart visualizations |
| SockJS + STOMP | — | WebSocket client for live prices |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 | Primary database (20+ tables, Flyway migrations) |
| Redis 7 | Response caching, API rate limiting |
| Docker Compose | Local dev environment |
| GitHub Actions | CI/CD pipeline |

### External APIs (All Free Tier)
| API | Purpose |
|-----|---------|
| [Finnhub](https://finnhub.io) | Real-time quotes, news, company profiles |
| [Alpha Vantage](https://alphavantage.co) | Historical OHLCV data (fallback) |
| [Google Gemini](https://ai.google.dev) | All AI analysis features (Flash model) |

---

## 📁 Project Structure

```
Quant_Edge/
├── apps/
│   └── backend/                        ← Spring Boot 3.3 API
│       ├── src/main/java/com/quantedge/
│       │   ├── controller/             ← 11 REST controllers
│       │   │   ├── AuthController.java         /auth/*
│       │   │   ├── UserController.java          /users/*
│       │   │   ├── PortfolioController.java     /portfolios/*
│       │   │   ├── WatchlistController.java     /watchlist/*
│       │   │   ├── MarketController.java        /market/*
│       │   │   ├── ChartController.java         /market/chart/*
│       │   │   ├── AnalyticsController.java     /analytics/*
│       │   │   ├── StrategyController.java      /strategies/*
│       │   │   ├── NewsController.java          /news/*
│       │   │   ├── AIController.java            /ai/*
│       │   │   └── HealthController.java        /health
│       │   ├── service/                ← Business logic (12 services)
│       │   ├── entity/                 ← JPA entities (14 entities)
│       │   ├── repository/             ← Spring Data JPA repositories
│       │   ├── security/               ← JWT filter, UserDetails, JwtService
│       │   ├── provider/               ← Market data adapters
│       │   │   ├── FinnhubProvider.java
│       │   │   └── AlphaVantageProvider.java
│       │   ├── config/                 ← Security, Cache, WebSocket, OpenAPI
│       │   ├── dto/                    ← Request/Response DTOs
│       │   ├── exception/              ← Global exception handler + error codes
│       │   ├── scheduler/              ← Portfolio snapshot scheduler
│       │   └── util/                   ← ApiResponse wrapper
│       └── src/main/resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── db/migration/           ← Flyway V1–V8 migrations
│               ├── V1__create_users_and_auth_tables.sql
│               ├── V2__create_stocks_and_market_tables.sql
│               ├── V3__create_portfolio_tables.sql
│               ├── V4__create_strategy_backtest_news_tables.sql
│               ├── V5__create_stock_quotes_table.sql
│               ├── V6__fix_stock_quotes_and_enum_casting.sql
│               ├── V7__convert_uuid_pks_to_varchar.sql
│               └── V8__convert_enum_columns_to_varchar.sql
│
├── frontend/                           ← Next.js 14 App Router
│   └── src/app/
│       ├── (auth)/                     ← /login, /register
│       └── (dashboard)/               ← Protected routes
│           ├── dashboard/             ← Overview widgets
│           ├── portfolio/             ← Holdings & trades
│           ├── market/                ← Quotes & charts
│           ├── analytics/             ← Risk metrics & equity curve
│           ├── strategies/            ← Strategy builder & backtests
│           ├── news/                  ← Market news feed
│           ├── watchlist/             ← Symbol monitoring
│           └── settings/              ← Profile & preferences
│
├── docker-compose.yml                  ← PostgreSQL + Redis dev stack
├── .github/workflows/                  ← GitHub Actions CI/CD
├── TECH_SPEC.md                        ← Full technical specification
├── SCHEMA.md                           ← Database schema reference
├── APPFLOW.md                          ← Application flow diagrams
└── TRACKER.md                          ← Phase-by-phase development log
```

---

## 🚀 Quick Start

### Prerequisites

```bash
java --version    # Java 21+
mvn --version     # Maven 3.9+
node --version    # Node.js 20+
npm --version     # npm 10+
docker --version  # Docker 24+ (for local DB)
```

### 1. Clone the Repository

```bash
git clone https://github.com/gouravgupta29092006-rgb/Quant_Edge.git
cd Quant_Edge
```

### 2. Start the Database Stack

```bash
docker compose up -d
# PostgreSQL → localhost:5432   (quantedge / devpassword123)
# Redis      → localhost:6379
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# === REQUIRED ===
JWT_SECRET=your-secret-key-min-512-bits-for-hs512

# === OPTIONAL (features degrade gracefully without these) ===
FINNHUB_API_KEY=your_finnhub_key         # Real-time quotes & news
ALPHA_VANTAGE_API_KEY=your_av_key        # Historical OHLCV fallback
GEMINI_API_KEY=your_gemini_key           # AI analysis features
```

### 4. Build & Run the Backend

```bash
cd apps/backend
mvn package -DskipTests

# Set JWT_SECRET and run
$env:JWT_SECRET = "quantedge_dev_jwt_secret_key_must_be_at_least_512_bits_long_for_hs512_algorithm"
java -jar target/quantedge-backend-1.0.0.jar
```

Backend runs at: **http://localhost:8080/api/v1**

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

### 6. Verify the Stack

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Expected:
# {"success":true,"data":{"status":"UP"},...}
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <token>`.

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register new account |
| `POST` | `/auth/login` | ❌ | Login, returns access + refresh token |
| `POST` | `/auth/refresh` | ❌ | Rotate refresh token |
| `POST` | `/auth/logout` | ✅ | Invalidate refresh token |
| `GET`  | `/auth/me` | ✅ | Get current user profile |
| `POST` | `/auth/forgot-password` | ❌ | Send password reset email |
| `POST` | `/auth/reset-password` | ❌ | Reset password via token |
| `POST` | `/auth/verify-email` | ❌ | Verify email address |
| `POST` | `/auth/change-password` | ✅ | Change current password |
| `POST` | `/auth/2fa/setup` | ✅ | Generate TOTP QR code |
| `POST` | `/auth/2fa/enable` | ✅ | Enable 2FA |
| `POST` | `/auth/2fa/disable` | ✅ | Disable 2FA |

### Portfolio (`/portfolios`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/portfolios` | List all user portfolios |
| `POST` | `/portfolios` | Create new portfolio |
| `GET`  | `/portfolios/{id}` | Get portfolio detail |
| `DELETE` | `/portfolios/{id}` | Soft-delete portfolio |
| `POST` | `/portfolios/{id}/trade` | Execute BUY/SELL trade |
| `GET`  | `/portfolios/{id}/transactions` | Transaction history |

### Market Data (`/market`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/market/quote/{symbol}` | Real-time stock quote |
| `POST` | `/market/quotes/batch` | Batch quote lookup |
| `GET`  | `/market/company/{symbol}` | Company profile |
| `GET`  | `/market/search?q=` | Search stocks |
| `GET`  | `/market/movers` | Top gainers & losers |
| `GET`  | `/market/indices` | Major index data |
| `GET`  | `/market/chart/{symbol}?range=` | OHLCV chart data |

### Analytics, Strategies, AI & More

| Prefix | Key Endpoints |
|--------|--------------|
| `/analytics` | `/{portfolioId}` — full risk metrics, `/{portfolioId}/equity-curve` |
| `/strategies` | CRUD + `/{id}/backtests` (initiate), `/backtests/{id}` (poll result) |
| `/news` | `GET /news?page=&size=&q=` — paginated market news |
| `/watchlist` | `GET`, `POST` (add symbol), `DELETE /{symbol}` |
| `/ai` | `/ask`, `/analyse/portfolio`, `/analyse/stock/{symbol}`, `/explain/strategy`, `/interpret/backtest` |
| `/users` | `GET/POST /users/me`, `POST /users/change-password` |

> 📖 Interactive Swagger UI available at: **http://localhost:8080/api/v1/swagger-ui**

---

## 🗄 Database Schema

The database is managed via **Flyway migrations** (V1–V8). Key tables:

| Table | Description |
|-------|-------------|
| `users` | User accounts, roles, 2FA secrets, login tracking |
| `refresh_tokens` | JWT refresh token rotation |
| `verification_tokens` | Email verification & password reset tokens |
| `portfolios` | Virtual portfolios (up to 5 per user) |
| `holdings` | Current stock positions with avg cost tracking |
| `transactions` | Full trade history (BUY/SELL) |
| `portfolio_snapshots` | Daily NAV snapshots for equity curve |
| `stocks` | Stock metadata registry |
| `stock_quotes` | Cached real-time price data |
| `watchlist` / `watchlist_items` | User watchlists |
| `strategies` | Trading strategy definitions + JSON rule config |
| `backtests` | Async backtest results (status, metrics, trades) |
| `audit_logs` | Security audit trail |
| `price_alerts` | Price threshold alerts |
| `notifications` | In-app notification feed |
| `user_preferences` | Theme, currency, timezone settings |

---

## 🧪 Testing

```bash
# Run all tests (excluding Testcontainers — requires Docker)
cd apps/backend
mvn test -DskipTests=false

# Run only unit tests (no Docker needed)
mvn test -Dtest="AuthServiceTest,PortfolioServiceTest,BacktestServiceTest,JwtServiceTest"

# Run frontend type checks
cd frontend
npm run build
```

### Test Coverage (Phase 15)

| Test Class | Coverage |
|-----------|---------|
| `AuthServiceTest` | Register, duplicate email, updateProfile, changePassword (7 tests) |
| `PortfolioServiceTest` | BUY/SELL execution, balance checks, avg cost, listing (7 tests) |
| `BacktestServiceTest` | initiateBacktest, ownership, async engine, empty data (5 tests) |
| `JwtServiceTest` | Token generation, claims, validation, expiry (14 tests) |

---

## 🔄 Development Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Active development |

### Phase Progress

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Scaffold | ✅ | Monorepo, Maven, Next.js 14 setup |
| Phase 2 — Database | ✅ | Flyway migrations, all 20+ entities |
| Phase 3 — Auth | ✅ | JWT HS512, 2FA, email verification |
| Phase 4 — Market Data | ✅ | Finnhub/AlphaVantage providers, WebSocket STOMP |
| Phase 5 — Portfolio | ✅ | Paper trading, watchlist, daily snapshots |
| Phase 6 — Frontend Foundation | ✅ | API client, Zustand stores, auth pages |
| Phase 7 — Dashboard UI | ✅ | 7 widgets, live price bar, responsive layout |
| Phase 8 — Analytics | ✅ | Risk metrics page, equity curve chart |
| Phase 9 — Strategy Builder | ✅ | Strategy CRUD, rule config |
| Phase 10 — Backtesting | ✅ | Async engine: SMA Crossover, RSI, Buy & Hold |
| Phase 11 — AI Integration | ✅ | Gemini Flash — 5 AI endpoints |
| Phase 12 — News | ✅ | Paginated news feed with search |
| Phase 13 — Real-Time | ✅ | STOMP WebSocket, quote subscriptions |
| Phase 15 — Unit Tests | 🔄 | JUnit 5 + Mockito (33 tests across 4 classes) |
| Phase 16 — DevOps | ✅ | Docker Compose, GitHub Actions CI/CD |

---

## 💰 Cost Breakdown

**Total cost: ₹0 / $0**

| Component | Cost | How |
|-----------|------|-----|
| Hosting | ₹0 | Run locally / free cloud tiers |
| Database | ₹0 | Self-hosted PostgreSQL via Docker |
| Cache | ₹0 | Self-hosted Redis via Docker |
| Market Data | ₹0 | Finnhub free tier (60 req/min) |
| AI | ₹0 | Gemini Flash free tier (1M tokens/month) |
| CI/CD | ₹0 | GitHub Actions free tier |

---

## 📚 Documentation

All documentation lives in the repository root:

| File | Description |
|------|-------------|
| [`TECH_SPEC.md`](TECH_SPEC.md) | Full technical specification (16 phases) |
| [`SCHEMA.md`](SCHEMA.md) | Complete database schema reference |
| [`APPFLOW.md`](APPFLOW.md) | Application flow diagrams |
| [`DESIGN.md`](DESIGN.md) | UI/UX design system |
| [`IMPLEMENTATION.md`](IMPLEMENTATION.md) | Phase-by-phase implementation log |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Docker & production deployment guide |
| [`TRACKER.md`](TRACKER.md) | Detailed development tracker |
| [`CURRENT_STATUS.md`](CURRENT_STATUS.md) | Live project status |

---

## 🤝 Contributing

This is a personal portfolio project. If you'd like to suggest improvements or report bugs, feel free to open an Issue.

---

## 📜 License

MIT © 2026 [Gourav Gupta](https://github.com/gouravgupta29092006-rgb)

---

<div align="center">

**Built with ❤️ as a ₹0 cost full-stack engineering portfolio project**

*Spring Boot 3.3 · Java 21 · Next.js 14 · PostgreSQL 16 · Redis 7 · Gemini AI*

</div>
