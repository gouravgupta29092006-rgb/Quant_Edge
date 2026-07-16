-- V6__fix_stock_quotes_and_enum_casting.sql
-- QuantEdge — Schema corrections for runtime compatibility
-- 1. Add change_amount column (stock_quotes had 'change' instead of 'change_amount')
-- 2. Ensure users.role and users.status can accept varchar cast

-- Fix stock_quotes: rename 'change' → 'change_amount' if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stock_quotes' AND column_name = 'change'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stock_quotes' AND column_name = 'change_amount'
    ) THEN
        ALTER TABLE stock_quotes RENAME COLUMN "change" TO change_amount;
    END IF;

    -- If change_amount doesn't exist at all, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stock_quotes' AND column_name = 'change_amount'
    ) THEN
        ALTER TABLE stock_quotes ADD COLUMN change_amount DECIMAL(12, 4);
    END IF;
END $$;

-- Fix users: allow Hibernate's varchar to be cast into user_role ENUM
-- Drop and recreate role column as VARCHAR so JPA @Enumerated(STRING) works without custom type
-- (Simpler than configuring custom Hibernate enum type for PostgreSQL)
ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR,
    ALTER COLUMN status TYPE VARCHAR(30) USING status::VARCHAR;

-- Preserve defaults
ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'USER',
    ALTER COLUMN status SET DEFAULT 'PENDING_VERIFICATION';

-- Drop old enum types if nothing else uses them (safe with CASCADE only if no other references)
-- (Leave them if other tables still use them)
