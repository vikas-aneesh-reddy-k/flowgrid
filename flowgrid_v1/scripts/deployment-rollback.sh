#!/bin/bash

# Deployment Rollback Script for FlowGrid
# This script handles rollback to previous version in case of deployment failure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/home/ubuntu/app"
BACKUP_DIR="/home/ubuntu/backups"
LOG_FILE="/var/log/flowgrid-rollback.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if services are healthy
check_health() {
    local max_attempts=30
    local attempt=1
    
    log "Checking application health..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            log "Application is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, waiting..."
        sleep 10
        ((attempt++))
    done
    
    error "Application health check failed after $max_attempts attempts"
    return 1
}

# Function to create backup before rollback
create_backup() {
    log "Creating backup before rollback..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/rollback_backup_$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Backup current docker-compose.yml and .env
    cp "$APP_DIR/docker-compose.yml" "$backup_path/" 2>/dev/null || true
    cp "$APP_DIR/.env" "$backup_path/" 2>/dev/null || true
    
    # Backup database
    if docker ps | grep -q mongodb; then
        log "Backing up MongoDB database..."
        docker exec mongodb mongodump --out "/tmp/rollback_backup_$backup_timestamp" || warning "Database backup failed"
        docker cp mongodb:"/tmp/rollback_backup_$backup_timestamp" "$backup_path/mongodb_backup" || warning "Failed to copy database backup"
    fi
    
    # Get current image tags
    docker images --format "table {{.Repository}}:{{.Tag}}" | grep flowgrid > "$backup_path/current_images.txt" || true
    
    log "Backup created at $backup_path"
    echo "$backup_path"
}

# Function to rollback to previous version
rollback_to_previous() {
    local previous_version="$1"
    
    if [ -z "$previous_version" ]; then
        error "No previous version specified"
        return 1
    fi
    
    log "Rolling back to version: $previous_version"
    
    cd "$APP_DIR"
    
    # Update image tags in docker-compose.yml
    sed -i "s|vikaskakarla/flowgrid-frontend:latest|vikaskakarla/flowgrid-frontend:$previous_version|g" docker-compose.yml
    sed -i "s|vikaskakarla/flowgrid-backend:latest|vikaskakarla/flowgrid-backend:$previous_version|g" docker-compose.yml
    
    # Pull the previous version images
    log "Pulling previous version images..."
    docker pull "vikaskakarla/flowgrid-frontend:$previous_version" || {
        error "Failed to pull frontend image version $previous_version"
        return 1
    }
    
    docker pull "vikaskakarla/flowgrid-backend:$previous_version" || {
        error "Failed to pull backend image version $previous_version"
        return 1
    }
    
    # Stop current services
    log "Stopping current services..."
    docker-compose down --timeout 30
    
    # Start services with previous version
    log "Starting services with previous version..."
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Check health
    if check_health; then
        log "Rollback completed successfully"
        return 0
    else
        error "Rollback failed - services are not healthy"
        return 1
    fi
}

# Function to list available versions
list_versions() {
    log "Available versions for rollback:"
    
    echo "Frontend versions:"
    curl -s "https://registry.hub.docker.com/v2/repositories/vikaskakarla/flowgrid-frontend/tags/" | \
        jq -r '.results[].name' | head -10 || echo "Unable to fetch frontend versions"
    
    echo ""
    echo "Backend versions:"
    curl -s "https://registry.hub.docker.com/v2/repositories/vikaskakarla/flowgrid-backend/tags/" | \
        jq -r '.results[].name' | head -10 || echo "Unable to fetch backend versions"
}

# Function to rollback database
rollback_database() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ] || [ ! -d "$backup_path" ]; then
        error "Invalid backup path: $backup_path"
        return 1
    fi
    
    log "Rolling back database from backup: $backup_path"
    
    if [ -d "$backup_path/mongodb_backup" ]; then
        # Copy backup to container
        docker cp "$backup_path/mongodb_backup" mongodb:/tmp/restore_backup
        
        # Restore database
        docker exec mongodb mongorestore --drop /tmp/restore_backup || {
            error "Database rollback failed"
            return 1
        }
        
        log "Database rollback completed"
    else
        warning "No database backup found in $backup_path"
    fi
}

# Function to perform emergency rollback
emergency_rollback() {
    log "Performing emergency rollback..."
    
    # Find the most recent backup
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -1)
    
    if [ -z "$latest_backup" ]; then
        error "No backups found for emergency rollback"
        return 1
    fi
    
    local backup_path="$BACKUP_DIR/$latest_backup"
    log "Using backup: $backup_path"
    
    cd "$APP_DIR"
    
    # Stop all services
    docker-compose down --timeout 30
    
    # Restore configuration files
    if [ -f "$backup_path/docker-compose.yml" ]; then
        cp "$backup_path/docker-compose.yml" "$APP_DIR/"
        log "Restored docker-compose.yml"
    fi
    
    if [ -f "$backup_path/.env" ]; then
        cp "$backup_path/.env" "$APP_DIR/"
        log "Restored .env file"
    fi
    
    # Start services
    docker-compose up -d
    
    # Restore database if backup exists
    rollback_database "$backup_path"
    
    # Check health
    if check_health; then
        log "Emergency rollback completed successfully"
        return 0
    else
        error "Emergency rollback failed"
        return 1
    fi
}

# Function to show rollback status
show_status() {
    log "Current deployment status:"
    
    echo "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Service health:"
    echo -n "Frontend: "
    if curl -f -s http://localhost/ > /dev/null 2>&1; then
        echo -e "${GREEN}Healthy${NC}"
    else
        echo -e "${RED}Unhealthy${NC}"
    fi
    
    echo -n "Backend: "
    if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}Healthy${NC}"
    else
        echo -e "${RED}Unhealthy${NC}"
    fi
    
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_DIR" 2>/dev/null || echo "No backups found"
}

# Main script logic
main() {
    case "$1" in
        "rollback")
            if [ -z "$2" ]; then
                error "Please specify version to rollback to"
                echo "Usage: $0 rollback <version>"
                exit 1
            fi
            create_backup
            rollback_to_previous "$2"
            ;;
        "emergency")
            emergency_rollback
            ;;
        "list")
            list_versions
            ;;
        "status")
            show_status
            ;;
        "database")
            if [ -z "$2" ]; then
                error "Please specify backup path"
                echo "Usage: $0 database <backup_path>"
                exit 1
            fi
            rollback_database "$2"
            ;;
        *)
            echo "FlowGrid Deployment Rollback Script"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  rollback <version>    Rollback to specific version"
            echo "  emergency            Perform emergency rollback to latest backup"
            echo "  list                 List available versions"
            echo "  status               Show current deployment status"
            echo "  database <path>      Rollback database from backup path"
            echo ""
            echo "Examples:"
            echo "  $0 rollback v1.2.3"
            echo "  $0 emergency"
            echo "  $0 list"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@"