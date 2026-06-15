-- ════════════════════════════════════════════════════════════
-- V3__create_portfolio_tables.sql
-- QuantEdge — Portfolio, holdings, transactions, snapshots
-- ════════════════════════════════════════════════════════════

-- ─── portfolios ───────────────────────────────────────────────
CREATE TABLE portfolios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    cash_balance    DECIMAL(14, 2) NOT NULL DEFAULT 100000.00,
    initial_capital DECIMAL(14, 2) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);
CREATE INDEX idx_portfolios_user_deleted ON portfolios (user_id, is_deleted);

-- ─── holdings ─────────────────────────────────────────────────
CREATE TABLE holdings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol          VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    shares          DECIMAL(12, 4) NOT NULL,
    average_cost    DECIMAL(12, 4) NOT NULL,
    total_cost      DECIMAL(14, 2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (portfolio_id, symbol)
);

CREATE INDEX idx_holdings_portfolio_id ON holdings (portfolio_id);
CREATE INDEX idx_holdings_symbol ON holdings (symbol);

-- ─── transactions ─────────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'CASH_DEPOSIT', 'CASH_WITHDRAWAL');
CREATE TYPE order_type AS ENUM ('MARKET', 'LIMIT');

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol          VARCHAR(10) REFERENCES stocks(symbol),
    type            transaction_type NOT NULL,
    order_type      order_type NOT NULL DEFAULT 'MARKET',
    shares          DECIMAL(12, 4),
    price_per_share DECIMAL(12, 4),
    total_amount    DECIMAL(14, 2) NOT NULL,
    commission      DECIMAL(8, 2) NOT NULL DEFAULT 0,
    notes           VARCHAR(500),
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_portfolio_executed ON transactions (portfolio_id, executed_at DESC);
CREATE INDEX idx_transactions_portfolio_type ON transactions (portfolio_id, type);
CREATE INDEX idx_transactions_symbol ON transactions (symbol);

-- ─── portfolio_snapshots ──────────────────────────────────────
CREATE TABLE portfolio_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date   DATE NOT NULL,
    total_value     DECIMAL(14, 2) NOT NULL,
    holdings_value  DECIMAL(14, 2) NOT NULL,
    cash_balance    DECIMAL(14, 2) NOT NULL,
    daily_return    DECIMAL(8, 4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (portfolio_id, snapshot_date)
);

CREATE INDEX idx_snapshots_portfolio_date ON portfolio_snapshots (portfolio_id, snapshot_date DESC);

-- ─── watchlists ───────────────────────────────────────────────
CREATE TABLE watchlists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── watchlist_items ──────────────────────────────────────────
CREATE TABLE watchlist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id    UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol          VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes           VARCHAR(200),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    UNIQUE (watchlist_id, symbol)
);

CREATE INDEX idx_watchlist_items_watchlist_id ON watchlist_items (watchlist_id);

-- ─── price_alerts ─────────────────────────────────────────────
CREATE TYPE alert_condition AS ENUM ('ABOVE', 'BELOW', 'PERCENT_CHANGE_UP', 'PERCENT_CHANGE_DOWN');
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'TRIGGERED', 'PAUSED', 'DELETED');

CREATE TABLE price_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol          VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
    condition       alert_condition NOT NULL,
    target_value    DECIMAL(12, 4) NOT NULL,
    message         VARCHAR(300),
    status          alert_status NOT NULL DEFAULT 'ACTIVE',
    triggered_at    TIMESTAMPTZ,
    triggered_price DECIMAL(12, 4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_alerts_user_id ON price_alerts (user_id);
CREATE INDEX idx_price_alerts_symbol_status ON price_alerts (symbol, status);
