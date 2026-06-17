#!/usr/bin/env bash
# ============================================================
# scripts/build-all.sh
# Place at: scripts/build-all.sh
# Run from PROJECT ROOT: bash scripts/build-all.sh
#
# Builds all Spring Boot JARs before dockerizing.
# Run this ONCE before building Docker images.
# ============================================================

set -e  # Exit immediately on any error

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "============================================="
echo "  Building all microservice JARs"
echo "  Project root: $PROJECT_ROOT"
echo "============================================="

# Helper function
build_service() {
  local SERVICE_DIR="$1"
  local SERVICE_NAME="$2"

  echo ""
  echo ">>> Building $SERVICE_NAME ..."
  cd "$PROJECT_ROOT/$SERVICE_DIR"

  # Ensure mvnw is executable
  chmod +x mvnw

  # Build JAR, skip tests (already tested locally)
  ./mvnw clean package -DskipTests -B -q

  echo ">>> $SERVICE_NAME built successfully."
}

build_service "DemoMicroserviceProject/service-registry"  "service-registry"
build_service "DemoMicroserviceProject/auth-service"      "auth-service"
build_service "DemoMicroserviceProject/demo-service_1"    "demo-service-1"
build_service "DemoMicroserviceProject/demo-service_2"    "demo-service-2"
build_service "DemoMicroserviceProject/api-gateway"       "api-gateway"

echo ""
echo "============================================="
echo "  All JARs built successfully!"
echo ""
echo "  Output JARs:"
echo "  - service-registry/target/service-registry.jar"
echo "  - auth-service/target/auth-service-demo.jar"
echo "  - demo-service_1/target/demo-service1.jar"
echo "  - demo-service_2/target/demo-service2.jar"
echo "  - api-gateway/target/api-gateway.jar"
echo "============================================="
echo ""
echo "NEXT STEP: Build Docker images"
echo "  docker compose build --no-cache"
