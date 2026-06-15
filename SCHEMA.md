# QuantEdge — Database Schema

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Database:** PostgreSQL 16 | **ORM:** Prisma 5.x
> **Convention:** snake_case tables and columns, ENUM for fixed sets, UUID for IDs where scalable

---

## TABLE OF CONTENTS

1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [Prisma Schema — Complete](#2-prisma-schema--complete)
3. [Table Reference](#3-table-reference)
4. [Indexing Strategy](#4-indexing-strategy)
5. [Seed Data](#5-seed-data)
6. [Migration Strategy](#6-migration-strategy)
7. [Query Patterns](#7-query-patterns)
8. [Redis Cache Schema](#8-redis-cache-schema)

---

## 1. ENTITY RELATIONSHIP OVERVIEW

```
users ──────────────────────────────────────────────────────────
  │                                                              │
  ├─ refresh_tokens (1:many)                                     │
  ├─ audit_logs (1:many)                                         │
  ├─ notifications (1:many)                                      │
  ├─ user_preferences (1:1)                                      │
  ├─ price_alerts (1:many)                                       │
  │                                                              │
  ├─ portfolios (1:many) ──────────────────────────────────────  │
  │     ├─ holdings (1:many) ───────────── stocks (many:1)      │
  │     ├─ transactions (1:many) ────────── stocks (many:1)     │
  │     └─ portfolio_snapshots (1:many)                         │
  │                                                              │
  ├─ watchlists (1:1) ─────────────────────────────────────────  │
  │     └─ watchlist_items (1:many) ──── stocks (many:1)        │
  │                                                              │
  ├─ strategies (1:many) ──────────────────────────────────────  │
  │     └─ backtests (1:many) ─────── strategies (many:1)       │
  │                                                              │
  └─ ai_interactions (1:many)                                    │
                                                                 │
stocks ─────────────────────────────────────────────────────────┘
  ├─ stock_prices (1:many, time-series)
  ├─ news_stock_mentions (many:many via news_articles)
  └─ sentiment_scores (1:many)

news_articles
  ├─ news_summaries (1:1)
  └─ news_stock_mentions (many:many via stocks)
```

---

## 2. PRISMA SCHEMA — COMPLETE

```prisma
// schema.prisma
// QuantEdge Database Schema v1.0.0
// PostgreSQL 16 + Prisma 5.x

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm, uuid_ossp]
}

// ════════════════════════════════════════════════
// ENUMS
// ════════════════════════════════════════════════

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
  DELETED
}

enum OrderType {
  MARKET
  LIMIT
}

enum TransactionType {
  BUY
  SELL
  DIVIDEND
  CASH_DEPOSIT
  CASH_WITHDRAWAL
}

enum StrategyStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum BacktestStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  TIMEOUT
  CANCELLED
}

enum PositionSizing {
  PERCENTAGE        // % of capital
  FIXED_AMOUNT      // Fixed $ amount
  FIXED_SHARES      // Fixed share count
}

enum NotificationType {
  PRICE_ALERT
  PORTFOLIO_CHANGE
  BACKTEST_COMPLETE
  EARNINGS_REMINDER
  SYSTEM
  AI_INSIGHT
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

enum AlertCondition {
  ABOVE
  BELOW
  PERCENT_CHANGE_UP
  PERCENT_CHANGE_DOWN
}

enum AlertStatus {
  ACTIVE
  TRIGGERED
  PAUSED
  DELETED
}

enum SentimentLabel {
  BULLISH
  BEARISH
  NEUTRAL
}

enum AuditAction {
  AUTH_LOGIN
  AUTH_LOGOUT
  AUTH_REGISTER
  AUTH_PASSWORD_RESET
  AUTH_2FA_ENABLE
  AUTH_2FA_DISABLE
  TRADE_BUY
  TRADE_SELL
  PORTFOLIO_CREATE
  PORTFOLIO_DELETE
  STRATEGY_CREATE
  STRATEGY_DELETE
  BACKTEST_RUN
  WATCHLIST_ADD
  WATCHLIST_REMOVE
  ALERT_CREATE
  ALERT_DELETE
  ADMIN_USER_SUSPEND
  ADMIN_ROLE_CHANGE
  AI_CALL
}

// ════════════════════════════════════════════════
// CORE USER TABLES
// ════════════════════════════════════════════════

model User {
  id                  String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email               String     @unique
  email_verified_at   DateTime?
  password_hash       String
  first_name          String     @db.VarChar(50)
  last_name           String     @db.VarChar(50)
  display_name        String?    @db.VarChar(100)
  avatar_url          String?
  role                UserRole   @default(USER)
  status              UserStatus @default(PENDING_VERIFICATION)
  two_factor_enabled  Boolean    @default(false)
  two_factor_secret   String?    // Encrypted TOTP secret
  two_factor_backup   String[]   // Encrypted backup codes
  failed_login_count  Int        @default(0)
  locked_until        DateTime?
  last_login_at       DateTime?
  last_login_ip       String?    @db.VarChar(45)
  ai_calls_today      Int        @default(0)
  ai_calls_date       DateTime?  // Date when count was last reset
  created_at          DateTime   @default(now())
  updated_at          DateTime   @updatedAt
  deleted_at          DateTime?  // Soft delete

  // Relations
  refresh_tokens      RefreshToken[]
  user_preferences    UserPreferences?
  portfolios          Portfolio[]
  watchlist           Watchlist?
  strategies          Strategy[]
  notifications       Notification[]
  price_alerts        PriceAlert[]
  audit_logs          AuditLog[]
  ai_interactions     AiInteraction[]

  @@index([email])
  @@index([status])
  @@map("users")
}

model UserPreferences {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String   @unique @db.Uuid
  default_chart_type  String   @default("candlestick") // candlestick | line | area
  default_time_range  String   @default("1D")          // 1D | 1W | 1M | 3M | 1Y
  number_format       String   @default("en-US")       // en-US | de-DE
  email_daily_digest  Boolean  @default(true)
  email_price_alerts  Boolean  @default(true)
  email_portfolio     Boolean  @default(false)
  email_earnings      Boolean  @default(true)
  notif_price_alerts  Boolean  @default(true)
  notif_portfolio     Boolean  @default(true)
  notif_backtest      Boolean  @default(true)
  notif_earnings      Boolean  @default(true)
  onboarding_completed Boolean @default(false)
  user_type           String?  // beginner | student | builder | enthusiast
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  user                User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model RefreshToken {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  token_hash  String   @unique @db.VarChar(128) // SHA-256 hash of actual token
  device_info String?  @db.VarChar(255)         // Browser/OS info
  ip_address  String?  @db.VarChar(45)
  user_agent  String?
  expires_at  DateTime
  last_used   DateTime @default(now())
  created_at  DateTime @default(now())

  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@index([expires_at])
  @@map("refresh_tokens")
}

model VerificationToken {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  token_hash  String   @unique @db.VarChar(128)
  type        String   @db.VarChar(30)  // email_verification | password_reset
  expires_at  DateTime
  used_at     DateTime?
  created_at  DateTime @default(now())

  @@index([token_hash])
  @@index([user_id])
  @@map("verification_tokens")
}

// ════════════════════════════════════════════════
// STOCK MARKET DATA TABLES
// ════════════════════════════════════════════════

model Stock {
  symbol              String   @id @db.VarChar(10)  // AAPL, MSFT, etc.
  name                String   @db.VarChar(200)
  exchange            String   @db.VarChar(20)       // NASDAQ, NYSE, etc.
  sector              String?  @db.VarChar(100)
  industry            String?  @db.VarChar(100)
  description         String?  @db.Text
  logo_url            String?
  website             String?  @db.VarChar(255)
  employees           Int?
  founded_year        Int?
  country             String   @default("US") @db.VarChar(5)
  currency            String   @default("USD") @db.VarChar(5)
  is_active           Boolean  @default(true)
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  // Relations
  stock_prices        StockPrice[]
  holdings            Holding[]
  transactions        Transaction[]
  watchlist_items     WatchlistItem[]
  news_mentions       NewsStockMention[]
  sentiment_scores    SentimentScore[]
  price_alerts        PriceAlert[]

  @@index([symbol])
  @@index([name])
  @@index([sector])
  @@index([is_active])
  // Full text search index (created manually in migration)
  @@map("stocks")
}

model StockPrice {
  id          BigInt   @id @default(autoincrement())
  symbol      String   @db.VarChar(10)
  timestamp   DateTime @db.Timestamptz
  open        Decimal  @db.Decimal(12, 4)
  high        Decimal  @db.Decimal(12, 4)
  low         Decimal  @db.Decimal(12, 4)
  close       Decimal  @db.Decimal(12, 4)
  volume      BigInt
  vwap        Decimal? @db.Decimal(12, 4)
  interval    String   @db.VarChar(10) // 1min, 5min, 15min, 1hour, 1day
  source      String   @default("polygon") @db.VarChar(20)

  stock       Stock    @relation(fields: [symbol], references: [symbol])

  @@unique([symbol, timestamp, interval])
  @@index([symbol, timestamp(sort: Desc)])
  @@index([symbol, interval, timestamp(sort: Desc)])
  @@map("stock_prices")
}

model StockQuote {
  symbol              String   @id @db.VarChar(10)
  price               Decimal  @db.Decimal(12, 4)
  open                Decimal? @db.Decimal(12, 4)
  high                Decimal? @db.Decimal(12, 4)
  low                 Decimal? @db.Decimal(12, 4)
  prev_close          Decimal? @db.Decimal(12, 4)
  change              Decimal? @db.Decimal(12, 4)
  change_percent      Decimal? @db.Decimal(8, 4)
  volume              BigInt?
  avg_volume          BigInt?
  market_cap          BigInt?
  pe_ratio            Decimal? @db.Decimal(10, 2)
  eps                 Decimal? @db.Decimal(10, 4)
  beta                Decimal? @db.Decimal(8, 4)
  dividend_yield      Decimal? @db.Decimal(8, 4)
  week_52_high        Decimal? @db.Decimal(12, 4)
  week_52_low         Decimal? @db.Decimal(12, 4)
  shares_outstanding  BigInt?
  updated_at          DateTime @updatedAt

  @@index([symbol])
  @@map("stock_quotes")
}

// ════════════════════════════════════════════════
// PORTFOLIO TABLES
// ════════════════════════════════════════════════

model Portfolio {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String    @db.Uuid
  name            String    @db.VarChar(100)
  description     String?   @db.VarChar(500)
  cash_balance    Decimal   @default(100000.00) @db.Decimal(14, 2)
  initial_capital Decimal   @db.Decimal(14, 2)
  is_default      Boolean   @default(false)
  is_deleted      Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // Relations
  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  holdings        Holding[]
  transactions    Transaction[]
  snapshots       PortfolioSnapshot[]
  backtests       Backtest[]

  @@index([user_id])
  @@index([user_id, is_deleted])
  @@map("portfolios")
}

model Holding {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  portfolio_id    String    @db.Uuid
  symbol          String    @db.VarChar(10)
  shares          Decimal   @db.Decimal(12, 4)       // Supports fractional shares
  average_cost    Decimal   @db.Decimal(12, 4)       // Cost basis per share
  total_cost      Decimal   @db.Decimal(14, 2)       // average_cost * shares
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  portfolio       Portfolio @relation(fields: [portfolio_id], references: [id], onDelete: Cascade)
  stock           Stock     @relation(fields: [symbol], references: [symbol])

  @@unique([portfolio_id, symbol])
  @@index([portfolio_id])
  @@index([symbol])
  @@map("holdings")
}

model Transaction {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  portfolio_id    String          @db.Uuid
  symbol          String?         @db.VarChar(10)    // null for cash transactions
  type            TransactionType
  order_type      OrderType       @default(MARKET)
  shares          Decimal?        @db.Decimal(12, 4)
  price_per_share Decimal?        @db.Decimal(12, 4)
  total_amount    Decimal         @db.Decimal(14, 2) // +credit / -debit
  commission      Decimal         @default(0) @db.Decimal(8, 2)
  notes           String?         @db.VarChar(500)
  executed_at     DateTime        @default(now())
  created_at      DateTime        @default(now())

  portfolio       Portfolio       @relation(fields: [portfolio_id], references: [id], onDelete: Cascade)
  stock           Stock?          @relation(fields: [symbol], references: [symbol])

  @@index([portfolio_id, executed_at(sort: Desc)])
  @@index([portfolio_id, type])
  @@index([symbol])
  @@map("transactions")
}

model PortfolioSnapshot {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  portfolio_id    String    @db.Uuid
  snapshot_date   DateTime  @db.Date
  total_value     Decimal   @db.Decimal(14, 2)  // Holdings + cash
  holdings_value  Decimal   @db.Decimal(14, 2)  // Holdings only
  cash_balance    Decimal   @db.Decimal(14, 2)
  daily_return    Decimal?  @db.Decimal(8, 4)   // % return from prev day
  created_at      DateTime  @default(now())

  portfolio       Portfolio @relation(fields: [portfolio_id], references: [id], onDelete: Cascade)

  @@unique([portfolio_id, snapshot_date])
  @@index([portfolio_id, snapshot_date(sort: Desc)])
  @@map("portfolio_snapshots")
}

// ════════════════════════════════════════════════
// WATCHLIST
// ════════════════════════════════════════════════

model Watchlist {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String          @unique @db.Uuid
  name        String          @default("My Watchlist") @db.VarChar(100)
  created_at  DateTime        @default(now())
  updated_at  DateTime        @updatedAt

  user        User            @relation(fields: [user_id], references: [id], onDelete: Cascade)
  items       WatchlistItem[]

  @@map("watchlists")
}

model WatchlistItem {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  watchlist_id  String    @db.Uuid
  symbol        String    @db.VarChar(10)
  added_at      DateTime  @default(now())
  notes         String?   @db.VarChar(200)
  sort_order    Int       @default(0)

  watchlist     Watchlist @relation(fields: [watchlist_id], references: [id], onDelete: Cascade)
  stock         Stock     @relation(fields: [symbol], references: [symbol])

  @@unique([watchlist_id, symbol])
  @@index([watchlist_id])
  @@map("watchlist_items")
}

// ════════════════════════════════════════════════
// STRATEGY & BACKTESTING
// ════════════════════════════════════════════════

model Strategy {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String         @db.Uuid
  name            String         @db.VarChar(100)
  description     String?        @db.Text
  tags            String[]
  status          StrategyStatus @default(DRAFT)
  rules           Json           // StrategyRule[] — structured rule definition
  indicators      Json           // IndicatorConfig[] — indicator parameters
  entry_conditions Json          // Condition[] — buy trigger
  exit_conditions  Json          // Condition[] — sell trigger
  position_sizing PositionSizing @default(PERCENTAGE)
  position_value  Decimal        @default(100) @db.Decimal(8, 2) // % or $ amount
  stop_loss_pct   Decimal?       @db.Decimal(6, 2) // stop loss %
  take_profit_pct Decimal?       @db.Decimal(6, 2) // take profit %
  ai_confidence   Decimal?       @db.Decimal(5, 2) // 0-100 AI viability score
  ai_notes        String?        @db.Text          // AI assessment text
  is_public       Boolean        @default(false)
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  user            User           @relation(fields: [user_id], references: [id], onDelete: Cascade)
  backtests       Backtest[]

  @@index([user_id])
  @@index([status])
  @@index([is_public])
  @@map("strategies")
}

model Backtest {
  id                  String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String         @db.Uuid
  strategy_id         String?        @db.Uuid
  portfolio_id        String?        @db.Uuid
  name                String?        @db.VarChar(200)  // Auto-generated or custom
  symbol              String         @db.VarChar(10)
  start_date          DateTime       @db.Date
  end_date            DateTime       @db.Date
  initial_capital     Decimal        @db.Decimal(14, 2)
  commission          Decimal        @default(0) @db.Decimal(8, 2)
  position_sizing     PositionSizing @default(PERCENTAGE)
  position_value      Decimal        @default(100) @db.Decimal(8, 2)
  status              BacktestStatus @default(QUEUED)
  progress_step       Int            @default(0)       // 0-5 steps
  progress_percent    Int            @default(0)       // 0-100
  error_message       String?        @db.Text
  
  // Results (populated on completion)
  total_return_pct    Decimal?       @db.Decimal(10, 4)
  annualized_return   Decimal?       @db.Decimal(10, 4)
  sharpe_ratio        Decimal?       @db.Decimal(8, 4)
  sortino_ratio       Decimal?       @db.Decimal(8, 4)
  max_drawdown_pct    Decimal?       @db.Decimal(8, 4)
  max_drawdown_start  DateTime?      @db.Date
  max_drawdown_end    DateTime?      @db.Date
  volatility          Decimal?       @db.Decimal(8, 4)
  win_rate            Decimal?       @db.Decimal(6, 4) // 0-1
  total_trades        Int?
  profitable_trades   Int?
  losing_trades       Int?
  avg_profit_pct      Decimal?       @db.Decimal(8, 4)
  avg_loss_pct        Decimal?       @db.Decimal(8, 4)
  profit_factor       Decimal?       @db.Decimal(8, 4)
  benchmark_return    Decimal?       @db.Decimal(10, 4) // buy & hold
  alpha               Decimal?       @db.Decimal(8, 4)
  beta                Decimal?       @db.Decimal(8, 4)
  
  // Detailed results (stored as JSON for flexibility)
  equity_curve        Json?          // { date, value }[]
  trade_log           Json?          // Trade[] — entry/exit/pnl per trade
  monthly_returns     Json?          // { year, month, return }[]
  
  // AI interpretation
  ai_interpretation   String?        @db.Text
  ai_generated_at     DateTime?
  
  started_at          DateTime?
  completed_at        DateTime?
  created_at          DateTime       @default(now())

  user                User           @relation(fields: [user_id], references: [id], onDelete: Cascade)
  strategy            Strategy?      @relation(fields: [strategy_id], references: [id])
  portfolio           Portfolio?     @relation(fields: [portfolio_id], references: [id])

  @@index([user_id, created_at(sort: Desc)])
  @@index([strategy_id])
  @@index([status])
  @@map("backtests")
}

// ════════════════════════════════════════════════
// NEWS & INTELLIGENCE
// ════════════════════════════════════════════════

model NewsArticle {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  external_id     String?   @unique @db.VarChar(200) // Source article ID
  source          String    @db.VarChar(100)         // "Bloomberg", "Reuters", etc.
  source_url      String    @unique @db.Text
  headline        String    @db.Text
  excerpt         String?   @db.Text
  full_content    String?   @db.Text
  author          String?   @db.VarChar(200)
  category        String?   @db.VarChar(50)          // market, earnings, fed, tech
  image_url       String?
  published_at    DateTime
  fetched_at      DateTime  @default(now())
  is_active       Boolean   @default(true)

  // Relations
  summary         NewsSummary?
  stock_mentions  NewsStockMention[]

  @@index([published_at(sort: Desc)])
  @@index([category, published_at(sort: Desc)])
  @@index([source])
  @@map("news_articles")
}

model NewsSummary {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  article_id      String      @unique @db.Uuid
  summary         String      @db.Text   // AI-generated 1-paragraph summary
  sentiment       SentimentLabel
  sentiment_score Decimal     @db.Decimal(5, 4) // -1.0 to 1.0
  key_points      String[]                       // 3-5 bullet points
  generated_at    DateTime    @default(now())
  model_used      String      @default("claude-sonnet-4-6") @db.VarChar(50)

  article         NewsArticle @relation(fields: [article_id], references: [id], onDelete: Cascade)

  @@map("news_summaries")
}

model NewsStockMention {
  article_id  String      @db.Uuid
  symbol      String      @db.VarChar(10)
  relevance   Decimal     @default(1.0) @db.Decimal(4, 3) // 0-1 how central to article

  article     NewsArticle @relation(fields: [article_id], references: [id], onDelete: Cascade)
  stock       Stock       @relation(fields: [symbol], references: [symbol])

  @@id([article_id, symbol])
  @@index([symbol])
  @@map("news_stock_mentions")
}

model SentimentScore {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  symbol          String    @db.VarChar(10)
  date            DateTime  @db.Date
  sentiment       SentimentLabel
  score           Decimal   @db.Decimal(5, 4) // -1.0 (very bearish) to 1.0 (very bullish)
  news_count      Int       @default(0)       // Articles contributing to score
  social_count    Int       @default(0)       // Social mentions (if available)
  source          String    @default("news") @db.VarChar(20) // news | social | combined
  created_at      DateTime  @default(now())

  stock           Stock     @relation(fields: [symbol], references: [symbol])

  @@unique([symbol, date, source])
  @@index([symbol, date(sort: Desc)])
  @@map("sentiment_scores")
}

model AiDailyBrief {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  brief_date      DateTime  @db.Date @unique
  content         String    @db.Text
  sentiment       SentimentLabel
  key_events      Json      // string[] — bullets
  sections        Json      // { premarket, recap, events, stories, take }
  generated_at    DateTime  @default(now())
  model_used      String    @default("claude-sonnet-4-6") @db.VarChar(50)

  @@index([brief_date(sort: Desc)])
  @@map("ai_daily_briefs")
}

// ════════════════════════════════════════════════
// AI INTERACTIONS
// ════════════════════════════════════════════════

model AiInteraction {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String    @db.Uuid
  feature_type    String    @db.VarChar(50)  // portfolio_analysis | tutor | chat | etc.
  context_hash    String?   @db.VarChar(64)  // SHA-256 for cache dedup
  prompt_tokens   Int?
  completion_tokens Int?
  total_tokens    Int?
  cost_usd        Decimal?  @db.Decimal(8, 6)
  cached          Boolean   @default(false)  // Was this served from cache?
  model_used      String    @db.VarChar(50)
  duration_ms     Int?      // Time to first token
  created_at      DateTime  @default(now())

  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, created_at(sort: Desc)])
  @@index([created_at(sort: Desc)])
  @@index([feature_type])
  @@map("ai_interactions")
}

// ════════════════════════════════════════════════
// NOTIFICATIONS & ALERTS
// ════════════════════════════════════════════════

model Notification {
  id          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String              @db.Uuid
  type        NotificationType
  status      NotificationStatus  @default(UNREAD)
  title       String              @db.VarChar(200)
  message     String              @db.Text
  data        Json?               // Extra payload (backtest_id, symbol, etc.)
  action_url  String?             @db.VarChar(500) // Deep link
  created_at  DateTime            @default(now())
  read_at     DateTime?

  user        User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, status])
  @@index([user_id, created_at(sort: Desc)])
  @@map("notifications")
}

model PriceAlert {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String         @db.Uuid
  symbol          String         @db.VarChar(10)
  condition       AlertCondition
  threshold_value Decimal        @db.Decimal(12, 4) // Price or % value
  status          AlertStatus    @default(ACTIVE)
  triggered_at    DateTime?
  triggered_price Decimal?       @db.Decimal(12, 4)
  notes           String?        @db.VarChar(200)
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  user            User           @relation(fields: [user_id], references: [id], onDelete: Cascade)
  stock           Stock          @relation(fields: [symbol], references: [symbol])

  @@index([user_id])
  @@index([symbol, status])  // For alert checking job: find all active alerts for symbol
  @@map("price_alerts")
}

// ════════════════════════════════════════════════
// SECURITY & AUDIT
// ════════════════════════════════════════════════

model AuditLog {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String?     @db.Uuid   // null for anonymous/system actions
  action      AuditAction
  ip_address  String?     @db.VarChar(45)
  user_agent  String?     @db.Text
  metadata    Json?       // Action-specific details (symbol, amount, old value, etc.)
  success     Boolean     @default(true)
  error_msg   String?     @db.Text
  created_at  DateTime    @default(now())

  user        User?       @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@index([user_id, created_at(sort: Desc)])
  @@index([action, created_at(sort: Desc)])
  @@index([created_at(sort: Desc)])
  @@map("audit_logs")
}

model FeatureFlag {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  key         String   @unique @db.VarChar(100) // snake_case flag name
  enabled     Boolean  @default(false)
  description String?  @db.Text
  scope       String   @default("global") @db.VarChar(20) // global | role | user
  target_ids  String[] // Role names or User IDs if scope != global
  updated_by  String?  @db.Uuid
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@index([key])
  @@map("feature_flags")
}
```

---

## 3. TABLE REFERENCE

| Table | Rows Estimate (1yr) | Notes |
|---|---|---|
| users | 1K–10K | Core user data |
| user_preferences | = users | 1:1 with users |
| refresh_tokens | 10K–50K | Pruned on expiry |
| verification_tokens | 5K | Short-lived |
| stocks | ~8,000 | US-listed stocks only |
| stock_prices | 100M+ | Time-series — partitioned by month |
| stock_quotes | ~8,000 | Rolling update, 1 row per ticker |
| portfolios | 3–25K | ~5 per user avg |
| holdings | 25K–200K | |
| transactions | 100K–1M | Append-only |
| portfolio_snapshots | 500K | Daily per portfolio |
| watchlists | = users | 1:1 |
| watchlist_items | 50K–500K | |
| strategies | 10K–100K | |
| backtests | 50K–500K | Large JSON in equity_curve/trade_log |
| news_articles | 500K/yr | Grows continuously |
| news_summaries | 500K/yr | 1:1 with articles |
| news_stock_mentions | 2M/yr | |
| sentiment_scores | 3M/yr | Daily per symbol |
| ai_daily_briefs | 252/yr | Trading days only |
| ai_interactions | 500K/yr | Usage tracking |
| notifications | 2M/yr | Pruned after 90 days |
| price_alerts | 50K–500K | |
| audit_logs | 5M/yr | Pruned after 1 year |
| feature_flags | <100 | Static-ish |

---

## 4. INDEXING STRATEGY

```sql
-- Full text search on stocks (created in migration, not Prisma)
CREATE INDEX idx_stocks_fts 
  ON stocks USING GIN(to_tsvector('english', name || ' ' || symbol));

-- Trigram search for fuzzy stock name matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_stocks_name_trgm ON stocks USING GIN(name gin_trgm_ops);
CREATE INDEX idx_stocks_symbol_trgm ON stocks USING GIN(symbol gin_trgm_ops);

-- Stock prices time-series (EXTREMELY important for backtesting)
CREATE INDEX idx_stock_prices_symbol_interval_time 
  ON stock_prices(symbol, interval, timestamp DESC);

-- Composite for portfolio value calculation
CREATE INDEX idx_holdings_portfolio_symbol 
  ON holdings(portfolio_id, symbol);

-- Transaction history (most common query pattern)
CREATE INDEX idx_transactions_portfolio_date 
  ON transactions(portfolio_id, executed_at DESC);

-- News by published date (most common query)
CREATE INDEX idx_news_published 
  ON news_articles(published_at DESC) WHERE is_active = true;

-- News by symbol (for stock detail page news)
CREATE INDEX idx_news_mentions_symbol 
  ON news_stock_mentions(symbol);

-- Active price alerts for alert checking job
CREATE INDEX idx_price_alerts_symbol_active 
  ON price_alerts(symbol, status) WHERE status = 'ACTIVE';

-- User AI usage (reset daily)
CREATE INDEX idx_users_ai_date 
  ON users(ai_calls_date, ai_calls_today) WHERE status = 'ACTIVE';

-- Audit log queries
CREATE INDEX idx_audit_logs_user_action 
  ON audit_logs(user_id, action, created_at DESC);

-- Sentiment for specific symbol + date range
CREATE INDEX idx_sentiment_symbol_date 
  ON sentiment_scores(symbol, date DESC);
```

### Table Partitioning (production)

```sql
-- stock_prices partitioned by month (critical for performance at scale)
CREATE TABLE stock_prices (
  -- ... columns
) PARTITION BY RANGE (timestamp);

-- Create partitions for each month
CREATE TABLE stock_prices_2024_01 
  PARTITION OF stock_prices
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Auto-create via pg_partman (recommended)
```

---

## 5. SEED DATA

```typescript
// prisma/seed.ts — Development seed data

// 1. Admin user
await prisma.user.create({
  data: {
    email: 'admin@quantedge.app',
    password_hash: await bcrypt.hash('Admin@123!', 12),
    first_name: 'Admin',
    last_name: 'User',
    role: 'ADMIN',
    status: 'ACTIVE',
    email_verified_at: new Date(),
    user_preferences: { create: { onboarding_completed: true } },
  },
});

// 2. Test user
await prisma.user.create({
  data: {
    email: 'user@test.com',
    password_hash: await bcrypt.hash('Test@123!', 12),
    first_name: 'Test',
    last_name: 'User',
    role: 'USER',
    status: 'ACTIVE',
    email_verified_at: new Date(),
  },
});

// 3. Top 50 stocks (reference data)
const topStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.',            exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation',    exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'GOOGL',name: 'Alphabet Inc.',         exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.',       exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { symbol: 'META', name: 'Meta Platforms Inc.',   exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.',            exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { symbol: 'BRK.B',name: 'Berkshire Hathaway',   exchange: 'NYSE',   sector: 'Financials' },
  { symbol: 'JPM',  name: 'JPMorgan Chase & Co.', exchange: 'NYSE',   sector: 'Financials' },
  { symbol: 'V',    name: 'Visa Inc.',             exchange: 'NYSE',   sector: 'Financials' },
  // ... 40 more
];
await prisma.stock.createMany({ data: topStocks, skipDuplicates: true });

// 4. Feature flags
const flags = [
  { key: 'ai_chat_enabled',         enabled: true,  description: 'AI free chat feature' },
  { key: 'backtest_public_sharing', enabled: false, description: 'Share backtests publicly' },
  { key: 'daily_brief_enabled',     enabled: true,  description: 'Daily AI market brief' },
  { key: 'strategy_marketplace',    enabled: false, description: 'Public strategy sharing' },
  { key: 'pdf_export',              enabled: true,  description: 'PDF report export' },
];
await prisma.featureFlag.createMany({ data: flags, skipDuplicates: true });
```

---

## 6. MIGRATION STRATEGY

```bash
# Initial setup
npx prisma migrate dev --name init

# After schema changes (development)
npx prisma migrate dev --name add_sentiment_table

# Production migrations (never use migrate dev in prod)
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate

# View database in Prisma Studio (dev)
npx prisma studio

# Reset dev database completely
npx prisma migrate reset
```

### Migration Naming Convention

```
YYYY-MM-DD_short_description
Examples:
  20260101_initial_schema
  20260115_add_2fa_fields
  20260120_add_backtest_results
  20260201_add_partitioning_stock_prices
```

### Data Migration Patterns

```typescript
// Safe column addition (backwards compatible)
ALTER TABLE stocks ADD COLUMN new_field VARCHAR(100);

// Safe index creation (concurrent, no table lock)
CREATE INDEX CONCURRENTLY idx_new_field ON stocks(new_field);

// NEVER in production without careful testing:
// ALTER TABLE ... DROP COLUMN (use soft-delete first)
// ALTER TABLE ... RENAME COLUMN (breaks Prisma until regenerated)
```

---

## 7. QUERY PATTERNS

### 7.1 Portfolio with Holdings + Live Prices

```typescript
// Get portfolio summary with current values
const portfolio = await prisma.portfolio.findFirst({
  where: { id: portfolioId, user_id: userId, is_deleted: false },
  include: {
    holdings: {
      include: {
        stock: {
          include: {
            // Latest quote from stock_quotes (pre-computed)
            // Note: actual price comes from Redis cache, not a join
          },
        },
      },
    },
  },
});

// Then enrich with live prices from Redis:
const symbols = portfolio.holdings.map(h => h.symbol);
const prices = await redis.mget(symbols.map(s => `price:${s}`));
```

### 7.2 Backtest Historical Data Query

```typescript
// High-performance historical price query for backtesting
const prices = await prisma.stockPrice.findMany({
  where: {
    symbol,
    interval: '1day',
    timestamp: { gte: startDate, lte: endDate },
  },
  orderBy: { timestamp: 'asc' },
  select: {
    timestamp: true, open: true, high: true,
    low: true, close: true, volume: true,
  },
});
// Result: typically 252-1260 rows (1-5 years of daily data)
```

### 7.3 News Feed for User (Holdings + Watchlist)

```typescript
const userSymbols = [
  ...portfolio.holdings.map(h => h.symbol),
  ...watchlist.items.map(i => i.symbol),
];

const news = await prisma.newsArticle.findMany({
  where: {
    is_active: true,
    published_at: { gte: subDays(new Date(), 7) },
    stock_mentions: {
      some: { symbol: { in: userSymbols } },
    },
  },
  include: { summary: true, stock_mentions: true },
  orderBy: { published_at: 'desc' },
  take: 50,
});
```

### 7.4 Portfolio Analytics (Sharpe Ratio Calculation)

```typescript
// Get daily snapshots for period
const snapshots = await prisma.portfolioSnapshot.findMany({
  where: {
    portfolio_id: portfolioId,
    snapshot_date: { gte: startDate, lte: endDate },
  },
  orderBy: { snapshot_date: 'asc' },
  select: { snapshot_date: true, total_value: true, daily_return: true },
});

// Compute Sharpe in application layer (not SQL)
// Risk-free rate from Alpha Vantage FEDERAL_FUNDS_RATE endpoint
const sharpe = computeSharpe(snapshots.map(s => s.daily_return), riskFreeRate);
```

---

## 8. REDIS CACHE SCHEMA

```typescript
// All Redis keys for QuantEdge

// ─── PRICES ───
`price:{SYMBOL}`              → StockQuote JSON           TTL: 15s
`candles:{SYMBOL}:{RANGE}`    → StockPrice[] JSON          TTL: 1h (historical)
`movers:gainers`              → StockQuote[] top 20        TTL: 60s
`movers:losers`               → StockQuote[] top 20        TTL: 60s
`movers:active`               → StockQuote[] top 20        TTL: 60s
`sectors`                     → SectorData[] JSON          TTL: 5m
`indices`                     → IndexData[] JSON           TTL: 15s

// ─── NEWS ───
`news:market:{PAGE}`          → NewsArticle[] JSON         TTL: 15m
`news:stock:{SYMBOL}`         → NewsArticle[] JSON         TTL: 15m
`brief:daily:{DATE}`          → AiDailyBrief JSON          TTL: 12h

// ─── AI RESPONSES ───
`ai:{HASH}`                   → AI response text           TTL: 6h
`ai:news:{ARTICLE_ID}`        → Article summary            TTL: 24h

// ─── USER DATA ───
`user:{USER_ID}`              → User profile               TTL: 5m
`user:session:{USER_ID}`      → Active session count       TTL: 30d

// ─── RATE LIMITING ───
`rl:auth:{IP}`                → Failed attempt count       TTL: 15m
`rl:api:{USER_ID}`            → Request count              TTL: 1m
`rl:ai:{USER_ID}:hour`        → AI call count              TTL: 1h
`rl:ai:{USER_ID}:day`         → AI call count              TTL: 24h
`rl:search:{USER_ID}`         → Search count               TTL: 1s

// ─── JOB QUEUE (BullMQ managed) ───
`bull:{QUEUE_NAME}:*`         → BullMQ managed keys

// ─── ALERTS (pub/sub) ───
`alert:sub:{SYMBOL}`          → Set of user_ids            TTL: none
`alert:triggered:{ALERT_ID}`  → Lock for de-duplication    TTL: 5m

// ─── MARKET STATUS ───
`market:status`               → { isOpen, nextOpen }       TTL: 60s
`market:calendar`             → Trading calendar JSON       TTL: 24h

// ─── ECONOMIC DATA ───
`economic:calendar`           → Events[]                   TTL: 4h
`earnings:calendar`           → Events[]                   TTL: 4h
`risk_free_rate`              → Decimal string             TTL: 24h
```

---

*End of QuantEdge Schema v1.0.0*
*Next: See TECH_SPEC.md for full API specifications and implementation details*
