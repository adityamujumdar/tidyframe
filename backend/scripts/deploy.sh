#!/bin/bash

# =============================================================================
# TidyFrame Production Deployment Script - Digital Ocean
# =============================================================================
# This script handles the complete deployment process including:
# - Prerequisites checking
# - Environment setup
# - Frontend build with production environment variables
# - Database initialization
# - Docker services startup
# - SSL/HTTPS configuration
# - Health checks and validation
# =============================================================================

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# =============================================================================
# Configuration & Constants
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DEPLOY_LOG="$PROJECT_ROOT/logs/deploy-$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration - can be overridden via environment variables
DOMAIN=${DOMAIN:-""}
CERTBOT_EMAIL=${CERTBOT_EMAIL:-""}
DEPLOY_ENV=${DEPLOY_ENV:-"production"}
SKIP_SSL=${SKIP_SSL:-false}
SKIP_BACKUP=${SKIP_BACKUP:-false}
FORCE_REBUILD=${FORCE_REBUILD:-false}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-300}

# Validate required variables
if [ -z "$DOMAIN" ]; then
    log_error "DOMAIN environment variable or --domain parameter is required"
    echo "Use: $0 --domain your-domain.com --email your-email@domain.com"
    exit 1
fi

if [ -z "$CERTBOT_EMAIL" ] && [ "$SKIP_SSL" = "false" ]; then
    log_error "CERTBOT_EMAIL environment variable or --email parameter is required for SSL setup"
    echo "Use: $0 --domain your-domain.com --email your-email@domain.com"
    echo "Or use --skip-ssl to skip SSL configuration"
    exit 1
fi

# =============================================================================
# Utility Functions
# =============================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$DEPLOY_LOG"
}

log_info() {
    log "INFO" "${BLUE}$*${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}$*${NC}"
}

log_warning() {
    log "WARNING" "${YELLOW}$*${NC}"
}

log_error() {
    log "ERROR" "${RED}$*${NC}"
}

print_banner() {
    echo -e "${GREEN}"
    echo "================================================================="
    echo "  TidyFrame Production Deployment - Digital Ocean"
    echo "  Environment: $DEPLOY_ENV"
    echo "  Domain: $DOMAIN"
    echo "  Timestamp: $(date)"
    echo "================================================================="
    echo -e "${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' is not installed"
        return 1
    fi
}

wait_for_service() {
    local service_name=$1
    local check_command=$2
    local timeout=${3:-60}
    local interval=${4:-5}
    
    log_info "Waiting for $service_name to be ready..."
    local elapsed=0
    local last_error=""
    
    while [ $elapsed -lt $timeout ]; do
        if last_error=$(eval "$check_command" 2>&1); then
            log_success "$service_name is ready"
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
        printf "."
        
        # Log progress every 30 seconds
        if [ $((elapsed % 30)) -eq 0 ]; then
            echo ""
            log_info "$service_name still starting... (${elapsed}s/${timeout}s)"
        fi
    done
    
    echo ""
    log_error "$service_name failed to start within $timeout seconds"
    if [ -n "$last_error" ]; then
        log_error "Last error: $last_error"
    fi
    
    # Show service logs for debugging
    if command -v docker &>/dev/null; then
        log_info "Recent logs for debugging:"
        docker logs --tail=20 "tidyframe-${service_name,,}-prod" 2>/dev/null || true
    fi
    
    return 1
}

retry_command() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local command="$*"
    
    for attempt in $(seq 1 $max_attempts); do
        if eval "$command"; then
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log_warning "Command failed (attempt $attempt/$max_attempts), retrying in ${delay}s..."
            sleep $delay
        fi
    done
    
    log_error "Command failed after $max_attempts attempts: $command"
    return 1
}

# =============================================================================
# Prerequisites Check
# =============================================================================

check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Create necessary directories
    mkdir -p "$PROJECT_ROOT/logs" "$PROJECT_ROOT/backups" "$PROJECT_ROOT/data"
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "curl" "openssl")
    for cmd in "${required_commands[@]}"; do
        if ! check_command "$cmd"; then
            log_error "Missing required command: $cmd"
            exit 1
        fi
    done
    
    # Check Docker daemon
    if ! docker info &>/dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check available disk space (minimum 10GB)
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 10485760 ]; then  # 10GB in KB
        log_warning "Low disk space: $(($available_space / 1024 / 1024))GB available"
    fi
    
    # Check memory (minimum 2GB)
    local available_memory=$(free -m | awk 'NR==2{print $7}')
    if [ "$available_memory" -lt 2048 ]; then
        log_warning "Low memory: ${available_memory}MB available"
    fi
    
    log_success "Prerequisites check completed"
}

