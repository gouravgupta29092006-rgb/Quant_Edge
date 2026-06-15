# QuantEdge

> **Production-grade AI-powered financial intelligence platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)

QuantEdge combines virtual portfolio simulation, professional analytics, strategy backtesting, market intelligence, and AI-powered insights in a single platform. **Strictly educational — no real money.**

---

## 🎯 What It Does

| Feature | Description |
|---|---|
| **Virtual Portfolio** | Simulate trades with real market data. No real money. |
| **Analytics Engine** | Sharpe Ratio, VaR, Max Drawdown, Beta, Correlation Matrix |
| **Strategy Builder** | Visual if/then rule builder + natural language to strategy via AI |
| **Backtesting** | Test strategies against 5+ years of historical data |
| **Market Intelligence** | Real-time quotes, news, earnings calendar, sector heatmaps |
| **AI Analyst** | Claude-powered portfolio analysis, strategy review, financial tutoring |

---

## 🏗 Architecture

```
                    ┌─────────────────────┐
                    │   Next.js Frontend   │
                    │   Port 3000          │
                    └──────────┬──────────┘
                               │ REST + WebSocket
                    ┌──────────▼──────────┐
                    │   Express API        │
                    │   Port 8080          │
                    └────┬──────────┬─────┘
                         │          │
              ┌──────────▼──┐  ┌───▼──────────┐
              │ PostgreSQL 16│  │  Redis 7      │
              │ (Primary DB) │  │  (Cache+Queue)│
              └─────────────┘  └──────────────┘
```

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript 5, Tailwind CSS, shadcn/ui |
| Backend | Express.js 4, TypeScript 5, Prisma 5, Node.js 20 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, BullMQ |
| Real-Time | Socket.io 4 |
| AI | Anthropic Claude claude-sonnet-4-6 |
| Charts | TradingView Lightweight Charts, Recharts, D3 |
| Auth | JWT RS256, bcrypt, TOTP 2FA |
| Email | Resend |
| Infrastructure | Docker, Turborepo |

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version   # >= 20.x
npm --version    # >= 10.x
docker --version # >= 24.x
docker compose version  # >= 2.x
```

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/quantedge.git
cd quantedge
npm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
# PostgreSQL → localhost:5432
# Redis      → localhost:6379
```

### 3. Configure Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env and fill in API keys

# Frontend
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

### 4. Generate RSA Keys (JWT)

```bash
mkdir -p apps/backend/keys
openssl genrsa -out apps/backend/keys/private.pem 2048
openssl rsa -in apps/backend/keys/private.pem -pubout -out apps/backend/keys/public.pem
```

### 5. Set Up Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed initial data
```

### 6. Run Development

```bash
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# API Docs: http://localhost:8080/api/v1/health
```

---

## 📁 Project Structure

```
quantedge/
├── apps/
│   ├── frontend/        ← Next.js 14 (App Router)
│   └── backend/         ← Express.js API
├── packages/
│   └── shared/          ← Shared TypeScript types
├── docker-compose.yml   ← Local dev environment
├── turbo.json           ← Turborepo config
└── package.json         ← Root workspace
```

---

## 🔑 API Keys Required

| Service | Purpose | Free Tier |
|---|---|---|
| [Polygon.io](https://polygon.io) | Market data (quotes, OHLCV, movers) | Limited |
| [Finnhub](https://finnhub.io) | News, sentiment, fundamentals | 60 req/min |
| [Alpha Vantage](https://alphavantage.co) | Historical data fallback | 25 req/day |
| [Anthropic](https://console.anthropic.com) | All AI features | Pay-as-you-go |
| [Resend](https://resend.com) | Transactional email | 100/day |

---

## 🧪 Testing

```bash
npm run test          # All tests
npm run test:backend  # Backend unit + integration tests
npm run test:frontend # Frontend component tests
npm run test:e2e      # Playwright end-to-end tests
```

---

## 📜 License

MIT © QuantEdge
