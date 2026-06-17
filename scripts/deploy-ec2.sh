#!/usr/bin/env bash
# ============================================================
# scripts/deploy-ec2.sh
# Run ON THE EC2 INSTANCE from /home/ec2-user/app/
#
# Prerequisites on EC2:
# 1. Docker and Docker Compose installed
# 2. .env.prod file in /home/ec2-user/app/
# 3. docker-compose.yml and docker-compose.prod.yml copied/cloned
# ============================================================

set -e

APP_DIR="/home/ec2-user/app"
ENV_FILE="$APP_DIR/.env.prod"

echo "============================================="
echo "  Deploying to EC2"
echo "  Working dir: $APP_DIR"
echo "============================================="

cd "$APP_DIR"

# Check .env.prod exists
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found."
  echo "Copy it with: scp -i key.pem .env.prod ec2-user@IP:$ENV_FILE"
  exit 1
fi

echo "Pulling latest images / building..."
docker compose \
  --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  build --no-cache

echo "Stopping old containers (data volumes preserved)..."
docker compose \
  --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  down

echo "Starting all services..."
docker compose \
  --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d

echo "Waiting 30 seconds for services to start..."
sleep 30

echo "Container statuses:"
docker compose \
  --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  ps

echo ""
echo "Deployment complete!"
echo "Check logs: docker compose logs -f --tail=50"
