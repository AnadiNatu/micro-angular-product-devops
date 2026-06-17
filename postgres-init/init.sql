-- ============================================================
-- postgres-init/init.sql
-- Runs ONCE on first container creation
-- ============================================================

-- ─── Auth Service ─────────────────────────────────────────────
CREATE USER auth_user WITH PASSWORD 'placeholder';
CREATE DATABASE auth_db
    WITH ENCODING='UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8'
    OWNER auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

-- ─── Demo Service 1 ───────────────────────────────────────────
CREATE USER demo1_user WITH PASSWORD 'placeholder';
CREATE DATABASE demo1_db
    WITH ENCODING='UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8'
    OWNER demo1_user;
GRANT ALL PRIVILEGES ON DATABASE demo1_db TO demo1_user;

-- ─── Demo Service 2 ───────────────────────────────────────────
CREATE USER demo2_user WITH PASSWORD 'placeholder';
CREATE DATABASE demo2_db
    WITH ENCODING='UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8'
    OWNER demo2_user;
GRANT ALL PRIVILEGES ON DATABASE demo2_db TO demo2_user;

DO $$
BEGIN
  RAISE NOTICE 'All databases created successfully.';
END $$;