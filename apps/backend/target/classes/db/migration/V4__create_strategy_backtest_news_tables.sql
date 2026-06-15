-- ════════════════════════════════════════════════════════════
-- V4__create_strategy_backtest_news_tables.sql
-- QuantEdge — Strategy builder, backtesting, news, notifications
-- ════════════════════════════════════════════════════════════

-- ─── strategies ───────────────────────────────────────────────
CREATE TYPE strategy_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE position_sizing AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_SHARES');

CREATE TABLE strategies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    tags                JSONB NOT NULL DEFAULT '[]',
    status              strategy_status NOT NULL DEFAULT 'DRAFT',
    rules               JSONB NOT NULL DEFAULT '[]',
    indicators          JSONB NOT NULL DEFAULT '[]',
    entry_conditions    JSONB NOT NULL DEFAULT '[]',
    exit_conditions     JSONB NOT NULL DEFAULT '[]',
    position_sizing     position_sizing NOT NULL DEFAULT 'PERCENTAGE',
    position_value      DECIMAL(8, 2) NOT NULL DEFAULT 100,
    stop_loss_pct       DECIMAL(6, 2),
    take_profit_pct     DECIMAL(6, 2),
    ai_confidence       DECIMAL(5, 2),
    ai_notes            TEXT,
    is_public           BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_strategies_user_id ON strategies (user_id);
CREATE INDEX idx_strategies_status ON strategies (status);
CREATE INDEX idx_strategies_is_public ON strategies (is_public);

-- ─── backtests ────────────────────────────────────────────────
CREATE TYPE backtest_status AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT', 'CANCELLED');

CREATE TABLE backtests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_id         UUID REFERENCES strategies(id) ON DELETE SET NULL,
    portfolio_id        UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    name                VARCHAR(200),
    symbol              VARCHAR(10) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    initial_capital     DECIMAL(14, 2) NOT NULL,
    commission          DECIMAL(8, 2) NOT NULL DEFAULT 0,
    position_sizing     position_sizing NOT NULL DEFAULT 'PERCENTAGE',
    position_value      DECIMAL(8, 2) NOT NULL DEFAULT 100,
    status              backtest_status NOT NULL DEFAULT 'QUEUED',
    progress_step       INTEGER NOT NULL DEFAULT 0,
    progress_percent    INTEGER NOT NULL DEFAULT 0,
    error_message       TEXT,
    -- Result metrics
    total_return_pct    DECIMAL(10, 4),
    annualized_return   DECIMAL(10, 4),
    sharpe_ratio        DECIMAL(8, 4),
    sortino_ratio       DECIMAL(8, 4),
    max_drawdown_pct    DECIMAL(8, 4),
    max_drawdown_start  DATE,
    max_drawdown_end    DATE,
    volatility          DECIMAL(8, 4),
    win_rate            DECIMAL(6, 4),
    total_trades        INTEGER,
    profitable_trades   INTEGER,
    losing_trades       INTEGER,
    avg_profit_pct      DECIMAL(8, 4),
    avg_loss_pct        DECIMAL(8, 4),
    profit_factor       DECIMAL(8, 4),
    benchmark_return    DECIMAL(10, 4),
    alpha               DECIMAL(8, 4),
    beta                DECIMAL(8, 4),
    -- JSON results
    equity_curve        JSONB,
    trade_log           JSONB,
    monthly_returns     JSONB,
    ai_interpretation   TEXT,
    ai_generated_at     TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_backtests_user_created ON backtests (user_id, created_at DESC);
CREATE INDEX idx_backtests_strategy_id ON backtests (strategy_id);
CREATE INDEX idx_backtests_status ON backtests (status);

-- ─── news_articles ────────────────────────────────────────────
CREATE TABLE news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     VARCHAR(200) UNIQUE,
    source          VARCHAR(100) NOT NULL,
    source_url      TEXT UNIQUE NOT NULL,
    headline        TEXT NOT NULL,
    excerpt         TEXT,
    full_content    TEXT,
    author          VARCHAR(200),
    category        VARCHAR(50),
    image_url       TEXT,
    published_at    TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_articles_published ON news_articles (published_at DESC);
CREATE INDEX idx_news_articles_category ON news_articles (category);
CREATE INDEX idx_news_articles_fts ON news_articles USING GIN (to_tsvector('english', headline));

-- ─── news_stock_mentions ──────────────────────────────────────
CREATE TABLE news_stock_mentions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id  UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    symbol      VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    sentiment   VARCHAR(10),
    relevance   DECIMAL(4, 3),
    UNIQUE (article_id, symbol)
);

CREATE INDEX idx_news_mentions_symbol ON news_stock_mentions (symbol);
CREATE INDEX idx_news_mentions_article ON news_stock_mentions (article_id);

-- ─── ai_interactions ──────────────────────────────────────────
CREATE TABLE ai_interactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type    VARCHAR(50) NOT NULL,
    context_id      VARCHAR(36),
    prompt_summary  TEXT,
    response_cache_key VARCHAR(128),
    tokens_used     INTEGER,
    model           VARCHAR(50),
    latency_ms      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_interactions_user ON ai_interactions (user_id, created_at DESC);

-- ─── notifications ────────────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
    'PRICE_ALERT', 'PORTFOLIO_CHANGE', 'BACKTEST_COMPLETE',
    'EARNINGS_REMINDER', 'SYSTEM', 'AI_INSIGHT'
);
CREATE TYPE notification_status AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    action_url  VARCHAR(500),
    icon        VARCHAR(50),
    status      notification_status NOT NULL DEFAULT 'UNREAD',
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_status ON notifications (user_id, status);
CREATE INDEX idx_notifications_created ON notifications (user_id, created_at DESC);