# =============================================================================
# Environment Setup
# =============================================================================

setup_environment() {
    log_info "Setting up environment configuration..."
    
    cd "$PROJECT_ROOT"
    
    # Check for production environment file
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found!"
        log_info "Please create .env.production with all required production values"
        exit 1
    fi
    
    # Copy production env to .env for consistency
    log_info "Setting up production environment..."
    cp .env.production .env
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    # Validate critical environment variables
    local required_vars=(
        "SECRET_KEY"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "GEMINI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Fix frontend environment variables for production
    if [ "$DEPLOY_ENV" = "production" ]; then
        log_info "Updating frontend environment variables for production..."
        
        # Update .env with production frontend URLs
        sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=https://$DOMAIN|g" .env
        
        # Also update any hardcoded localhost references
        if grep -q "localhost" .env; then
            log_warning "Found localhost references in .env file - updating for production"
            sed -i.bak "s|localhost|$DOMAIN|g" .env
        fi
    fi
    
    log_success "Environment setup completed"
}

# =============================================================================
# Create Backup
# =============================================================================

create_backup() {
    if [ "$SKIP_BACKUP" = "true" ]; then
        log_info "Skipping backup (SKIP_BACKUP=true)"
        return 0
    fi
    
    log_info "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if it exists
    if docker ps | grep -q "tidyframe-postgres"; then
        log_info "Backing up database..."
        docker exec tidyframe-postgres-prod pg_dump -U tidyframe tidyframe > "$BACKUP_DIR/database.sql" || {
            log_warning "Database backup failed (container might not be running)"
        }
    fi
    
    # Backup current deployment files
    if [ -d "$PROJECT_ROOT/data" ]; then
        log_info "Backing up data directory..."
        cp -r "$PROJECT_ROOT/data" "$BACKUP_DIR/" || log_warning "Data backup failed"
    fi
    
    # Backup configuration files
    log_info "Backing up configuration..."
    cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/env.backup" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/config" "$BACKUP_DIR/" 2>/dev/null || true
    
    log_success "Backup created at $BACKUP_DIR"
}

# =============================================================================
# Build Frontend
# =============================================================================

build_frontend() {
    log_info "Building frontend for production..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Check if node_modules exists and package.json has changed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm ci --production=false
    fi
    
    # Create production environment file for build
    cat > .env.production << EOF
VITE_API_URL=https://$DOMAIN
VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
NODE_ENV=production
EOF
    
    # Build frontend with production optimizations
    log_info "Building frontend assets..."
    NODE_ENV=production npm run build
    
    # Verify build output
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        log_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    # Calculate build size
    local build_size=$(du -sh dist | cut -f1)
    log_success "Frontend build completed (size: $build_size)"
    
    cd "$PROJECT_ROOT"
}

# =============================================================================
# Initialize Database
# =============================================================================

initialize_database() {
    log_info "Initializing database..."
    
    cd "$PROJECT_ROOT"
    
    # Ensure database directories exist
    mkdir -p "data/postgres" "data/redis"
    
    # Start database services first
    log_info "Starting database services..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    # Wait for PostgreSQL
    wait_for_service "PostgreSQL" "docker exec tidyframe-postgres-prod pg_isready -U tidyframe" 120
    
    # Wait for Redis
    wait_for_service "Redis" "docker exec tidyframe-redis-prod redis-cli -a $REDIS_PASSWORD ping" 60
    
    # Run database migrations if backend supports it
    if [ -f "backend/alembic.ini" ]; then
        log_info "Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head || {
            log_warning "Database migration failed - might be first-time setup"
        }
    fi
    
    log_success "Database initialization completed"
}

# =============================================================================
# Create Admin User
# =============================================================================

create_admin_user() {
    log_info "Setting up admin user..."
    
    # Source production environment to get ADMIN_PASSWORD
    if [ -f ".env.production" ]; then
        source .env.production
    fi
    
    # Check if ADMIN_PASSWORD is set
    if [ -z "$ADMIN_PASSWORD" ]; then
        log_warning "ADMIN_PASSWORD not set in .env.production, skipping admin creation"
        log_info "You can create admin manually with: cd backend && python scripts/setup_admin.py"
        return 0
    fi
    
    # Create admin using the setup_admin.py script
    if [ -f "backend/scripts/setup_admin.py" ]; then
        log_info "Creating admin user with email from environment..."
        docker-compose -f docker-compose.prod.yml exec -T backend python scripts/setup_admin.py || {
            log_warning "Admin user creation failed - user might already exist"
        }
        log_success "Admin setup completed (check logs above for details)"
    else
        log_warning "Admin setup script not found at backend/scripts/setup_admin.py"
    fi
}

