# QuantEdge — Application Flow

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Purpose:** Every user journey, screen transition, and interaction flow mapped in full.

---

## TABLE OF CONTENTS

1. [Site Map](#1-site-map)
2. [Authentication Flows](#2-authentication-flows)
3. [Onboarding Flow](#3-onboarding-flow)
4. [Dashboard Flow](#4-dashboard-flow)
5. [Markets Flow](#5-markets-flow)
6. [Portfolio & Trading Flow](#6-portfolio--trading-flow)
7. [Analytics Flow](#7-analytics-flow)
8. [Strategy Builder Flow](#8-strategy-builder-flow)
9. [Backtesting Flow](#9-backtesting-flow)
10. [News & Intelligence Flow](#10-news--intelligence-flow)
11. [AI Insights Flow](#11-ai-insights-flow)
12. [Notifications Flow](#12-notifications-flow)
13. [Settings Flow](#13-settings-flow)
14. [Admin Panel Flow](#14-admin-panel-flow)
15. [Error & Edge Case Flows](#15-error--edge-case-flows)
16. [Mobile Navigation Flow](#16-mobile-navigation-flow)

---

## 1. SITE MAP

```
quantedge.app
│
├── / (Landing)
│   ├── /features
│   ├── /pricing
│   ├── /about
│   ├── /blog
│   │   └── /blog/{slug}
│   ├── /careers
│   ├── /contact
│   ├── /faq
│   ├── /privacy
│   ├── /terms
│   └── /docs
│
├── /auth
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/forgot-password
│   ├── /auth/reset-password?token=xxx
│   ├── /auth/verify-email?token=xxx
│   └── /auth/two-factor
│
└── /app (Protected — requires auth)
    ├── /app/dashboard (Default after login)
    │
    ├── /app/markets
    │   ├── /app/markets/overview
    │   ├── /app/markets/stocks/{symbol}  (Stock Detail)
    │   ├── /app/markets/compare
    │   ├── /app/markets/sectors
    │   ├── /app/markets/calendar
    │   └── /app/markets/search?q=xxx
    │
    ├── /app/portfolio
    │   ├── /app/portfolio/{portfolioId}        (Active portfolio)
    │   ├── /app/portfolio/{portfolioId}/holdings
    │   ├── /app/portfolio/{portfolioId}/transactions
    │   ├── /app/portfolio/{portfolioId}/performance
    │   └── /app/portfolio/create
    │
    ├── /app/analytics
    │   ├── /app/analytics/performance
    │   ├── /app/analytics/risk
    │   ├── /app/analytics/allocation
    │   └── /app/analytics/benchmark
    │
    ├── /app/strategies
    │   ├── /app/strategies              (Strategy library)
    │   ├── /app/strategies/create
    │   ├── /app/strategies/{id}         (Strategy detail)
    │   └── /app/strategies/{id}/edit
    │
    ├── /app/backtests
    │   ├── /app/backtests               (Backtest history)
    │   ├── /app/backtests/run           (Configure + run)
    │   └── /app/backtests/{id}          (Results)
    │
    ├── /app/news
    │   ├── /app/news/market             (General market news)
    │   ├── /app/news/personalized       (Holdings-based)
    │   └── /app/news/brief              (Daily AI brief)
    │
    ├── /app/ai
    │   ├── /app/ai/portfolio            (AI Portfolio Analyst)
    │   ├── /app/ai/strategy             (AI Strategy Assistant)
    │   ├── /app/ai/research             (AI Market Research)
    │   ├── /app/ai/tutor                (AI Financial Tutor)
    │   └── /app/ai/chat                 (Free AI Chat)
    │
    ├── /app/notifications
    │
    ├── /app/settings
    │   ├── /app/settings/profile
    │   ├── /app/settings/security
    │   ├── /app/settings/notifications
    │   ├── /app/settings/appearance
    │   └── /app/settings/sessions
    │
    └── /app/admin (role: admin only)
        ├── /app/admin/users
        ├── /app/admin/data-health
        ├── /app/admin/ai-usage
        ├── /app/admin/system
        ├── /app/admin/audit-logs
        └── /app/admin/feature-flags
```

---

## 2. AUTHENTICATION FLOWS

### 2.1 Registration Flow

```
[Landing Page]
  → Click "Get Started" or "Sign Up"
    ↓
[/auth/register]
  Form: firstName, lastName, email, password, confirmPassword
  Validation (real-time):
    • Email format check
    • Password strength meter (Weak/Fair/Strong/Very Strong)
    • Passwords match check
  Submit:
    → POST /api/v1/auth/register
    → Loading state: "Creating your account..."
    → SUCCESS → Show "Check your email" page
    → ERROR (email taken) → Inline error on email field
    → ERROR (validation) → Field-level errors
      ↓
[Email Inbox]
  Verification email from "QuantEdge <noreply@quantedge.app>"
  Subject: "Verify your QuantEdge account"
  Link: https://quantedge.app/auth/verify-email?token=xxx (24h expiry)
    ↓
[/auth/verify-email?token=xxx]
  → API call: POST /api/v1/auth/verify-email { token }
  → Loading: "Verifying your email..."
  → SUCCESS → Redirect /auth/login with toast "Email verified! Sign in to continue"
  → ERROR (expired) → "Link expired. Resend verification email" button
  → ERROR (invalid) → "Invalid link" error page
```

### 2.2 Login Flow

```
[/auth/login]
  Form: email, password
  Options: "Remember me" checkbox (extends refresh token to 30d)
  Link: "Forgot password?" → /auth/forgot-password
  Link: "Don't have an account? Sign up" → /auth/register
  Submit:
    → POST /api/v1/auth/login
    → Loading: "Signing you in..."
    
    Case 1: NO 2FA
      → SUCCESS → Receive access_token + refresh_token
        → Store access_token in memory (Zustand)
        → Store refresh_token in httpOnly cookie
        → Redirect /app/dashboard
    
    Case 2: 2FA ENABLED
      → Receive interim token "2fa_pending"
      → Redirect /auth/two-factor
        ↓
      [/auth/two-factor]
        Form: 6-digit TOTP code (auto-submit on 6th digit)
        → POST /api/v1/auth/verify-2fa { code, interim_token }
        → SUCCESS → Full auth tokens → Redirect /app/dashboard
        → ERROR → "Invalid code. Try again." (3 attempts max)
        → 3rd fail → Back to login with "Too many attempts" message
    
    Case 3: ACCOUNT LOCKED
      → Error: "Account temporarily locked after 5 failed attempts. Try again in X minutes."
      → Show countdown timer
    
    Case 4: UNVERIFIED EMAIL
      → Error + "Resend verification email" button
```

### 2.3 Forgot Password Flow

```
[/auth/forgot-password]
  Form: email
  Submit:
    → POST /api/v1/auth/forgot-password
    → Always show: "If that email exists, a reset link was sent" (prevent enumeration)
    → Email sent (if account exists):
      Subject: "Reset your QuantEdge password"
      Link: https://quantedge.app/auth/reset-password?token=xxx (1h expiry)
        ↓
[/auth/reset-password?token=xxx]
  Form: newPassword, confirmPassword
  Password strength meter shown
  Submit:
    → POST /api/v1/auth/reset-password { token, newPassword }
    → SUCCESS → Redirect /auth/login with toast "Password reset! Sign in."
    → ERROR (expired) → "This link has expired. Request a new one."
    → ERROR (used) → "This link has already been used."
```

### 2.4 Token Refresh Flow (Silent, Background)

```
Every API request:
  → Attach Authorization: Bearer {access_token}
  → If 401 response:
    → Call POST /api/v1/auth/refresh (sends httpOnly refresh token cookie)
    → New access_token received → Retry original request
    → If refresh also fails → Logout user → Redirect /auth/login with message
```

### 2.5 Logout Flow

```
[Avatar Menu] → "Sign Out"
  → POST /api/v1/auth/logout (invalidates refresh token in DB)
  → Clear Zustand auth state
  → Clear httpOnly cookie
  → Redirect /auth/login
  → Toast: "You've been signed out"
  
"Sign Out All Devices":
  → POST /api/v1/auth/logout-all
  → Invalidates ALL refresh tokens for user
  → Same redirect + toast: "Signed out from all devices"
```

---

## 3. ONBOARDING FLOW

```
[First Login — no portfolios, no watchlist]
  ↓
[Welcome Overlay/Modal]
  Step 1: "Welcome to QuantEdge" + brief value prop
    → "Let's get you set up. This takes about 2 minutes."
    [Continue →]
  
  Step 2: "What best describes you?"
    ○ Beginner Investor (just starting out)
    ○ Finance Student (coursework or career prep)
    ○ Strategy Builder (testing trading ideas)
    ○ Market Enthusiast (research and analytics)
    [Continue →]
  
  Step 3: "Create your first virtual portfolio"
    Name: [My Portfolio] (editable)
    Initial Cash: [$100,000] (dropdown: $10K, $50K, $100K, $250K, $1M)
    [Create Portfolio →]
  
  Step 4: "Add your first stock"
    Search bar → Stock autocomplete
    Add 1-5 stocks to watchlist
    [Skip] or [Done, let me explore!]
  
  Step 5: Success screen
    "You're all set! Here's what you can do..."
    Quick feature tour icons: Trade, Analyze, Backtest, AI Insights
    [Go to Dashboard →]
  
  → Redirect /app/dashboard
  → Dashboard shows contextual tooltips for 3 key elements (dismissible)
```

---

## 4. DASHBOARD FLOW

```
[/app/dashboard]
  Load sequence (parallel fetches):
    → GET /api/v1/portfolio/{id}/summary    (Portfolio Hero)
    → GET /api/v1/portfolio/{id}/chart      (Performance chart)
    → GET /api/v1/watchlist                 (Watchlist widget)
    → GET /api/v1/markets/movers            (Market movers)
    → GET /api/v1/news/market?limit=5       (News widget)
    → GET /api/v1/ai/brief/today            (AI daily brief)
  
  While loading: Full skeleton screen (never blank)
  
  Widget interactions:
  
  [Portfolio Hero]
    • Portfolio Selector dropdown → switch portfolio → refetch hero data
    • Time range tabs (1D/1W/1M/3M/1Y/All) → update chart
    • Click portfolio value → navigate /app/portfolio/{id}
    • Risk Score badge → tooltip explaining score
    • Health Score badge → tooltip + "See full analytics" link
  
  [Performance Chart]
    • Hover → crosshair with value/date tooltip
    • Time range pills → re-fetch chart data → animated update
    • Click → no action (non-interactive at dashboard level)
  
  [Watchlist Widget]
    • Ticker row click → navigate /app/markets/stocks/{symbol}
    • "+ Add Stock" → opens stock search popover
    • ⋯ menu → Remove from watchlist
    • Sparkline shows 7-day price trend (green/red)
  
  [Market Movers]
    • Gainers / Losers / Active tabs
    • Each row click → navigate /app/markets/stocks/{symbol}
    • Auto-refreshes every 60 seconds
  
  [AI Insights Panel]
    • Shows last AI insight preview (2 lines)
    • "View Full Analysis" → opens AI slide-over panel
    • "Refresh" → triggers new portfolio analysis (rate-limited)
    • Tab row: Portfolio Health | Risk Analysis | Strategy Review
  
  [News Widget]
    • Article click → opens news article modal (with AI summary)
    • "View All News" → navigate /app/news/market
  
  [AI Daily Brief]
    • Auto-generated at 8am ET, shows for full day
    • "Expand" → full brief in modal
    • Sentiment indicator badge on brief
```

---

## 5. MARKETS FLOW

### 5.1 Markets Overview

```
[/app/markets/overview]
  Load: S&P500, NASDAQ, DOW, VIX index data + sector performance
  
  [Market Status Banner]
    • Green "MARKET OPEN" or gray "MARKET CLOSED" with next open time
    • 15-MIN DELAY badge
  
  [Index Cards] (click → filtered stock list by index)
    S&P 500 | NASDAQ | DOW | Russell 2000 | VIX
  
  [Sector Heatmap]
    • Color coded by % change (green → red scale)
    • Click sector → /app/markets/stocks?sector={name}
  
  [Stock Search]
    → Prominent search bar
    → Type → debounced 300ms → GET /api/v1/markets/search?q={query}
    → Dropdown: ticker, company name, exchange, price
    → Click result → /app/markets/stocks/{symbol}
    → Press Enter → /app/markets/search?q={query} (full results page)
  
  [Top Gainers / Losers / Most Active Tabs]
    • Each row: ticker, name, price, change $, change %
    • Click → /app/markets/stocks/{symbol}
    • Auto-refresh indicator
```

### 5.2 Stock Detail Flow

```
[/app/markets/stocks/{symbol}]
  Load (parallel):
    → GET /api/v1/markets/stocks/{symbol}/quote     (price, stats)
    → GET /api/v1/markets/stocks/{symbol}/chart?range=1D  (chart data)
    → GET /api/v1/markets/stocks/{symbol}/news      (related news)
    → GET /api/v1/markets/stocks/{symbol}/ai-summary (cached 6h)
  
  [Header Section]
    AAPL                          Apple Inc.
    $192.40  ▲ +1.24 (+0.65%)    [NASDAQ: AAPL]  ● DELAYED 15 MIN
    
    Actions: [Buy] [Sell] [★ Add to Watchlist]
    → Buy: opens Trade modal (buy)
    → Sell: opens Trade modal (sell) — only if holding exists
    → Watchlist: toggle (fill ★ if in list) → POST /api/v1/watchlist
  
  [Chart Section]
    TradingView Lightweight Charts
    Time ranges: [1D] [1W] [1M] [3M] [6M] [1Y] [5Y]
    Chart types: [Line] [Candle] [Area]  (toggle)
    Indicators dropdown: SMA, EMA, RSI, MACD, Bollinger Bands
    → Select indicator → overlaid on chart
  
  [Statistics Panel]
    Market Cap | P/E Ratio | EPS | Beta | Volume | Avg Volume
    52W High | 52W Low | Dividend Yield | Next Earnings
    → Tooltip on each stat explaining the metric
  
  [AI Summary Card]
    🤖 AI Summary (cached)
    [Company description + AI-generated business overview]
    "Generated by Claude · Last updated 2h ago"
  
  [Trade Modal — Triggered by Buy/Sell]
    Portfolio: [My Portfolio ▼]
    Order Type: ● Market  ○ Limit
    Shares: [    ] (input + quick buttons: +1, +10, +100)
    Limit Price: [visible only if Limit selected]
    Estimated Cost: $X,XXX.XX
    Available Cash: $XX,XXX.XX
    [Buy {shares} shares of {symbol}]
    → POST /api/v1/portfolio/{id}/trade
    → Loading: button spinner
    → SUCCESS: close modal + toast "Order executed: Bought 10 AAPL"
    → ERROR (insufficient cash): inline error
  
  [News Section]
    Latest news articles for {symbol}
    Each article: source badge, title, time, AI sentiment badge
    Click → Article modal with AI summary
  
  [Historical Data Table]
    Paginated OHLCV table (20 rows/page)
    Sortable by date
    [Download CSV] button
  
  [Sentiment Section]
    Sentiment gauge: Bullish score / Bearish score
    Recent social + news mentions count
    Trending keywords cloud
```

---

## 6. PORTFOLIO & TRADING FLOW

### 6.1 Portfolio View

```
[/app/portfolio/{portfolioId}]
  
  [Portfolio Selector] (top left)
    • Dropdown with all user portfolios
    • "+ Create Portfolio" option at bottom
    • Active portfolio highlighted
  
  [Portfolio Summary Bar]
    Value: $124,580  |  Day: +$1,247 (+1.01%)  |  Total: +24.58%
    Cash Available: $12,450  |  Holdings: 8 stocks
  
  [Tabs]
    [Holdings] [Transactions] [Performance] [Allocation]
  
  [Holdings Tab]
    Table columns:
    Symbol | Company | Shares | Avg Cost | Current | P&L $ | P&L % | Weight
    ───────────────────────────────────────────────────────────────────────
    AAPL   | Apple   | 50     | $155.20  | $192.40 | +$1,860 | +11.9% | 18.2%
    
    Row actions (hover → reveal):
    • [View] → /app/markets/stocks/{symbol}
    • [Buy More] → Trade modal
    • [Sell] → Trade modal (sell)
    
    Table footer: Total row with aggregated values
    
    [+ Add Position] button → opens stock search → Trade modal
  
  [Transactions Tab]
    Filter: All | Buy | Sell | Dividends | Cash
    Date range picker
    
    Table: Date | Type | Symbol | Shares | Price | Total | Portfolio
    Sorted by date desc (newest first)
    Paginated (25/page)
    [Export CSV] button
  
  [Performance Tab]
    Chart: Portfolio value over time vs benchmark
    Benchmark selector: [SPY (S&P500)] [QQQ (NASDAQ)] [DIA (DOW)]
    Time range: [1M] [3M] [6M] [1Y] [All]
    
    Metrics row:
    Return% | CAGR | vs Benchmark | Best Month | Worst Month
  
  [Allocation Tab]
    Donut chart: by holding
    Bar chart: by sector
    Table: Symbol | % of Portfolio | Value
```

### 6.2 Create Portfolio Flow

```
[+ Create Portfolio]
  Modal: 
    Portfolio Name: [____________]
    Initial Cash:   [$100,000   ▼]  (10K / 50K / 100K / 250K / 1M custom)
    Currency:       [USD (fixed)]
    Description:    [optional]
  
  [Create Portfolio]
    → POST /api/v1/portfolios
    → SUCCESS → navigate to new portfolio → toast "Portfolio created!"
    → ERROR (name taken) → inline error
    → Limit: max 5 portfolios per user (show count in modal)
```

---

## 7. ANALYTICS FLOW

```
[/app/analytics]
  
  Context bar:
    Portfolio: [My Portfolio ▼]
    Period: [All Time ▼] (1M, 3M, 6M, 1Y, Custom)
    Benchmark: [SPY ▼]
    [Recalculate]
  
  Load: GET /api/v1/analytics/{portfolioId}?period={p}&benchmark={b}
  
  [Metric Summary Bar — 4 key cards]
    Total Return    Sharpe Ratio    Max Drawdown    VaR (95%)
    +24.58%         1.24            -12.4%          -$2,847
  
  [Performance Analytics Tab]
    • Cumulative return chart (portfolio vs benchmark)
    • Monthly return bar chart (green/red by month)
    • Best / worst periods table
  
  [Risk Analytics Tab]
    • Volatility gauge (annualized)
    • Sharpe Ratio explanation card
    • Sortino Ratio
    • VaR histogram
    • Drawdown chart (underwater plot)
    • Maximum Drawdown annotation
  
  [Allocation Analytics Tab]
    • Sector allocation donut (current)
    • Historical allocation area chart (how allocation changed over time)
    • Concentration score + recommendations
    • Correlation matrix heatmap
  
  [Benchmark Analytics Tab]
    • Alpha and Beta cards
    • Tracking error
    • Information ratio
    • Rolling correlation chart
  
  [AI Analytics Explanation]
    Collapsed by default → "Explain my analytics" button
    → Opens AI analysis (streaming SSE)
    → Plain English explanation of all metrics
  
  [Export Button]
    → [Download PDF Report] → POST /api/v1/analytics/{id}/export
    → Shows progress: "Generating report..." → Download starts
```

---

## 8. STRATEGY BUILDER FLOW

```
[/app/strategies]  ← Strategy Library
  
  [My Strategies] list:
    Name | Indicators | Last Backtest | Status (Active/Draft)
    [View] [Edit] [Duplicate] [Delete]  [Run Backtest →]
  
  [+ Create Strategy]
    ↓
[/app/strategies/create]
  
  [Strategy Header]
    Name: [My SMA Crossover Strategy]
    Tags: [value] [momentum] + tag input
    Status: Draft / Active toggle
  
  [Creation Mode Toggle]
    ● Visual Builder  ○ Natural Language
  
  [VISUAL BUILDER MODE]
  
    Left Panel: Rule Canvas
    ─────────────────────
    IF (Conditions):
      [+ Add Condition]
        Condition blocks (drag-and-drop):
        ┌─────────────────────────────────────┐
        │ SMA(20) [crosses above ▼] SMA(50)  │  [×]
        └─────────────────────────────────────┘
        ┌─────────────────────────────────────┐
        │ RSI(14) [is below ▼] [30      ]    │  [×]
        └─────────────────────────────────────┘
        AND / OR connector (toggle)
    
    THEN (Actions):
      ┌─────────────────────────────────────────┐
      │ BUY [Market ▼] [100% ▼] of capital     │
      └─────────────────────────────────────────┘
    
    SELL WHEN (Exit Conditions):
      [+ Add Exit Condition]
        ┌─────────────────────────────────────┐
        │ SMA(20) [crosses below ▼] SMA(50)  │  [×]
        └─────────────────────────────────────┘
      OR:
        ┌─────────────────────────────────────┐
        │ Stop Loss: [-5% ▼] from entry       │
        └─────────────────────────────────────┘
    
    Right Panel: Indicator Library
    ─────────────────────────────
    Search indicators...
    ▼ Trend
      SMA (Simple Moving Average)
      EMA (Exponential Moving Average)
      VWAP
    ▼ Momentum
      RSI
      MACD
      Stochastic
    ▼ Volatility
      Bollinger Bands
      ATR
    ▼ Volume
      OBV, Volume, RVOL
    
    Click indicator → adds to canvas
  
  [NATURAL LANGUAGE MODE]
    Text area: "Buy when the 20-day SMA crosses above the 50-day SMA
    and the RSI is below 70. Sell when the SMA crosses back below
    or stop loss of -5%."
    
    [Convert to Strategy →]
    → POST /api/v1/ai/strategy/parse { description }
    → Streaming response: builds rule set
    → Converted rules appear in visual builder
    → User can review and adjust
  
  [Strategy Confidence Meter]
    AI viability assessment (after rules are set):
    [Analyze Strategy]
    → Shows: Confidence 72% | Suitable for: Trending markets
    → AI note: "This strategy may underperform in sideways markets..."
  
  [Bottom Actions]
    [Save Draft]  [Validate Rules]  [Save & Backtest →]
```

---

## 9. BACKTESTING FLOW

```
[/app/backtests/run]  OR  [Save & Backtest] from Strategy Builder
  
  [Configuration Panel]
    Strategy:     [SMA Crossover ▼]  ← pre-selected if from builder
    Symbol:       [AAPL] (search input)
    Date Range:   [Jan 1, 2019] to [Dec 31, 2024]
    Initial Capital: [$10,000]
    Commission:   [$0] (per trade, default free)
    Position Sizing: [100% of capital ▼] / [Fixed $X] / [Fixed N shares]
    
    [Run Backtest]
      ↓
  [Backtest Execution Screen]
    
    Progress Tracker:
    ┌──────────────────────────────────────────────┐
    │  ✓ Loading Historical Data          100%     │
    │  ⟳ Calculating Indicators           64%      │
    │  ○ Running Simulation               ──       │
    │  ○ Evaluating Performance           ──       │
    │  ○ Generating Report                ──       │
    └──────────────────────────────────────────────┘
    
    Status message: "Calculating technical indicators for 1,825 days..."
    Cancel button: [Cancel Backtest]
    
    Timeout: if >5min → error state with "Shorten the date range" suggestion
      ↓
  [/app/backtests/{id}]  ← Auto-redirect on completion
    
    [Header]
    SMA Crossover · AAPL · Jan 2019 – Dec 2024 · $10,000
    Completed: June 13, 2026 at 14:32
    [Run New Backtest] [Save] [Share]
    
    [Summary Metrics Bar]
    Total Return | CAGR | Sharpe | Max Drawdown | Win Rate | Total Trades
    +124.8%      | 17.6%| 1.24  | -18.2%       | 58.2%   | 142
    
    [Equity Curve Chart]
    Purple line = Strategy | Blue dashed = Buy & Hold benchmark
    TradingView chart with zoom
    
    [Monthly Returns Heatmap]
    Calendar grid: each month colored green (gain) or red (loss)
    
    [🤖 AI Backtest Interpretation — STREAMING]
    Loading: "Analyzing your strategy results..."
    Output: "Your SMA Crossover strategy generated a 124.8% total return
    over 5 years, outperforming buy-and-hold by 42.3%. The strategy's
    Sharpe Ratio of 1.24 indicates good risk-adjusted returns..."
    [Continue generating...] (auto)
    
    [Trade Log]
    Filter: All | Profitable | Losing
    Table: # | Entry Date | Exit Date | Entry $ | Exit $ | Shares | P&L | Type
    Sortable columns | Paginated 25/page
    [Download Trade Log CSV]
    
    [Compare Backtests] (if >1 saved)
    Select up to 3 backtests → side-by-side metrics table
```

---

## 10. NEWS & INTELLIGENCE FLOW

```
[/app/news]
  
  Tabs: [Market News] [My Feed] [Daily Brief]
  
  [Market News Tab]
    Left (70%): Article list
    Right (30%): Trending topics + Sentiment gauge
    
    Article card:
    [Source badge] [Sentiment: BULLISH 🟢] [3h ago]
    [Headline — bold]
    [Excerpt — 2 lines]
    [Tickers mentioned: AAPL NVDA]
    
    Click article → Article Modal
      • Full article preview (iframe if available, or summary)
      • AI-generated summary (1 paragraph, cached 7 days)
      • Sentiment analysis explanation
      • Related stocks: mini price cards
      • [Read Full Article →] (external link)
    
    Filters: [All] [Stocks] [Economy] [Earnings] [Fed] [Crypto] [Tech]
    Date filter: [Today] [This Week] [This Month]
    
    Auto-refresh: New articles badge "5 new articles" → click to load
  
  [My Feed Tab]
    Personalized based on:
    • Portfolio holdings (stocks you own)
    • Watchlist (stocks you track)
    • Category preferences (Settings → Notifications)
    
    Empty state: "Add stocks to your portfolio to see personalized news"
    
    Same card layout as Market News
    Additional context tag: "You own AAPL · +1.2% today"
  
  [Daily Brief Tab]
    Full-page AI-generated daily brief
    Generated at 8am ET on trading days
    
    Sections:
    🌅 Pre-Market Overview
    📊 Yesterday's Recap
    🔥 Today's Key Events
    📰 Top Stories to Watch
    🤖 AI Editor's Take
    
    "Generated by Claude on June 13, 2026 at 8:05 AM ET"
    [Share Brief] [Download PDF]
```

---

## 11. AI INSIGHTS FLOW

```
[/app/ai]
  
  AI Feature Cards:
  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
  │ Portfolio      │ │ Strategy       │ │ Market         │
  │ Analyst        │ │ Assistant      │ │ Research       │
  │                │ │                │ │                │
  │ Analyze your   │ │ Build strategy │ │ Ask about any  │
  │ portfolio with │ │ from natural   │ │ stock or       │
  │ AI             │ │ language       │ │ market topic   │
  └────────────────┘ └────────────────┘ └────────────────┘
  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
  │ Financial      │ │ Risk           │ │ AI Chat        │
  │ Tutor          │ │ Analyzer       │ │                │
  │                │ │                │ │ Free-form      │
  │ Learn finance  │ │ Identify risks │ │ financial      │
  │ concepts       │ │ in portfolio   │ │ assistant      │
  └────────────────┘ └────────────────┘ └────────────────┘
  
  Usage indicator: "47 of 100 daily AI calls used · Resets midnight UTC"
  
  [Portfolio Analyst Feature]
    Context:
    • Auto-selected: current active portfolio
    • Shows portfolio stats summary before analysis
    • Analysis type radio: Full Analysis | Risk Focus | Performance Focus
    
    [Analyze My Portfolio]
    → Status messages cycle:
      "Connecting to AI Analyst..."
      "Loading portfolio data..."
      "Analyzing your 8 holdings..."
      "Evaluating risk metrics..."
      "Reviewing sector allocation..."
      "Generating insights..."
    → Streaming output with cursor:
      [Full analysis text streams in progressively]
    → Sections: Overview | Strengths | Risks | Recommendations
    → [Copy] [Save to PDF] buttons on completion
  
  [Financial Tutor Feature]
    Topic search: "What is Sharpe Ratio?"
    Category buttons: Basics | Metrics | Strategies | Risk | Markets
    
    → POST /api/v1/ai/tutor { concept, userLevel }
    → Streaming explanation
    → Related concepts: click → new query
    → "Test yourself" quiz (3 questions on the concept) — optional
  
  [AI Chat Feature]
    Chat interface (chat bubbles, left/right)
    Context: system prompt includes user's portfolio summary
    Rate limit: shown above input "18 calls remaining today"
    Input: text area + [Send] button or Enter
    → Each message: streaming response
    → Conversation history maintained in session (Zustand)
    → [Clear Chat] button
    → Example prompts shown in empty chat state:
      "Explain the current market sentiment"
      "What is Value at Risk?"
      "How should I diversify my tech-heavy portfolio?"
```

---

## 12. NOTIFICATIONS FLOW

```
[Bell icon — Topbar]
  Badge: unread count (red dot if >0)
  Click → Notification Drawer (right side)
  
[Notification Drawer]
  Header: "Notifications  [Mark All Read]"
  Tabs: [All] [Alerts] [Portfolio] [System]
  
  Notification types (visual):
  
  🟢 Price Alert (green):
    "AAPL crossed above $200 · Just now"
    [View Stock →]
  
  📊 Portfolio (blue):
    "Your portfolio gained +2.1% today · 5h ago"
    [View Portfolio →]
  
  ✅ Backtest Complete (purple):
    "SMA Crossover backtest finished · 12m ago"
    [View Results →]
  
  📰 Earnings (amber):
    "TSLA reports earnings tomorrow after close"
    [Set Alert]
  
  ⚠️ System (gray):
    "Market data delayed — using cached prices · Resolved"
  
  Click notification → mark as read + navigate to relevant page
  Swipe left (mobile) → delete notification
  
[/app/notifications]  (full page)
  Same as drawer but paginated (50/page)
  Date filters
  Bulk: [Mark All Read] [Clear All]

[Settings → Notifications Tab]
  Price Alerts section:
    [+ Add Alert]
    → Symbol search → Set condition: Above/Below/% Change
    → Price threshold input
    → [Create Alert]
    
    My Alerts list:
    AAPL above $200 · Active · [Edit] [Delete]
    NVDA below $800 · Active · [Edit] [Delete]
  
  Email preferences:
    Daily digest: [On/Off toggle]
    Portfolio alerts: [On/Off]
    Earnings reminders: [On/Off]
    Weekly market summary: [On/Off]
```

---

## 13. SETTINGS FLOW

```
[/app/settings]
  Left nav: Profile | Security | Notifications | Appearance | Sessions
  
[Profile Tab]
  Avatar upload (click to change)
  First name, Last name, Display name
  Email (read-only, with "Change Email" button → flow)
  Bio (optional)
  [Save Changes]

[Security Tab]
  Current Password | New Password | Confirm New Password
  [Change Password]
  
  Two-Factor Authentication:
    Status: Disabled / Enabled (green badge)
    
    Enable 2FA:
    1. Show QR code → "Scan with Google Authenticator or Authy"
    2. Enter 6-digit code to verify
    3. Show backup codes (one-time, download or copy)
    [Enable 2FA]
    
    Disable 2FA:
    → Confirm with current password
    → Enter current TOTP code
    [Disable 2FA]

[Appearance Tab]
  (Dark mode only in v1 — this section reserved for v2 light mode)
  Chart style: [Candlestick ▼] / Line / Area (default for stock charts)
  Default time range: [1D ▼] / 1W / 1M / 3M / 1Y
  Number format: [1,234.56 ▼] / 1.234,56
  Currency display: [USD $]

[Sessions Tab]
  Active Sessions list:
  Chrome · MacOS · New York, US · Current session (green badge)
  Safari · iPhone · London, UK · Last active 2 days ago · [Revoke]
  
  [Sign Out All Other Devices]
```

---

## 14. ADMIN PANEL FLOW

```
[/app/admin]  — role: ADMIN only, redirect to /app/dashboard if not admin

[Sidebar nav for admin]
  Overview | Users | Data Health | AI Usage | System | Audit Logs | Feature Flags

[Overview Tab]
  Platform metrics:
  Today: DAU, New Signups, Active Sessions
  Week: MAU trend, Feature usage bar chart
  Status: All systems operational / Degraded / Outage
  
[Users Tab]
  Search: by email, name, user ID
  Filters: Role (User/Admin) | Status (Active/Suspended) | Date joined
  
  Table: Avatar | Name | Email | Role | Status | Joined | Last Active | Actions
  Actions per row: View Profile | Change Role | Suspend | Delete
  
  Suspend user modal: reason input + confirm
  
  [User Detail Page]
    Profile info
    Portfolio list
    AI usage stats
    Recent activity
    Audit log for this user
    [Actions: Reset Password | Suspend | Change Role]

[Data Health Tab]
  API Status cards:
  Polygon: ✅ Operational · 45ms avg · Last success 30s ago
  Finnhub: ✅ Operational · 120ms avg
  Alpha Vantage: ⚠️ Degraded · Using cache fallback
  Anthropic: ✅ Operational
  
  Cache stats: Hit rate / Miss rate / Memory usage
  Queue status: Jobs pending / Failed / Completed

[AI Usage Tab]
  Daily usage chart: total tokens, calls, estimated cost $
  Cost tracker: today / month / budget progress bar
  Top users by usage (anonymized or admin-visible)
  Toggle: pause AI globally if cost threshold exceeded

[Audit Logs Tab]
  Table: Timestamp | User | Action | IP | Details
  Filters: action type, user, date range
  Export CSV

[Feature Flags Tab]
  Flag list:
  ai_chat_enabled         ● Enabled  [Toggle]
  backtest_public_sharing ○ Disabled [Toggle]
  daily_brief_enabled     ● Enabled  [Toggle]
  
  Scope: Global | Per Role | Per User
  → Per User: enter user ID → toggle for just that user
```

---

## 15. ERROR & EDGE CASE FLOWS

### 15.1 Market Data API Down

```
Data API call fails:
  → Retry once (500ms delay)
  → Still fails → serve from Redis cache
  → Cache exists → show data with amber badge "Data may be delayed"
  → No cache → show widget error state:
    "Market data temporarily unavailable"
    [Retry] button
    → Never show blank widget
```

### 15.2 AI Quota Exceeded

```
POST /api/v1/ai/* when daily limit hit:
  → 429 response
  → Show: "You've used your 100 daily AI calls"
  → "Your quota resets at midnight UTC (in Xh Xm)"
  → Disable all AI buttons with tooltip "Daily limit reached"
  → AI Chat: message input disabled
```

### 15.3 Session Expired Mid-Session

```
API call returns 401:
  → Try silent refresh (POST /api/v1/auth/refresh)
  → Refresh succeeds → retry original request
  → Refresh fails → 
    → Show modal: "Your session has expired. Please sign in again."
    → [Sign In] → /auth/login (with redirect param)
    → No auto-redirect (respect user's current state)
```

### 15.4 Backtest Timeout

```
Backtest running > 5 minutes:
  → Backend: mark job as timed_out, emit 'backtest:timeout' via WebSocket
  → Frontend:
    Progress bar stops
    Steps turn red / error
    Message: "This backtest took too long to complete."
    Suggestions:
    • Shorten the date range
    • Use a simpler strategy
    [Try Again]
```

### 15.5 Insufficient Cash — Trade

```
User attempts buy, insufficient cash:
  → Client-side pre-check before API call:
    "This trade requires $X,XXX. You have $X,XXX available."
    [Adjust Shares] button recalculates
  → If somehow passes to API: 422 response
    → In-modal error: "Insufficient virtual cash"
    → [Deposit Cash] link → cash management section
```

---

## 16. MOBILE NAVIGATION FLOW

```
[Bottom Navigation Bar — 5 tabs]
  🏠 Home (Dashboard)
  📈 Markets
  💼 Portfolio
  🤖 AI
  ☰ More (opens bottom sheet menu)

[More Sheet]
  Analytics, Strategies, Backtests, News,
  Notifications, Settings, Admin (if admin)
  [Close]

[Mobile-Specific Interactions]
  
  Sidebar: Hidden completely, replaced by bottom nav
  
  Charts:
    Pinch to zoom (TradingView built-in)
    Horizontal scroll for time range pills
    Full-screen mode: [⤢] button on chart header
    → Chart expands to full screen
    → Indicators, range controls shown
    → [×] to close
  
  Trade Modal:
    Full-height bottom sheet (not centered modal)
    Large touch targets for number inputs
    +/- stepper buttons for shares (44px targets)
  
  AI Chat:
    Full-screen view on mobile
    Input bar fixed at bottom above system bar
  
  Tables:
    Horizontal scroll enabled
    "Swipe to see more →" hint on first view
    Row tap → detail page (not modal)
  
  Portfolio Hero:
    Compact 2-row layout:
    Row 1: $124,580 | +$1,247 (+1.01%)
    Row 2: Return 24.58% | Risk 7.2 | Health 82
```

---

## NAVIGATION STATE RULES

```
Authentication guard:
  /app/* → if NOT authenticated → redirect /auth/login?redirect={path}
  /auth/* → if authenticated → redirect /app/dashboard

Role guard:
  /app/admin/* → if NOT admin → redirect /app/dashboard with toast "Access denied"

Portfolio context:
  /app/portfolio/* → if no portfolios → redirect to onboarding portfolio creation
  /app/analytics/* → if no portfolios → show empty state with "Create Portfolio" CTA
  /app/backtests/* → if no strategies → show empty state with "Create Strategy" CTA

Loading strategy:
  All protected routes → immediately show skeleton (never blank)
  Data fetched in parallel (React Query, multiple keys)
  Stale data shown while revalidating (staleTime: 30s default)
```

---

*End of QuantEdge App Flow v1.0.0*
*Next: See SCHEMA.md for complete database schema design*
