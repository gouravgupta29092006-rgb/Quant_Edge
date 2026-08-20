-- QuantEdge Local Dev Database Setup
-- Run once after PostgreSQL is installed:
--   psql -U postgres -f setup_local_db.sql

-- 1. Create app user
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'quantedge_user') THEN
    CREATE USER quantedge_user WITH PASSWORD 'devpassword123';
  END IF;
END
$$;

-- 2. Create database
SELECT 'CREATE DATABASE quantedge'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'quantedge') \gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quantedge TO quantedge_user;

-- 4. Connect to quantedge and grant schema privileges
\c quantedge
GRANT ALL ON SCHEMA public TO quantedge_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quantedge_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quantedge_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quantedge_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quantedge_user;

\echo 'Done! Database quantedge and user quantedge_user created.'