# =============================================================================
# Start Docker Services
# =============================================================================

start_docker_services() {
    log_info "Starting Docker services..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images if not forcing rebuild
    if [ "$FORCE_REBUILD" = "true" ]; then
        log_info "Force rebuilding images..."
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        log_info "Building/pulling images..."
        docker-compose -f docker-compose.prod.yml build
    fi
    
    # Start all services
    log_info "Starting all services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for critical services
    wait_for_service "Backend API" "curl -f http://localhost:8000/health" 180
    wait_for_service "Frontend" "curl -f http://localhost:3000" 120
    
    # Start nginx last
    log_info "Starting nginx reverse proxy..."
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    log_success "All Docker services started successfully"
}

# =============================================================================
# Configure SSL
# =============================================================================

configure_ssl() {
    if [ "$SKIP_SSL" = "true" ]; then
        log_info "Skipping SSL configuration (SKIP_SSL=true)"
        return 0
    fi
    
    log_info "Configuring SSL/HTTPS..."
    
    # Run SSL setup script
    if [ -f "$SCRIPT_DIR/setup-ssl.sh" ]; then
        bash "$SCRIPT_DIR/setup-ssl.sh" "$DOMAIN" "$CERTBOT_EMAIL" "$DEPLOY_ENV"
    else
        log_warning "SSL setup script not found, creating basic SSL configuration..."
        
        # Create SSL directory
        mkdir -p "$PROJECT_ROOT/data/ssl"
        
        # Generate self-signed certificate for immediate use
        if [ ! -f "$PROJECT_ROOT/data/ssl/fullchain.pem" ]; then
            log_info "Generating temporary self-signed certificate..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$PROJECT_ROOT/data/ssl/privkey.pem" \
                -out "$PROJECT_ROOT/data/ssl/fullchain.pem" \
                -subj "/C=US/ST=State/L=City/O=TidyFrame/CN=$DOMAIN"
        fi
    fi
    
    log_success "SSL configuration completed"
}

# =============================================================================
# Health Checks & Validation
# =============================================================================

