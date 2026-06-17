#!/usr/bin/env bash
# ============================================================
# scripts/healthcheck.sh
# Run from project root: bash scripts/healthcheck.sh
# Checks that all containers are running and healthy.
# ============================================================

set -e

echo "============================================="
echo "  Microservice Health Check"
echo "============================================="

check_endpoint() {
  local NAME="$1"
  local URL="$2"
  local EXPECTED="$3"

  printf "Checking %-25s ... " "$NAME"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL" 2>/dev/null || echo "000")

  if [ "$RESPONSE" = "$EXPECTED" ]; then
    echo "OK ($RESPONSE)"
  else
    echo "FAIL (got $RESPONSE, expected $EXPECTED)"
  fi
}

echo ""
echo "Container statuses:"
docker compose ps

echo ""
echo "Service endpoint checks:"
check_endpoint "Service Registry"  "http://localhost:8761/actuator/health" "200"
check_endpoint "Auth Service"      "http://localhost:8080/api/auth/health" "200"
check_endpoint "Demo Service 1"    "http://localhost:8081/api/en1/test/public" "200"
check_endpoint "Demo Service 2"    "http://localhost:8082/api/en2/test/public" "200"
check_endpoint "API Gateway"       "http://localhost:8083/actuator/health" "200"
check_endpoint "Frontend (Nginx)"  "http://localhost:80" "200"
check_endpoint "Gateway→Auth"      "http://localhost:8083/api/auth/health" "200"
check_endpoint "Gateway→DS1"       "http://localhost:8083/api/en1/test/public" "200"
check_endpoint "Gateway→DS2"       "http://localhost:8083/api/en2/test/public" "200"

echo ""
echo "Done. Fix any FAIL items before deploying."
