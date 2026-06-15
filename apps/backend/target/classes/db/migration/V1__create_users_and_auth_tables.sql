-- ════════════════════════════════════════════════════════════
-- V1__create_users_and_auth_tables.sql
-- QuantEdge — Phase 2: Core user and authentication schema
-- ════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── ENUM Types ──────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED');

-- ─── users ───────────────────────────────────────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at   TIMESTAMPTZ,
    password_hash       TEXT NOT NULL,
    first_name          VARCHAR(50) NOT NULL,
    last_name           VARCHAR(50) NOT NULL,
    display_name        VARCHAR(100),
    avatar_url          TEXT,
    role                user_role NOT NULL DEFAULT 'USER',
    status              user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret   TEXT,
    two_factor_backup   TEXT[],
    failed_login_count  INTEGER NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    last_login_ip       VARCHAR(45),
    ai_calls_today      INTEGER NOT NULL DEFAULT 0,
    ai_calls_date       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_role ON users (role);

-- ─── user_preferences ────────────────────────────────────────
CREATE TABLE user_preferences (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    default_chart_type      VARCHAR(20) NOT NULL DEFAULT 'candlestick',
    default_time_range      VARCHAR(10) NOT NULL DEFAULT '1D',
    number_format           VARCHAR(10) NOT NULL DEFAULT 'en-US',
    email_daily_digest      BOOLEAN NOT NULL DEFAULT true,
    email_price_alerts      BOOLEAN NOT NULL DEFAULT true,
    email_portfolio         BOOLEAN NOT NULL DEFAULT false,
    email_earnings          BOOLEAN NOT NULL DEFAULT true,
    notif_price_alerts      BOOLEAN NOT NULL DEFAULT true,
    notif_portfolio         BOOLEAN NOT NULL DEFAULT true,
    notif_backtest          BOOLEAN NOT NULL DEFAULT true,
    notif_earnings          BOOLEAN NOT NULL DEFAULT true,
    onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
    user_type               VARCHAR(30),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── refresh_tokens ───────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    expires_at  TIMESTAMPTZ NOT NULL,
    last_used   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);

-- ─── verification_tokens ──────────────────────────────────────
CREATE TABLE verification_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    type        VARCHAR(30) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_hash ON verification_tokens (token_hash);
CREATE INDEX idx_verification_user ON verification_tokens (user_id);

-- ─── audit_logs ───────────────────────────────────────────────
CREATE TYPE audit_action AS ENUM (
    'AUTH_LOGIN', 'AUTH_LOGOUT', 'AUTH_REGISTER', 'AUTH_PASSWORD_RESET',
    'AUTH_2FA_ENABLE', 'AUTH_2FA_DISABLE', 'AUTH_2FA_VERIFY',
    'TRADE_BUY', 'TRADE_SELL',
    'PORTFOLIO_CREATE', 'PORTFOLIO_DELETE',
    'STRATEGY_CREATE', 'STRATEGY_DELETE',
    'BACKTEST_RUN',
    'WATCHLIST_ADD', 'WATCHLIST_REMOVE',
    'ALERT_CREATE', 'ALERT_DELETE',
    'ADMIN_USER_SUSPEND', 'ADMIN_ROLE_CHANGE',
    'AI_CALL'
);

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    action          audit_action NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       VARCHAR(36),
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    metadata        TEXT,
    success         BOOLEAN NOT NULL DEFAULT true,
    failure_reason  VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
