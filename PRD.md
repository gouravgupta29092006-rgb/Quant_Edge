# QuantEdge — Product Requirements Document (PRD)

> **Version:** 1.0.0 | **Status:** Approved | **Date:** June 2026 | **Classification:** Internal

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Target Users & Personas](#4-target-users--personas)
5. [Product Scope](#5-product-scope)
6. [Feature Requirements](#6-feature-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [User Stories](#8-user-stories)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Success Metrics & KPIs](#10-success-metrics--kpis)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Dependencies](#12-dependencies)
13. [Constraints & Assumptions](#13-constraints--assumptions)
14. [Competitive Analysis](#14-competitive-analysis)
15. [Glossary](#15-glossary)

---

## 1. EXECUTIVE SUMMARY

QuantEdge is a production-grade, AI-powered financial intelligence platform that combines virtual trading simulation, portfolio analytics, strategy backtesting, and market intelligence into a single modern web application.

The platform is strictly **educational and analytical** — no real money is ever transacted. It targets four segments: beginner investors, finance students, quantitative strategy builders, and market enthusiasts.

QuantEdge bridges the gap between consumer investing apps (Robinhood, Wealthfront) and expensive professional tools (Bloomberg Terminal, TradingView Pro) by combining professional-grade analytics with AI-powered explanations and an intuitive dark-mode interface accessible to anyone.

**Core Value Proposition:** Learn investing, simulate trades, build strategies, backtest against history, and get AI-powered intelligence — all in one platform, risk-free.

---

## 2. PROBLEM STATEMENT

### 2.1 Market Gap Analysis

| Tool | Strength | Gap |
|---|---|---|
| Robinhood / IBKR | Real trading | No analytics, no education, real risk |
| Bloomberg Terminal | Professional-grade | $24,000/year, inaccessible |
| TradingView | Charts & TA | No portfolio analytics, no AI |
| Wealthfront | Auto portfolios | No education, no strategy building |
| Investopedia | Education | No live data, no simulation |
| Backtrader / Zipline | Backtesting | Requires Python, no UI |
| Yahoo Finance | Free data | No simulation, no AI |

### 2.2 Core Pain Points

**P-001 — The Learning-Doing Gap**
Beginners can read educational content OR open a brokerage, but there is no risk-free bridge where learning and practicing coexist seamlessly.

**P-002 — Analytical Inaccessibility**
Professional portfolio metrics (Sharpe Ratio, VaR, Beta, Max Drawdown) are locked behind expensive tools or require quantitative programming skills.

**P-003 — Strategy Testing Friction**
Validating a trading strategy requires Python coding (Backtrader, Zipline, Vectorbt), creating a massive barrier for non-developers.

**P-004 — Fragmented Intelligence**
Price data, news, sentiment, earnings, economic events, and analysis exist across 10+ separate tools — no unified intelligence layer.

**P-005 — AI Insight Vacuum**
Every tool provides raw data but none contextualizes it with intelligent, natural-language explanations adapted to the user's level.

---

## 3. SOLUTION OVERVIEW

### 3.1 The Five Pillars of QuantEdge

| Pillar | What It Solves | Core Modules |
|---|---|---|
| **Virtual Trading Simulator** | Risk-free practice | Portfolio, Transactions, Order Execution |
| **Analytics Engine** | Professional-grade metrics | Analytics, Risk Analysis, Benchmark |
| **Strategy Builder + Backtester** | No-code strategy validation | Strategy Builder, Backtesting Engine |
| **Market Intelligence Hub** | Unified data & news | Markets, News, Watchlists, Economic Calendar |
| **AI Analyst Layer** | Contextual intelligence on everything | AI Insights, AI Chat, Streaming Explanations |

### 3.2 Product Feel
QuantEdge = TradingView (charts) + Bloomberg (information density) + Wealthfront (portfolio UX) + Perplexity (AI research) + Investopedia (education)

---

## 4. TARGET USERS & PERSONAS

### 4.1 Alex — The Beginner Investor
| Attribute | Detail |
|---|---|
| Age | 22–30 |
| Background | First job, wants to start investing, overwhelmed by complexity |
| Goals | Learn stocks, practice without losing money, understand risk |
| Pain Points | Confused by charts, scared of P&L, doesn't know what metrics mean |
| Key Features | AI Tutor, Simplified Dashboard, Portfolio Simulator, Guided Onboarding |
| Success Metric | Creates portfolio + executes 5 trades within first week |

### 4.2 Priya — The Finance Student
| Attribute | Detail |
|---|---|
| Age | 19–24 |
| Background | Finance/Economics student, needs tools for coursework or internship prep |
| Goals | Test academic theories, demonstrate knowledge, build impressive projects |
| Pain Points | No Bloomberg access at university, needs real data, no free backtesting |
| Key Features | Backtesting Engine, Full Analytics Suite, Data Export, Strategy Library |
| Success Metric | Runs 3+ backtests and exports analytics report |

### 4.3 Marcus — The Strategy Builder
| Attribute | Detail |
|---|---|
| Age | 28–45 |
| Background | Experienced investor exploring quantitative approaches |
| Goals | Create, test, and refine algorithmic-style strategies without a brokerage |
| Pain Points | Python backtesting is manual, no easy comparison, no visual rule builder |
| Key Features | Visual Strategy Builder, Advanced Backtester, AI Strategy Assistant |
| Success Metric | Builds 5+ strategies, runs comparisons, iterates based on AI feedback |

### 4.4 Tanisha — The Finance Enthusiast
| Attribute | Detail |
|---|---|
| Age | 25–40 |
| Background | Tech professional, reads financial news daily, manages personal investments |
| Goals | Deep market intelligence, unified research tool, AI-powered insights |
| Pain Points | Fragmented tools, no AI context for market events, no unified dashboard |
| Key Features | AI Insights, Market Intelligence, News Aggregation, Portfolio Analytics |
| Success Metric | Daily active usage > 10 minutes, 3+ AI insights per week |

---

## 5. PRODUCT SCOPE

### 5.1 In Scope — MVP (Phase 1-2, ~8 weeks)
- User authentication (JWT, refresh tokens, email verification, 2FA)
- Virtual portfolio management (create, buy, sell, track)
- Real-time (delayed) market data via API integration
- Stock search, detail pages, key statistics
- Basic portfolio analytics (P&L, allocation, returns)
- Market news aggregation (Finnhub)
- Watchlists with price alerts
- AI portfolio analysis (Claude API, streaming)
- Dashboard with all core widgets
- Notification center
- Admin panel (basic)
- Landing website

### 5.2 In Scope — Growth (Phase 3-4, ~6 weeks)
- Advanced analytics (Sharpe, Sortino, VaR, Beta, Max Drawdown, Correlation)
- Visual Strategy Builder
- Backtesting Engine with step-based progress
- AI strategy review and backtest interpretation
- Personalized news feed
- Sentiment analysis
- Daily AI market brief
- Economic and earnings calendar
- AI chat interface
- PDF/CSV export
- Real-time WebSocket price updates

### 5.3 Explicitly Out of Scope
- Real money trading or brokerage integration
- Cryptocurrency trading
- Payment processing / subscription billing (v1 is free)
- Native iOS / Android app (web-responsive only)
- International exchange data (US markets only, Phase 1)
- Social features / copy trading
- Regulatory compliance (FINRA, SEC) — educational platform disclaimer
- Machine learning model training (uses third-party AI APIs only)

---

## 6. FEATURE REQUIREMENTS

### 6.1 Authentication (AUTH)

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| AUTH-001 | Email + password registration with strength validation | P0 | Min 8 chars, 1 uppercase, 1 number, 1 special |
| AUTH-002 | Email verification on signup (24h expiry link) | P0 | Resend email option |
| AUTH-003 | Login returns JWT access (15m) + refresh token (30d) | P0 | Refresh token rotation |
| AUTH-004 | Forgot password → email link → reset form | P0 | 1h token expiry |
| AUTH-005 | TOTP-based 2FA with QR code setup | P1 | speakeasy RFC 6238 |
| AUTH-006 | Session management — view and revoke active sessions | P1 | Device info + IP shown |
| AUTH-007 | Account deletion with 30-day grace period | P2 | Data anonymization |
| AUTH-008 | Brute-force protection: lock after 5 failed attempts | P0 | 15-min lockout |

### 6.2 Dashboard (DASH)

| ID | Requirement | Priority |
|---|---|---|
| DASH-001 | Portfolio value hero: value, daily P&L, total return, risk score | P0 |
| DASH-002 | Performance chart with 1D/1W/1M/3M/1Y/All time ranges | P0 |
| DASH-003 | Asset allocation donut chart (sector and holding breakdown) | P0 |
| DASH-004 | Watchlist widget with live prices and sparklines | P0 |
| DASH-005 | Top market movers widget (gainers + losers) | P0 |
| DASH-006 | AI Insights panel (latest insight, rotating) | P1 |
| DASH-007 | Latest news widget (5 most recent articles) | P0 |
| DASH-008 | Portfolio Health Score (0-100 composite metric) | P1 |
| DASH-009 | Market status indicator (Open/Closed/Pre/Post) | P0 |
| DASH-010 | AI Daily Market Brief summary | P1 |
| DASH-011 | Skeleton loading for all widgets | P0 |

### 6.3 Markets (MKT)

| ID | Requirement | Priority |
|---|---|---|
| MKT-001 | Market overview: S&P 500, NASDAQ, DOW, Russell 2000, VIX | P0 |
| MKT-002 | Stock search with ticker + name autocomplete (debounced 300ms) | P0 |
| MKT-003 | Top gainers / losers / most active (refreshed every 1m) | P0 |
| MKT-004 | Sector performance heatmap with % change | P1 |
| MKT-005 | Economic calendar: Fed meetings, CPI, NFP, GDP | P1 |
| MKT-006 | Earnings calendar with upcoming reports | P1 |
| MKT-007 | Stock comparison tool (up to 5 tickers on same chart) | P1 |
| MKT-008 | Trending stocks by news mentions and search volume | P1 |
| MKT-009 | Pre-market and after-hours price data | P2 |

### 6.4 Stock Detail (STOCK)

| ID | Requirement | Priority |
|---|---|---|
| STOCK-001 | Price chart (TradingView LW Charts) with 1D/1W/1M/3M/6M/1Y/5Y | P0 |
| STOCK-002 | Company header: ticker, name, price, change, market status | P0 |
| STOCK-003 | Key statistics: Market Cap, P/E, EPS, Beta, Volume, 52W H/L, Div Yield | P0 |
| STOCK-004 | Add/remove from watchlist button | P0 |
| STOCK-005 | Virtual buy/sell order form (market order, limit order) | P0 |
| STOCK-006 | AI-generated company summary (cached 6h) | P1 |
| STOCK-007 | Related news articles (10 most recent) | P0 |
| STOCK-008 | Historical OHLCV data table (paginated) | P1 |
| STOCK-009 | Sentiment score (news + social sentiment) | P1 |
| STOCK-010 | Similar companies / peer comparison | P2 |
| STOCK-011 | Earnings history chart | P2 |

### 6.5 Portfolio (PORT)

| ID | Requirement | Priority |
|---|---|---|
| PORT-001 | Create multiple named virtual portfolios | P0 |
| PORT-002 | Holdings table: ticker, shares, avg cost, current price, P&L, weight% | P0 |
| PORT-003 | Transaction history: buy, sell, dividend, cash deposits | P0 |
| PORT-004 | Portfolio performance chart vs benchmark | P0 |
| PORT-005 | Virtual cash management: deposit / withdraw | P0 |
| PORT-006 | Allocation breakdown by sector and asset | P0 |
| PORT-007 | Benchmark comparison (SPY, QQQ, DIA) | P1 |
| PORT-008 | AI rebalancing suggestions | P2 |
| PORT-009 | Dividend tracking | P2 |
| PORT-010 | Multiple portfolio comparison | P2 |

### 6.6 Analytics (ANLYT)

| ID | Requirement | Priority |
|---|---|---|
| ANLYT-001 | Total return and annualized return | P0 |
| ANLYT-002 | Annualized volatility (standard deviation of returns) | P0 |
| ANLYT-003 | Sharpe Ratio (vs risk-free rate) | P0 |
| ANLYT-004 | Sortino Ratio (downside deviation only) | P1 |
| ANLYT-005 | Maximum Drawdown (peak-to-trough) | P0 |
| ANLYT-006 | Beta vs benchmark | P1 |
| ANLYT-007 | Value at Risk (parametric, 95% and 99% confidence) | P1 |
| ANLYT-008 | Diversification Score | P1 |
| ANLYT-009 | Correlation matrix (heatmap) | P1 |
| ANLYT-010 | Rolling return chart (30d, 90d, 252d windows) | P2 |
| ANLYT-011 | AI plain-English analytics explanation | P1 |
| ANLYT-012 | Export analytics as PDF report | P2 |

### 6.7 Strategy Builder (STRAT)

| ID | Requirement | Priority |
|---|---|---|
| STRAT-001 | Visual if/then rule builder (no code required) | P0 |
| STRAT-002 | Indicator library: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP | P0 |
| STRAT-003 | Natural language → strategy conversion via AI | P1 |
| STRAT-004 | Strategy library with save, name, tag, duplicate | P0 |
| STRAT-005 | Strategy validation (detect conflicting rules) | P1 |
| STRAT-006 | Strategy confidence meter (AI viability assessment) | P1 |
| STRAT-007 | Public strategy sharing / strategy marketplace | P2 |

### 6.8 Backtesting (BT)

| ID | Requirement | Priority |
|---|---|---|
| BT-001 | Configure: ticker, date range, initial capital, commission, position sizing | P0 |
| BT-002 | Step-by-step progress: Load Data → Indicators → Simulate → Evaluate → Report | P0 |
| BT-003 | Results: total return, CAGR, Sharpe, max drawdown, win rate, total trades | P0 |
| BT-004 | Equity curve chart vs buy-and-hold benchmark | P0 |
| BT-005 | Trade log: entry date, exit date, entry price, exit price, P&L per trade | P0 |
| BT-006 | Monthly return calendar heatmap | P1 |
| BT-007 | AI backtest interpretation (streaming) | P1 |
| BT-008 | Side-by-side backtest comparison | P2 |
| BT-009 | Walk-forward optimization | P3 |
| BT-010 | Backtest timeout: 5 minutes max, graceful error | P0 |

### 6.9 News (NEWS)

| ID | Requirement | Priority |
|---|---|---|
| NEWS-001 | General market news aggregation (Finnhub + Polygon) | P0 |
| NEWS-002 | Stock-specific news by ticker | P0 |
| NEWS-003 | AI-generated article summary (1 paragraph, cached 7d) | P1 |
| NEWS-004 | Sentiment badge per article (Bullish / Bearish / Neutral) | P1 |
| NEWS-005 | Personalized feed based on holdings and watchlist | P1 |
| NEWS-006 | Daily AI market brief (auto-generated at 8am ET) | P1 |
| NEWS-007 | Earnings news coverage | P1 |
| NEWS-008 | News search and category filter | P2 |
| NEWS-009 | Article bookmarking | P2 |

### 6.10 AI Features (AI)

| ID | Requirement | Priority |
|---|---|---|
| AI-001 | Portfolio Analyst: full analysis on demand, streaming SSE | P0 |
| AI-002 | Strategy Assistant: create strategies from natural language | P1 |
| AI-003 | Market Research: ask about any stock or topic | P1 |
| AI-004 | Backtest Interpreter: explain results in plain English | P1 |
| AI-005 | Financial Tutor: explain any finance concept | P1 |
| AI-006 | Risk Analyzer: identify portfolio concentration and tail risks | P1 |
| AI-007 | News Explainer: explain market events in plain English | P1 |
| AI-008 | AI Chat: free-form conversation about markets | P2 |
| AI-009 | All AI responses stream progressively (SSE) | P0 |
| AI-010 | AI usage rate limiting: 20 calls/hour, 100 calls/day per user | P0 |
| AI-011 | AI response caching by context hash (Redis, 6h TTL) | P0 |
| AI-012 | AI usage monitoring per user and globally (admin) | P0 |
| AI-013 | Rotating status messages during AI generation | P0 |

### 6.11 Notifications (NOTIF)

| ID | Requirement | Priority |
|---|---|---|
| NOTIF-001 | Price alerts: trigger when stock crosses threshold | P1 |
| NOTIF-002 | Portfolio value alerts (% change threshold) | P1 |
| NOTIF-003 | Earnings event reminders | P1 |
| NOTIF-004 | Backtest completion notification | P0 |
| NOTIF-005 | In-app notification center with read/unread state | P0 |
| NOTIF-006 | Real-time notifications via WebSocket | P1 |
| NOTIF-007 | Email notifications (daily digest, configurable) | P2 |
| NOTIF-008 | Browser push notifications | P2 |

### 6.12 Admin Panel (ADMIN)

| ID | Requirement | Priority |
|---|---|---|
| ADMIN-001 | User management: list, search, suspend, restore, role change | P0 |
| ADMIN-002 | Market data health: API status, data freshness, error rates | P0 |
| ADMIN-003 | AI usage: total tokens, cost estimate, top users | P0 |
| ADMIN-004 | System health: CPU, memory, DB connections, queue depth | P0 |
| ADMIN-005 | Audit log viewer with filters | P0 |
| ADMIN-006 | Feature flags: toggle features per user/role/global | P1 |
| ADMIN-007 | Platform analytics: DAU, MAU, feature usage | P1 |
| ADMIN-008 | News source management | P1 |

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-P001 | Dashboard initial load (LCP) | < 2.5 seconds |
| NFR-P002 | API response time P95 | < 500ms |
| NFR-P003 | Stock search autocomplete latency | < 200ms |
| NFR-P004 | Price data refresh interval | 15 seconds |
| NFR-P005 | AI streaming first token | < 2 seconds |
| NFR-P006 | Backtest completion (1 year, 1 ticker) | < 30 seconds |
| NFR-P007 | Initial JS bundle size (gzipped) | < 250KB |

### 7.2 Security

| ID | Requirement | Implementation |
|---|---|---|
| NFR-S001 | All API keys server-side only | .env + AWS Secrets Manager |
| NFR-S002 | All inputs validated and sanitized | Zod + DOMPurify |
| NFR-S003 | Rate limiting on all endpoints | express-rate-limit (tiered) |
| NFR-S004 | Passwords hashed with bcrypt | Cost factor 12 |
| NFR-S005 | SQL injection prevention | Prisma parameterized queries only |
| NFR-S006 | XSS prevention | CSP headers + input sanitization |
| NFR-S007 | CSRF protection | SameSite=Strict cookies + origin check |
| NFR-S008 | All responses include security headers | Helmet.js |
| NFR-S009 | JWT tokens signed with RS256 | Asymmetric key pair |
| NFR-S010 | All privileged actions audited | audit_logs table |

### 7.3 Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-SC001 | Concurrent active users (MVP) | 1,000 |
| NFR-SC002 | Concurrent active users (Scale) | 50,000 |
| NFR-SC003 | Database connection pooling | Prisma + PgBouncer |
| NFR-SC004 | Stateless API for horizontal scaling | No server-side sessions |
| NFR-SC005 | Job queue for async work | BullMQ + Redis |

### 7.4 Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-R001 | API uptime | 99.5% |
| NFR-R002 | Graceful degradation on external API failure | Show cached data, never blank page |
| NFR-R003 | Database backup | Daily automated, 30-day retention |
| NFR-R004 | Max allowed error rate | < 0.5% of all requests |

### 7.5 Accessibility

| ID | Requirement | Standard |
|---|---|---|
| NFR-A001 | WCAG 2.1 AA compliance | All interactive elements |
| NFR-A002 | Full keyboard navigation | Tab order correct, no traps |
| NFR-A003 | Screen reader support | ARIA labels on all interactive elements |
| NFR-A004 | Color contrast ratio | Minimum 4.5:1 (text), 3:1 (large text) |
| NFR-A005 | Reduced motion respect | prefers-reduced-motion |

---

## 8. USER STORIES

### Authentication
- As a new user, I want to register with email/password so I can access the platform
- As a user, I want to verify my email so my account is secured
- As a user, I want to enable 2FA so unauthorized access is blocked
- As a user, I want to reset my password if I forget it, without contacting support
- As a user, I want to see all active sessions so I can revoke unfamiliar ones

### Portfolio
- As a user, I want to create a named virtual portfolio so I can organize my simulated investments
- As a user, I want to search for a stock and buy shares so I can start building my portfolio
- As a user, I want to see my portfolio P&L in real-time so I know how I'm performing
- As a user, I want to compare my portfolio return against the S&P 500 so I can measure relative performance
- As a user, I want to see my allocation breakdown so I understand my diversification

### Analytics
- As a user, I want to see my Sharpe Ratio so I understand my risk-adjusted performance
- As a user, I want to see my portfolio's maximum drawdown so I know my worst loss period
- As a user, I want an AI to explain all my analytics in plain English so I can understand them without a finance degree
- As a user, I want to export a PDF analytics report so I can share my portfolio performance

### Strategy & Backtesting
- As a strategy builder, I want to create buy/sell rules visually so I don't need to write code
- As a strategy builder, I want to describe my strategy in plain English and have AI convert it to rules
- As a strategy builder, I want to backtest my strategy on 5 years of historical data
- As a strategy builder, I want to see a trade-by-trade log of my backtest results
- As a strategy builder, I want the AI to tell me what's wrong with my strategy

### AI Insights
- As a user, I want to ask the AI to analyze my entire portfolio so I get expert-level feedback
- As a beginner, I want the AI to explain what Sharpe Ratio means so I can learn
- As a user, I want AI to summarize news articles so I can stay informed quickly
- As a user, I want the AI to identify the risks in my portfolio so I can manage them

---

## 9. ACCEPTANCE CRITERIA

### AUTH-003 — JWT Login
- ✅ Returns `access_token` (JWT, expires 15m) and `refresh_token` (expires 30d)
- ✅ Refresh token hash stored in DB, plain token never stored
- ✅ Failed login attempts tracked; 5 failures → 15-minute lockout
- ✅ Successful login creates audit_log entry with IP and user agent

### PORT-002 — Holdings Table
- ✅ Shows all holdings with ticker, company name, shares, avg cost, current price, unrealized P&L, P&L %, weight %
- ✅ P&L value color-coded green (positive) / red (negative)
- ✅ Updates within 15 seconds of market price change
- ✅ Handles empty state with "Add your first stock" CTA

### BT-002 — Backtest Progress
- ✅ Shows exactly 5 steps with names and current percentage
- ✅ Each step updates via WebSocket event
- ✅ Completion triggers success notification
- ✅ Timeout after 5 minutes with error state

### AI-001 — Portfolio Analysis
- ✅ Streaming begins within 2 seconds of request
- ✅ Status messages rotate every 2s during generation
- ✅ Identical context hash returns cached response (no new API call)
- ✅ Usage count incremented, user shown remaining daily quota

---

## 10. SUCCESS METRICS & KPIs

### Engagement
| Metric | MVP Target (Month 3) | Growth Target (Month 6) |
|---|---|---|
| Monthly Active Users | 200 | 1,000 |
| Daily Active Users | 50 | 250 |
| Avg Session Duration | > 6 min | > 10 min |
| Portfolio Creation Rate | > 50% of users | > 70% |
| Backtest Execution Rate | > 20% of users | > 40% |
| AI Interactions/User/Week | > 2 | > 5 |
| 7-Day Return Rate | > 30% | > 50% |

### Technical
| Metric | Target |
|---|---|
| API Error Rate | < 0.5% |
| P95 Latency | < 500ms |
| Core Web Vitals (LCP) | < 2.5s |
| Unit Test Coverage | > 70% |
| MTTR (Mean Time to Resolve) | < 4 hours |

---

## 11. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Market data API cost overrun | High | Medium | Aggressive Redis caching, smart TTLs, free-tier first |
| AI API cost explosion | Very High | High | Per-user rate limits, response caching, token budgets |
| Market data provider downtime | Medium | Medium | Circuit breaker, fallback to cached data, multi-provider |
| Backtest engine CPU overload | Medium | Medium | Worker threads, job timeouts, queue concurrency limits |
| Security breach / data leak | Very High | Low | JWT rotation, rate limiting, audit logs, input sanitization |
| Scope creep | High | High | Strict phase-gated development, prioritized backlog |
| External API key exposure | High | Low | Server-side only, env vars, secrets manager, no frontend keys |

---

## 12. DEPENDENCIES

### 12.1 External APIs
| Service | Purpose | Free Tier | Production Cost |
|---|---|---|---|
| **Polygon.io** | Real-time + historical stock data | Limited | $29/mo (Starter) |
| **Finnhub** | News, sentiment, fundamentals, earnings | 60 req/min | $50/mo (Premium) |
| **Alpha Vantage** | Historical data fallback, economic indicators | 25 req/day | $50/mo |
| **Anthropic Claude** | All AI features | None | ~$0.003/1K tokens |
| **Resend** | Transactional email | 100/day free | $20/mo |
| **AWS** | Hosting, DB, Cache, Storage | 12-month free tier | Variable |

### 12.2 Open-Source Dependencies (Key)
- Next.js 14, React 18, TypeScript 5
- Express.js 4, Prisma 5, Zod 3
- BullMQ 4, Socket.io 4
- TradingView Lightweight Charts 4
- shadcn/ui, Tailwind CSS 3, Lucide React
- Jest, Supertest, Playwright

---

## 13. CONSTRAINTS & ASSUMPTIONS

### Constraints
- Platform is web-only (no native mobile app in v1)
- US markets only (no international exchanges in v1)
- Market data is delayed 15 minutes (real-time requires expensive API tier)
- No real money — strict educational disclaimer on all pages
- Single developer / small team — architecture must prioritize DX

### Assumptions
- Users have stable internet (no offline mode required)
- Users are 18+ (no minor-specific restrictions needed)
- Primary device is desktop/laptop (mobile is responsive, not primary)
- English-only (no i18n in v1)
- UTC and US Eastern time zones (no global timezone support in v1)

---

## 14. COMPETITIVE ANALYSIS

| Feature | QuantEdge | TradingView | Bloomberg | Wealthfront | Backtrader |
|---|---|---|---|---|---|
| Virtual Portfolio | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI Analysis | ✅ | Limited | Limited | ❌ | ❌ |
| No-Code Backtesting | ✅ | ✅ (paid) | ❌ | ❌ | ❌ |
| Portfolio Analytics | ✅ | Limited | ✅ | ✅ | ✅ |
| Free Tier | ✅ | ✅ | ❌ | ❌ | ✅ |
| Modern UI | ✅ | ✅ | ❌ | ✅ | ❌ |
| Financial Education | ✅ | ❌ | Limited | ❌ | ❌ |
| Price | Free | $15-60/mo | $24,000/yr | % of AUM | Free |

---

## 15. GLOSSARY

| Term | Definition |
|---|---|
| P&L | Profit and Loss — the gain or loss on an investment |
| Sharpe Ratio | (Portfolio Return - Risk Free Rate) / Portfolio Volatility |
| Sortino Ratio | Like Sharpe but denominator uses only downside deviation |
| Max Drawdown | Largest percentage drop from a portfolio peak to subsequent trough |
| Beta | Sensitivity of portfolio returns relative to benchmark market returns |
| VaR | Value at Risk — maximum expected loss at a given confidence level |
| OHLCV | Open, High, Low, Close, Volume — standard candlestick data |
| Backtest | Running a trading strategy against historical data |
| Virtual Portfolio | Simulated portfolio using real market prices with no real money |
| JWT | JSON Web Token — stateless authentication mechanism |
| SSE | Server-Sent Events — HTTP streaming for AI responses |
| TOTP | Time-based One-Time Password — 2FA standard (RFC 6238) |
| P0/P1/P2 | Priority: P0 = Must Have (MVP), P1 = Should Have, P2 = Nice to Have |
| CAGR | Compound Annual Growth Rate |
| SMA/EMA | Simple/Exponential Moving Average — technical indicators |
| RSI | Relative Strength Index — momentum oscillator |
| MACD | Moving Average Convergence Divergence — trend indicator |
