#!/bin/bash
# =============================================================================
# postgres/01-init-databases.sh
# Runs ONCE on first container start (postgres Docker entrypoint convention)
# Creates separate databases and users for each microservice
# =============================================================================
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

    -- ── Auth Service ─────────────────────────────────────────────────────────
    CREATE USER ${AUTH_DB_USER} WITH PASSWORD '${AUTH_DB_PASSWORD}';
    CREATE DATABASE ${AUTH_DB_NAME} OWNER ${AUTH_DB_USER};
    GRANT ALL PRIVILEGES ON DATABASE ${AUTH_DB_NAME} TO ${AUTH_DB_USER};

    -- ── Demo Service 1 ───────────────────────────────────────────────────────
    CREATE USER ${DEMO1_DB_USER} WITH PASSWORD '${DEMO1_DB_PASSWORD}';
    CREATE DATABASE ${DEMO1_DB_NAME} OWNER ${DEMO1_DB_USER};
    GRANT ALL PRIVILEGES ON DATABASE ${DEMO1_DB_NAME} TO ${DEMO1_DB_USER};

    -- ── Demo Service 2 ───────────────────────────────────────────────────────
    CREATE USER ${DEMO2_DB_USER} WITH PASSWORD '${DEMO2_DB_PASSWORD}';
    CREATE DATABASE ${DEMO2_DB_NAME} OWNER ${DEMO2_DB_USER};
    GRANT ALL PRIVILEGES ON DATABASE ${DEMO2_DB_NAME} TO ${DEMO2_DB_USER};

EOSQL

echo "✅ All databases and users created successfully"