run_health_checks() {
    log_info "Running comprehensive health checks..."
    
    cd "$PROJECT_ROOT"
    local health_check_failed=0
    
    # Check Docker services status with detailed info
    log_info "Checking Docker services..."
    local services=("postgres" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        local service_status=$(docker-compose -f docker-compose.prod.yml ps "$service" 2>/dev/null)
        if echo "$service_status" | grep -q "Up"; then
            log_success "✅ Service $service is running"
            
            # Get additional service info
            local container_name="tidyframe-${service}-prod"
            local uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container_name" 2>/dev/null | head -c 19 || echo "unknown")
            log_info "   Started at: $uptime"
        else
            log_error "❌ Service $service is not running"
            log_error "   Status: $service_status"
            health_check_failed=1
        fi
    done
    
    # Enhanced API Health Check with retries
    log_info "Checking API health..."
    if retry_command 6 5 "curl -f -s -m 10 http://localhost:8000/health"; then
        log_success "✅ API health check passed"
        
        # Check API endpoints
        local api_endpoints=("/docs" "/api/v1/")
        for endpoint in "${api_endpoints[@]}"; do
            if curl -f -s -m 5 "http://localhost:8000$endpoint" > /dev/null; then
                log_success "   ✅ $endpoint accessible"
            else
                log_warning "   ⚠️  $endpoint not accessible"
            fi
        done
        
        # Check API response time
        local response_time=$(curl -w "%{time_total}" -s -o /dev/null -m 10 "http://localhost:8000/health" || echo "timeout")
        log_info "   Response time: ${response_time}s"
    else
        log_error "❌ API health check failed"
        docker logs --tail=20 tidyframe-backend-prod 2>/dev/null || true
        health_check_failed=1
    fi
    
    # Enhanced Frontend Health Check
    log_info "Checking frontend..."
    if retry_command 3 5 "curl -f -s -m 10 http://localhost:3000"; then
        log_success "✅ Frontend health check passed"
        
        # Check if frontend serves static assets
        if curl -f -s -m 5 "http://localhost:3000/static/" > /dev/null 2>&1; then
            log_success "   ✅ Static assets accessible"
        else
            log_info "   ℹ️  Static assets check skipped (may be normal)"
        fi
    else
        log_warning "⚠️  Frontend health check failed"
        docker logs --tail=10 tidyframe-frontend-prod 2>/dev/null || true
    fi
    
    # Enhanced Database connectivity with performance check
    log_info "Checking database connectivity..."
    if docker exec tidyframe-postgres-prod pg_isready -U tidyframe > /dev/null 2>&1; then
        log_success "✅ Database connectivity check passed"
        
        # Check database version and basic query
        local db_version=$(docker exec tidyframe-postgres-prod psql -U tidyframe -t -c "SELECT version();" 2>/dev/null | head -n1 | xargs || echo "unknown")
        log_info "   Database version: ${db_version:0:50}..."
        
        # Check database size
        local db_size=$(docker exec tidyframe-postgres-prod psql -U tidyframe -t -c "SELECT pg_size_pretty(pg_database_size('tidyframe'));" 2>/dev/null | xargs || echo "unknown")
        log_info "   Database size: $db_size"
        
        # Test basic query performance
        local query_time=$(docker exec tidyframe-postgres-prod psql -U tidyframe -c "SELECT 1;" 2>/dev/null | grep "Time:" | awk '{print $2}' || echo "unknown")
        log_info "   Query response time: ${query_time}ms"
    else
        log_error "❌ Database connectivity check failed"
        docker logs --tail=10 tidyframe-postgres-prod 2>/dev/null || true
        health_check_failed=1
    fi
    
    # Enhanced Redis connectivity with info
    log_info "Checking Redis connectivity..."
    if docker exec tidyframe-redis-prod redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
        log_success "✅ Redis connectivity check passed"
        
        # Get Redis info
        local redis_version=$(docker exec tidyframe-redis-prod redis-cli -a "$REDIS_PASSWORD" info server 2>/dev/null | grep "redis_version:" | cut -d: -f2 | tr -d '\r' || echo "unknown")
        log_info "   Redis version: $redis_version"
        
        local redis_memory=$(docker exec tidyframe-redis-prod redis-cli -a "$REDIS_PASSWORD" info memory 2>/dev/null | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r' || echo "unknown")
        log_info "   Memory usage: $redis_memory"
        
        local redis_keys=$(docker exec tidyframe-redis-prod redis-cli -a "$REDIS_PASSWORD" dbsize 2>/dev/null || echo "unknown")
        log_info "   Keys count: $redis_keys"
    else
        log_error "❌ Redis connectivity check failed"
        docker logs --tail=10 tidyframe-redis-prod 2>/dev/null || true
        health_check_failed=1
    fi
    
    # Enhanced SSL certificate check
    if [ "$SKIP_SSL" = "false" ]; then
        log_info "Checking SSL configuration..."
        if [ -f "$PROJECT_ROOT/data/ssl/fullchain.pem" ]; then
            local cert_info=$(openssl x509 -in "$PROJECT_ROOT/data/ssl/fullchain.pem" -text -noout 2>/dev/null)
            local cert_expiry=$(echo "$cert_info" | grep "Not After" | cut -d: -f2- | xargs || echo "unknown")
            local cert_issuer=$(echo "$cert_info" | grep "Issuer:" | cut -d= -f2- | xargs || echo "unknown")
            
            log_success "✅ SSL certificate found"
            log_info "   Expires: $cert_expiry"
            log_info "   Issuer: $cert_issuer"
            
            # Check certificate validity period (warn if expires within 30 days)
            if command -v date &>/dev/null; then
                local expiry_epoch=$(date -d "$cert_expiry" +%s 2>/dev/null || echo "0")
                local current_epoch=$(date +%s)
                local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
                
                if [ $days_until_expiry -lt 30 ] && [ $days_until_expiry -gt 0 ]; then
                    log_warning "   ⚠️  Certificate expires in $days_until_expiry days"
                elif [ $days_until_expiry -le 0 ]; then
                    log_error "   ❌ Certificate has expired!"
                    health_check_failed=1
                else
                    log_success "   ✅ Certificate valid for $days_until_expiry days"
                fi
            fi
        else
            log_warning "⚠️  SSL certificate not found at $PROJECT_ROOT/data/ssl/fullchain.pem"
        fi
    else
        log_info "SSL check skipped (SKIP_SSL=true)"
    fi
    
    # System resource check
    log_info "Checking system resources..."
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3/$2*100}')
    
    if [ "$disk_usage" -gt 90 ]; then
        log_warning "⚠️  High disk usage: ${disk_usage}%"
    else
        log_success "✅ Disk usage: ${disk_usage}%"
    fi
    
    if [ "$(echo "$memory_usage > 90" | bc 2>/dev/null || echo 0)" -eq 1 ]; then
        log_warning "⚠️  High memory usage: ${memory_usage}%"
    else
        log_success "✅ Memory usage: ${memory_usage}%"
    fi
    
    # Final health check result
    if [ $health_check_failed -eq 0 ]; then
        log_success "🎉 All critical health checks passed"
        return 0
    else
        log_error "💥 Some health checks failed"
        return 1
    fi
}

# =============================================================================
# Generate Deployment Report
# =============================================================================

generate_deployment_report() {
    local report_file="$PROJECT_ROOT/logs/deployment-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# TidyFrame Deployment Report

**Deployment Date:** $(date)  
**Environment:** $DEPLOY_ENV  
**Domain:** $DOMAIN  
**Deployed By:** $(whoami)  
**Server:** $(hostname)  

## Services Status

\`\`\`
$(docker-compose -f docker-compose.prod.yml ps)
\`\`\`

## System Resources

**Disk Usage:**
\`\`\`
$(df -h $PROJECT_ROOT)
\`\`\`

**Memory Usage:**
\`\`\`
$(free -h)
\`\`\`

**Docker Images:**
\`\`\`
$(docker images | grep tidyframe)
\`\`\`

## Configuration Summary

- **Domain:** $DOMAIN
- **SSL Configured:** $([ "$SKIP_SSL" = "false" ] && echo "Yes" || echo "No")
- **Database:** PostgreSQL $(docker exec tidyframe-postgres-prod psql -U tidyframe -c "SELECT version();" | head -3 | tail -1 || echo "N/A")
- **Redis:** $(docker exec tidyframe-redis-prod redis-cli -a "$REDIS_PASSWORD" info server | grep redis_version || echo "N/A")

## Access URLs

- **Frontend:** https://$DOMAIN
- **API:** https://$DOMAIN/api
- **Health Check:** https://$DOMAIN/health
- **Admin:** https://$DOMAIN/admin

## Post-Deployment Steps

1. Verify all services are running: \`docker-compose -f docker-compose.prod.yml ps\`
2. Check logs for any errors: \`docker-compose -f docker-compose.prod.yml logs\`
3. Test API endpoints: \`curl https://$DOMAIN/health\`
4. Monitor application metrics and logs

## Backup Information

- **Backup Location:** $BACKUP_DIR
- **Backup Created:** $([ "$SKIP_BACKUP" = "false" ] && echo "Yes" || echo "No")

EOF

    log_info "Deployment report generated: $report_file"
}

# =============================================================================
# Cleanup Function
# =============================================================================

cleanup() {
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        log_error "Deployment failed with exit code $exit_code"
        
        # Create failure report
        local failure_report="$PROJECT_ROOT/logs/deployment-failure-$(date +%Y%m%d_%H%M%S).log"
        
        {
            echo "=== DEPLOYMENT FAILURE REPORT ==="
            echo "Timestamp: $(date)"
            echo "Exit Code: $exit_code"
            echo "Domain: $DOMAIN"
            echo "Environment: $DEPLOY_ENV"
            echo ""
            echo "=== DOCKER SERVICES STATUS ==="
            docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Docker Compose not available"
            echo ""
            echo "=== RECENT LOGS ==="
            docker-compose -f docker-compose.prod.yml logs --tail=100 2>/dev/null || echo "No logs available"
            echo ""
            echo "=== SYSTEM RESOURCES ==="
            free -h
            df -h "$PROJECT_ROOT"
            echo ""
            echo "=== ENVIRONMENT VARIABLES ==="
            env | grep -E "^(DOMAIN|DEPLOY_ENV|SKIP_|FORCE_)" | sort
        } > "$failure_report"
        
        log_error "Failure report created: $failure_report"
        
        # Show recent logs on failure
        if command -v docker-compose &> /dev/null; then
            log_info "Recent service logs:"
            docker-compose -f docker-compose.prod.yml logs --tail=50 2>/dev/null || true
        fi
        
        log_info "Full deployment log available at: $DEPLOY_LOG"
        
        # Offer rollback option
        echo ""
        log_warning "Deployment failed. Would you like to attempt automatic rollback? [y/N]"
        read -t 30 -r response || response="n"
        if [[ "$response" =~ ^[Yy]$ ]]; then
            perform_rollback
        else
            log_info "Rollback skipped. Manual recovery may be required."
            log_info "Use: docker-compose -f docker-compose.prod.yml down"
            log_info "Then restore from backup: $BACKUP_DIR"
        fi
    fi
}

perform_rollback() {
    log_info "Attempting automatic rollback..."
    
    # Stop failed services
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Restore from backup if available
    if [ -d "$BACKUP_DIR" ] && [ "$SKIP_BACKUP" = "false" ]; then
        log_info "Restoring from backup: $BACKUP_DIR"
        
        # Restore database if backup exists
        if [ -f "$BACKUP_DIR/database.sql" ]; then
            log_info "Restoring database..."
            docker-compose -f docker-compose.prod.yml up -d postgres
            sleep 30
            docker exec -i tidyframe-postgres-prod psql -U tidyframe -d tidyframe < "$BACKUP_DIR/database.sql" 2>/dev/null || {
                log_warning "Database restore failed"
            }
        fi
        
        # Restore configuration
        if [ -f "$BACKUP_DIR/env.backup" ]; then
            log_info "Restoring configuration..."
            cp "$BACKUP_DIR/env.backup" .env
        fi
        
        # Restore data directory
        if [ -d "$BACKUP_DIR/data" ]; then
            log_info "Restoring data..."
            rsync -av "$BACKUP_DIR/data/" data/ 2>/dev/null || {
                log_warning "Data restore failed"
            }
        fi
        
        log_success "Rollback completed"
    else
        log_warning "No backup available for rollback"
    fi
}

# =============================================================================
# Main Deployment Function
# =============================================================================

main() {
    # Set up trap for cleanup
    trap cleanup EXIT
    
    print_banner
    
    local start_time=$(date +%s)
    
    # Execute deployment steps
    check_prerequisites
    setup_environment
    create_backup
    build_frontend
    initialize_database
    start_docker_services
    create_admin_user
    configure_ssl
    run_health_checks
    generate_deployment_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "🎉 Deployment completed successfully in ${duration}s"
    
    echo -e "${GREEN}"
    echo "================================================================="
    echo "  TidyFrame is now deployed and running!"
    echo ""
    echo "  🌐 Frontend: https://$DOMAIN"
    echo "  🔧 API: https://$DOMAIN/api"
    echo "  ❤️  Health: https://$DOMAIN/health"
    echo "  👑 Admin: https://$DOMAIN/admin"
    echo ""
    echo "  📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  📋 Service status: docker-compose -f docker-compose.prod.yml ps"
    echo "  🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "  📝 Deployment log: $DEPLOY_LOG"
    echo "================================================================="
    echo -e "${NC}"
}

# =============================================================================
# Script Entry Point
# =============================================================================

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            CERTBOT_EMAIL="$2"
            shift 2
            ;;
        --env)
            DEPLOY_ENV="$2"
            shift 2
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force-rebuild)
            FORCE_REBUILD=true
            shift
            ;;
        --help)
            echo "TidyFrame Production Deployment Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --domain DOMAIN          Set domain name (default: tidyframe.com)"
            echo "  --email EMAIL            Set certbot email (default: tidyframeai@gmail.com)"
            echo "  --env ENV               Set environment (default: production)"
            echo "  --skip-ssl              Skip SSL configuration"
            echo "  --skip-backup           Skip backup creation"
            echo "  --force-rebuild         Force rebuild Docker images"
            echo "  --help                  Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  DOMAIN                  Domain name"
            echo "  CERTBOT_EMAIL           Email for Let's Encrypt"
            echo "  DEPLOY_ENV              Deployment environment"
            echo "  SKIP_SSL                Skip SSL setup (true/false)"
            echo "  SKIP_BACKUP             Skip backup (true/false)"
            echo "  FORCE_REBUILD           Force image rebuild (true/false)"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Full deployment with defaults"
            echo "  $0 --domain example.com --email admin@example.com"
            echo "  $0 --skip-ssl --skip-backup          # Quick deployment without SSL/backup"
            echo "  $0 --force-rebuild                   # Rebuild all images"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main