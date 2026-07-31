-- ════════════════════════════════════════════════════════════
-- V5__create_stock_quotes_table.sql
-- QuantEdge — Add stock_quotes table (missed in V2)
-- ════════════════════════════════════════════════════════════

-- ─── stock_quotes ─────────────────────────────────────────────
-- One row per symbol, upserted on every price update.
-- Serves as DB-level quote cache (fallback when Redis is empty).

CREATE TABLE IF NOT EXISTS stock_quotes (
    symbol              VARCHAR(10) PRIMARY KEY REFERENCES stocks(symbol) ON DELETE CASCADE,
    price               DECIMAL(12, 4) NOT NULL,
    open                DECIMAL(12, 4),
    high                DECIMAL(12, 4),
    low                 DECIMAL(12, 4),
    prev_close          DECIMAL(12, 4),
    change_amount       DECIMAL(12, 4),
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

CREATE INDEX IF NOT EXISTS idx_stock_quotes_updated ON stock_quotes (updated_at DESC);
