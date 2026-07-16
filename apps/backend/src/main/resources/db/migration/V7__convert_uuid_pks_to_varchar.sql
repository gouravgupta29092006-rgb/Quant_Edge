-- V7__convert_uuid_pks_to_varchar.sql
-- QuantEdge — Convert all UUID PK/FK columns to VARCHAR(36)
-- Runs after V1-V6 which create tables with PostgreSQL native uuid type.
-- JPA entities use String IDs with @GeneratedValue(UUID) → varchar.

-- ─── STEP 1: Drop ALL FK constraints ─────────────────────────────────────

ALTER TABLE ai_interactions     DROP CONSTRAINT IF EXISTS ai_interactions_user_id_fkey;
ALTER TABLE audit_logs          DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE backtests           DROP CONSTRAINT IF EXISTS backtests_portfolio_id_fkey;
ALTER TABLE backtests           DROP CONSTRAINT IF EXISTS backtests_strategy_id_fkey;
ALTER TABLE backtests           DROP CONSTRAINT IF EXISTS backtests_user_id_fkey;
ALTER TABLE holdings            DROP CONSTRAINT IF EXISTS holdings_portfolio_id_fkey;
ALTER TABLE holdings            DROP CONSTRAINT IF EXISTS holdings_symbol_fkey;
ALTER TABLE news_stock_mentions DROP CONSTRAINT IF EXISTS news_stock_mentions_article_id_fkey;
ALTER TABLE news_stock_mentions DROP CONSTRAINT IF EXISTS news_stock_mentions_symbol_fkey;
ALTER TABLE notifications       DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE portfolios          DROP CONSTRAINT IF EXISTS portfolios_user_id_fkey;
ALTER TABLE price_alerts        DROP CONSTRAINT IF EXISTS price_alerts_user_id_fkey;
ALTER TABLE price_alerts        DROP CONSTRAINT IF EXISTS price_alerts_symbol_fkey;
ALTER TABLE refresh_tokens      DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
ALTER TABLE stock_prices        DROP CONSTRAINT IF EXISTS stock_prices_symbol_fkey;
ALTER TABLE stock_quotes        DROP CONSTRAINT IF EXISTS stock_quotes_symbol_fkey;
ALTER TABLE strategies          DROP CONSTRAINT IF EXISTS strategies_user_id_fkey;
ALTER TABLE transactions        DROP CONSTRAINT IF EXISTS transactions_portfolio_id_fkey;
ALTER TABLE transactions        DROP CONSTRAINT IF EXISTS transactions_symbol_fkey;
ALTER TABLE user_preferences    DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE verification_tokens DROP CONSTRAINT IF EXISTS verification_tokens_user_id_fkey;
ALTER TABLE watchlists          DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey;
ALTER TABLE watchlist_items     DROP CONSTRAINT IF EXISTS watchlist_items_watchlist_id_fkey;
ALTER TABLE watchlist_items     DROP CONSTRAINT IF EXISTS watchlist_items_symbol_fkey;
ALTER TABLE portfolio_snapshots DROP CONSTRAINT IF EXISTS portfolio_snapshots_portfolio_id_fkey;

-- ─── STEP 2: Convert all UUID PK columns to VARCHAR(36) ──────────────────

ALTER TABLE users               ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE audit_logs          ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE refresh_tokens      ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE portfolios          ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE holdings            ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE transactions        ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE portfolio_snapshots ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE strategies          ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE backtests           ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE watchlists          ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE watchlist_items     ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;

-- Optional PKs (tables may exist from different migration runs)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_alerts'      AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE price_alerts      ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_interactions'   AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE ai_interactions   ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications'     AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE notifications     ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_articles'     AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE news_articles     ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_preferences'  AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE user_preferences  ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='verification_tokens' AND column_name='id' AND data_type='uuid') THEN
        ALTER TABLE verification_tokens ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR; END IF;
END $$;

-- ─── STEP 3: Convert all UUID FK columns to VARCHAR(36) ──────────────────

