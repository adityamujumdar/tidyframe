#!/bin/bash

# ================================================================
# TidyFrame Zero-Downtime Deployment Script
# Performs rolling update of backend services without downtime
# Usage: ./zero-downtime-deploy.sh [compose_file] [services...]
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ================================================================
# Configuration
# ================================================================

COMPOSE_FILE="${1:-docker-compose.prod.yml}"
SERVICES="${2:-backend celery-worker celery-beat}"

# If services are passed as separate arguments, collect them
if [ $# -gt 2 ]; then
    SERVICES="${@:2}"
fi

PROJECT_ROOT="${PROJECT_ROOT:-/opt/tidyframe}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-https://tidyframe.com/health}"
MAX_HEALTH_CHECKS="${MAX_HEALTH_CHECKS:-10}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-10}"
BUILD_NO_CACHE="${BUILD_NO_CACHE:-true}"

# ================================================================
# Helper Functions
# ================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

# ================================================================
# Pre-deployment Checks
# ================================================================

log_info "Zero-Downtime Deployment Script"
echo "  Compose File: $COMPOSE_FILE"
echo "  Services: $SERVICES"
echo "  Project Root: $PROJECT_ROOT"
echo ""

# Change to project directory
if [ ! -d "$PROJECT_ROOT" ]; then
    log_error "Project directory not found: $PROJECT_ROOT"
    exit 1
fi
cd "$PROJECT_ROOT"

# Check compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check docker compose is available
if ! docker compose version &>/dev/null; then
    log_error "Docker Compose v2 is not available"
    exit 1
fi

# ================================================================
# Store Current State
# ================================================================

log_info "Storing current deployment state..."

# Get current commit (if in a git repo)
if command -v git &>/dev/null && [ -d ".git" ]; then
    CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "current_commit=$CURRENT_COMMIT" > deployment.state
    echo "current_branch=$CURRENT_BRANCH" >> deployment.state
    echo "deployment_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> deployment.state
    log_success "Stored commit: $CURRENT_COMMIT on branch $CURRENT_BRANCH"
else
    log_warning "Not a git repository, skipping commit tracking"
fi

# Get current container IDs for rollback
for service in $SERVICES; do
    container_id=$(docker compose -f "$COMPOSE_FILE" ps -q "$service" 2>/dev/null || echo "")
    if [ -n "$container_id" ]; then
        echo "${service}_container=$container_id" >> deployment.state
        log_info "Current $service container: ${container_id:0:12}"
    fi
done

echo ""

# ================================================================
# Build New Images
# ================================================================

log_info "Building new container images..."

build_args=""
if [ "$BUILD_NO_CACHE" = "true" ]; then
    build_args="--no-cache"
fi

if docker compose -f "$COMPOSE_FILE" build $build_args $SERVICES; then
    log_success "Container images built successfully"
else
    log_error "Failed to build container images"
    exit 1
fi

echo ""

# ================================================================
# Zero-Downtime Deployment
# ================================================================

log_info "Starting zero-downtime deployment..."
log_info "This will recreate containers while keeping database and Redis running"

# Use --force-recreate to ensure new code is deployed
# Use --no-deps to avoid restarting postgres/redis (prevents downtime)
if docker compose -f "$COMPOSE_FILE" up -d --force-recreate --no-deps $SERVICES; then
    log_success "Containers recreated successfully"
else
    log_error "Failed to recreate containers"
    exit 1
fi

echo ""

# ================================================================
# Wait for Containers to Start
# ================================================================

log_info "Waiting for containers to initialize (15 seconds)..."
sleep 15

# Check container status
log_info "Checking container status..."
for service in $SERVICES; do
    status=$(docker compose -f "$COMPOSE_FILE" ps "$service" --format json 2>/dev/null | jq -r '.[0].State // "unknown"' 2>/dev/null || echo "unknown")
    if [ "$status" = "running" ]; then
        log_success "$service is running"
    else
        log_warning "$service status: $status"
    fi
done

echo ""

# ================================================================
# Health Checks
# ================================================================

log_info "Running health checks..."

if [ -n "$HEALTH_ENDPOINT" ]; then
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_HEALTH_CHECKS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        log_info "Health check attempt $ATTEMPT/$MAX_HEALTH_CHECKS..."

        # Check main health endpoint
        if curl -f -s -m 10 "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_success "Health endpoint is responsive: $HEALTH_ENDPOINT"
            break
        fi

        if [ $ATTEMPT -lt $MAX_HEALTH_CHECKS ]; then
            log_warning "Health check failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
            sleep $HEALTH_CHECK_INTERVAL
        else
            log_error "Health checks failed after $MAX_HEALTH_CHECKS attempts"
            echo ""
            log_error "Deployment may have issues. Check logs with:"
            echo "  docker compose -f $COMPOSE_FILE logs $SERVICES"
            exit 1
        fi
    done
else
    log_warning "No health endpoint configured, skipping health checks"
fi

echo ""

# ================================================================
# Final Verification
# ================================================================

log_info "Verifying deployment..."

# Check all services are healthy
all_healthy=true
for service in $SERVICES; do
    # Check if container is running
    status=$(docker compose -f "$COMPOSE_FILE" ps "$service" --format json 2>/dev/null | jq -r '.[0].State // "unknown"' 2>/dev/null || echo "unknown")

    if [ "$status" != "running" ]; then
        log_error "$service is not running (status: $status)"
        all_healthy=false
    fi
done

if [ "$all_healthy" = false ]; then
    log_error "Some services are not healthy"
    exit 1
fi

echo ""

# ================================================================
# Success Summary
# ================================================================

echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ Zero-Downtime Deployment Successful!${NC}"
echo "================================================================"
echo ""
log_success "Services updated: $SERVICES"
log_success "Deployment completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -n "$CURRENT_COMMIT" ] && [ "$CURRENT_COMMIT" != "unknown" ]; then
    NEW_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if [ "$NEW_COMMIT" != "$CURRENT_COMMIT" ]; then
        log_success "Code updated: ${CURRENT_COMMIT:0:8} → ${NEW_COMMIT:0:8}"
    else
        log_info "Code version: ${CURRENT_COMMIT:0:8} (unchanged)"
    fi
fi

echo ""
log_info "Monitor logs with:"
echo "  docker compose -f $COMPOSE_FILE logs -f $SERVICES"
echo ""
log_info "Rollback if needed:"
echo "  git reset --hard \$(grep current_commit deployment.state | cut -d= -f2)"
echo "  ./zero-downtime-deploy.sh $COMPOSE_FILE $SERVICES"
echo ""

exit 0
