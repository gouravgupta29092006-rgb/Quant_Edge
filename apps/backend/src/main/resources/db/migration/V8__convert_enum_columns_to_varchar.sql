-- V8__convert_enum_columns_to_varchar.sql
-- QuantEdge — Convert all PostgreSQL ENUM columns to VARCHAR
-- Reason: JPA @Enumerated(STRING) sends varchar but DB expects ENUM type cast.
-- Converting to VARCHAR makes Hibernate inserts work without custom type mappings.

-- audit_logs.action (audit_action enum)
ALTER TABLE audit_logs ALTER COLUMN action TYPE VARCHAR(50) USING action::VARCHAR;

-- transactions.order_type (order_type enum) and type (transaction_type enum)
ALTER TABLE transactions ALTER COLUMN order_type TYPE VARCHAR(20) USING order_type::VARCHAR;
ALTER TABLE transactions ALTER COLUMN type        TYPE VARCHAR(20) USING type::VARCHAR;

-- price_alerts.condition (alert_condition enum) and status (alert_status enum)
ALTER TABLE price_alerts ALTER COLUMN condition TYPE VARCHAR(20) USING condition::VARCHAR;
ALTER TABLE price_alerts ALTER COLUMN status    TYPE VARCHAR(20) USING status::VARCHAR;

-- strategies.position_sizing and status
ALTER TABLE strategies ALTER COLUMN position_sizing TYPE VARCHAR(20) USING position_sizing::VARCHAR;
ALTER TABLE strategies ALTER COLUMN status          TYPE VARCHAR(30) USING status::VARCHAR;

-- backtests.position_sizing and status
ALTER TABLE backtests ALTER COLUMN position_sizing TYPE VARCHAR(20) USING position_sizing::VARCHAR;
ALTER TABLE backtests ALTER COLUMN status          TYPE VARCHAR(20) USING status::VARCHAR;

-- notifications.status and type
ALTER TABLE notifications ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR;
ALTER TABLE notifications ALTER COLUMN type   TYPE VARCHAR(30) USING type::VARCHAR;

-- Also convert users.role and status if still ENUM (from V1, V6 may not have run yet)
DO $$ BEGIN
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_name='users' AND column_name='role') = 'USER-DEFINED' THEN
        ALTER TABLE users ALTER COLUMN role   TYPE VARCHAR(20) USING role::VARCHAR;
        ALTER TABLE users ALTER COLUMN status TYPE VARCHAR(30) USING status::VARCHAR;
    END IF;
END $$;