ALTER TABLE audit_logs          ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE refresh_tokens      ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE portfolios          ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE strategies          ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE backtests           ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE backtests           ALTER COLUMN strategy_id  TYPE VARCHAR(36) USING strategy_id::VARCHAR;
ALTER TABLE watchlists          ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE holdings            ALTER COLUMN portfolio_id TYPE VARCHAR(36) USING portfolio_id::VARCHAR;
ALTER TABLE transactions        ALTER COLUMN portfolio_id TYPE VARCHAR(36) USING portfolio_id::VARCHAR;
ALTER TABLE portfolio_snapshots ALTER COLUMN portfolio_id TYPE VARCHAR(36) USING portfolio_id::VARCHAR;
ALTER TABLE watchlist_items     ALTER COLUMN watchlist_id TYPE VARCHAR(36) USING watchlist_id::VARCHAR;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='backtests'          AND column_name='portfolio_id' AND data_type='uuid') THEN
        ALTER TABLE backtests         ALTER COLUMN portfolio_id TYPE VARCHAR(36) USING portfolio_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_alerts'       AND column_name='user_id' AND data_type='uuid') THEN
        ALTER TABLE price_alerts      ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_interactions'    AND column_name='user_id' AND data_type='uuid') THEN
        ALTER TABLE ai_interactions   ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications'      AND column_name='user_id' AND data_type='uuid') THEN
        ALTER TABLE notifications     ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_preferences'   AND column_name='user_id' AND data_type='uuid') THEN
        ALTER TABLE user_preferences  ALTER COLUMN user_id      TYPE VARCHAR(36) USING user_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='verification_tokens' AND column_name='user_id' AND data_type='uuid') THEN
        ALTER TABLE verification_tokens ALTER COLUMN user_id    TYPE VARCHAR(36) USING user_id::VARCHAR; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_stock_mentions' AND column_name='article_id' AND data_type='uuid') THEN
        ALTER TABLE news_stock_mentions ALTER COLUMN article_id TYPE VARCHAR(36) USING article_id::VARCHAR; END IF;
END $$;

-- ─── STEP 4: Restore FK constraints ───────────────────────────────────────

ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE portfolios ADD CONSTRAINT portfolios_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE strategies ADD CONSTRAINT strategies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE backtests ADD CONSTRAINT backtests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE backtests ADD CONSTRAINT backtests_strategy_id_fkey
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE watchlists ADD CONSTRAINT watchlists_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE holdings ADD CONSTRAINT holdings_portfolio_id_fkey
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;
ALTER TABLE holdings ADD CONSTRAINT holdings_symbol_fkey
    FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE NO ACTION;
ALTER TABLE transactions ADD CONSTRAINT transactions_portfolio_id_fkey
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD CONSTRAINT transactions_symbol_fkey
    FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE NO ACTION;
ALTER TABLE portfolio_snapshots ADD CONSTRAINT portfolio_snapshots_portfolio_id_fkey
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;
ALTER TABLE watchlist_items ADD CONSTRAINT watchlist_items_watchlist_id_fkey
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE;
ALTER TABLE watchlist_items ADD CONSTRAINT watchlist_items_symbol_fkey
    FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE NO ACTION;
ALTER TABLE stock_prices ADD CONSTRAINT stock_prices_symbol_fkey
    FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE CASCADE;
ALTER TABLE stock_quotes ADD CONSTRAINT stock_quotes_symbol_fkey
    FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE CASCADE;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='backtests' AND column_name='portfolio_id') THEN
        ALTER TABLE backtests ADD CONSTRAINT backtests_portfolio_id_fkey
            FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_alerts' AND column_name='user_id') THEN
        ALTER TABLE price_alerts ADD CONSTRAINT price_alerts_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE price_alerts ADD CONSTRAINT price_alerts_symbol_fkey
            FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE NO ACTION; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_interactions' AND column_name='user_id') THEN
        ALTER TABLE ai_interactions ADD CONSTRAINT ai_interactions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_preferences' AND column_name='user_id') THEN
        ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='verification_tokens' AND column_name='user_id') THEN
        ALTER TABLE verification_tokens ADD CONSTRAINT verification_tokens_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_stock_mentions' AND column_name='article_id') THEN
        ALTER TABLE news_stock_mentions ADD CONSTRAINT news_stock_mentions_article_id_fkey
            FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE;
        ALTER TABLE news_stock_mentions ADD CONSTRAINT news_stock_mentions_symbol_fkey
            FOREIGN KEY (symbol) REFERENCES stocks(symbol) ON DELETE NO ACTION; END IF;
END $$;
