-- ════════════════════════════════════════════════════════════
-- V2__create_stocks_and_market_tables.sql
-- QuantEdge — Market data and stock metadata
-- ════════════════════════════════════════════════════════════

-- ─── stocks ───────────────────────────────────────────────────
CREATE TABLE stocks (
    symbol          VARCHAR(10) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    exchange        VARCHAR(20) NOT NULL,
    sector          VARCHAR(100),
    industry        VARCHAR(100),
    description     TEXT,
    logo_url        TEXT,
    website         VARCHAR(255),
    employees       INTEGER,
    founded_year    INTEGER,
    country         VARCHAR(5) NOT NULL DEFAULT 'US',
    currency        VARCHAR(5) NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stocks_name ON stocks (name);
CREATE INDEX idx_stocks_sector ON stocks (sector);
CREATE INDEX idx_stocks_is_active ON stocks (is_active);
-- Full text search index for stock search
CREATE INDEX idx_stocks_fts ON stocks USING GIN (to_tsvector('english', symbol || ' ' || name));

-- ─── stock_prices (OHLCV time series) ────────────────────────
CREATE TABLE stock_prices (
    id          BIGSERIAL PRIMARY KEY,
    symbol      VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    timestamp   TIMESTAMPTZ NOT NULL,
    open        DECIMAL(12, 4) NOT NULL,
    high        DECIMAL(12, 4) NOT NULL,
    low         DECIMAL(12, 4) NOT NULL,
    close       DECIMAL(12, 4) NOT NULL,
    volume      BIGINT NOT NULL,
    vwap        DECIMAL(12, 4),
    interval    VARCHAR(10) NOT NULL,   -- 1min, 5min, 15min, 1hour, 1day
    source      VARCHAR(20) NOT NULL DEFAULT 'finnhub'
);

CREATE UNIQUE INDEX idx_stock_prices_unique ON stock_prices (symbol, timestamp, interval);
CREATE INDEX idx_stock_prices_symbol_ts ON stock_prices (symbol, timestamp DESC);
CREATE INDEX idx_stock_prices_symbol_interval ON stock_prices (symbol, interval, timestamp DESC);

-- ─── stock_quotes (latest real-time quote per symbol) ─────────
CREATE TABLE stock_quotes (
    symbol              VARCHAR(10) PRIMARY KEY REFERENCES stocks(symbol) ON DELETE CASCADE,
    price               DECIMAL(12, 4) NOT NULL,
    open                DECIMAL(12, 4),
    high                DECIMAL(12, 4),
    low                 DECIMAL(12, 4),
    prev_close          DECIMAL(12, 4),
    change              DECIMAL(12, 4),
    change_percent      DECIMAL(8, 4),
    volume              BIGINT,
    avg_volume          BIGINT,
    market_cap          BIGINT,
    pe_ratio            DECIMAL(10, 2),
    eps                 DECIMAL(10, 4),
    beta                DECIMAL(8, 4),
    dividend_yield      DECIMAL(8, 4),
    week_52_high        DECIMAL(12, 4),
    week_52_low         DECIMAL(12, 4),
    shares_outstanding  BIGINT,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Seed most-watched stocks ─────────────────────────────────
INSERT INTO stocks (symbol, name, exchange, sector, industry) VALUES
    ('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics'),
    ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software'),
    ('GOOGL', 'Alphabet Inc.', 'NASDAQ', 'Communication Services', 'Internet Content & Information'),
    ('AMZN', 'Amazon.com Inc.', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail'),
    ('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'Semiconductors'),
    ('TSLA', 'Tesla Inc.', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers'),
    ('META', 'Meta Platforms Inc.', 'NASDAQ', 'Communication Services', 'Internet Content & Information'),
    ('NFLX', 'Netflix Inc.', 'NASDAQ', 'Communication Services', 'Entertainment'),
    ('JPM', 'JPMorgan Chase & Co.', 'NYSE', 'Financial Services', 'Banks'),
    ('V', 'Visa Inc.', 'NYSE', 'Financial Services', 'Credit Services'),
    ('MA', 'Mastercard Incorporated', 'NYSE', 'Financial Services', 'Credit Services'),
    ('UNH', 'UnitedHealth Group Incorporated', 'NYSE', 'Healthcare', 'Healthcare Plans'),
    ('JNJ', 'Johnson & Johnson', 'NYSE', 'Healthcare', 'Drug Manufacturers'),
    ('WMT', 'Walmart Inc.', 'NYSE', 'Consumer Defensive', 'Discount Stores'),
    ('PG', 'Procter & Gamble Company', 'NYSE', 'Consumer Defensive', 'Household & Personal Products'),
    ('KO', 'The Coca-Cola Company', 'NYSE', 'Consumer Defensive', 'Beverages'),
    ('DIS', 'The Walt Disney Company', 'NYSE', 'Communication Services', 'Entertainment'),
    ('ADBE', 'Adobe Inc.', 'NASDAQ', 'Technology', 'Software'),
    ('CRM', 'Salesforce Inc.', 'NYSE', 'Technology', 'Software'),
    ('AMD', 'Advanced Micro Devices Inc.', 'NASDAQ', 'Technology', 'Semiconductors');
