-- ============================================================
-- postgres/init.sql
-- Place this file at: postgres/init.sql
--
-- This script runs ONCE when the PostgreSQL container is first
-- created (the data volume is empty).
-- It creates separate databases for each microservice.
-- ============================================================

-- ─── Auth Service Database ────────────────────────────────────
CREATE DATABASE auth_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE   = 'en_US.utf8';

-- ─── Demo Service 1 Database ─────────────────────────────────
CREATE DATABASE demo1_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE   = 'en_US.utf8';

-- ─── Demo Service 2 Database ─────────────────────────────────
CREATE DATABASE demo2_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE   = 'en_US.utf8';

-- ─── Grant all privileges to the app user ────────────────────
-- POSTGRES_USER (from .env) gets full access to all 3 databases.
-- In production, use separate users per service (principle of least privilege).
GRANT ALL PRIVILEGES ON DATABASE auth_db  TO postgres_user;
GRANT ALL PRIVILEGES ON DATABASE demo1_db TO postgres_user;
GRANT ALL PRIVILEGES ON DATABASE demo2_db TO postgres_user;

-- ─── Spring Session tables for auth-service ───────────────────
-- spring-session-jdbc requires SPRING_SESSION and SPRING_SESSION_ATTRIBUTES tables.
-- These are created automatically by Spring on first boot because
-- spring.session.jdbc.initialize-schema=always is set in docker properties.
-- No manual creation needed here.

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Databases auth_db, demo1_db, demo2_db created successfully.';
END $$;
