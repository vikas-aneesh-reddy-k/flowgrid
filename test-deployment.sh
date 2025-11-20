#!/bin/bash

# Test Deployment Script
# Verifies that all components are working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo "🧪 Testing FlowGrid Deployment"
echo "=============================="
echo ""

# Get EC2 IP
if [ -f /home/ubuntu/flowgrid/.env ]; then
    EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
else
    EC2_IP="localhost"
fi

print_info "Testing on: $EC2_IP"
echo ""

# Test 1: Docker
print_info "Test 1: Checking Docker..."
if command -v docker &> /dev/null; then
    print_success "Docker is installed"
    docker --version
else
    print_error "Docker is not installed"
    exit 1
fi
echo ""

# Test 2: Docker Compose
print_info "Test 2: Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose is installed"
    docker-compose --version
else
    print_error "Docker Compose is not installed"
    exit 1
fi
echo ""

# Test 3: Containers Running
print_info "Test 3: Checking containers..."
CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")

if echo "$CONTAINERS" | grep -q "flowgrid-backend"; then
    print_success "Backend container is running"
else
    print_error "Backend container is not running"
fi

if echo "$CONTAINERS" | grep -q "flowgrid-frontend"; then
    print_success "Frontend container is running"
else
    print_error "Frontend container is not running"
fi

if echo "$CONTAINERS" | grep -q "flowgrid-mongodb"; then
    print_success "MongoDB container is running"
else
    print_error "MongoDB container is not running"
fi
echo ""

# Test 4: Backend Health
print_info "Test 4: Testing backend health..."
if curl -f -s http://localhost:5000/api/health > /dev/null 2>&1; then
    print_success "Backend health check passed"
    curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health
else
    print_error "Backend health check failed"
fi
echo ""

# Test 5: Frontend Health
print_info "Test 5: Testing frontend..."
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    print_success "Frontend health check passed"
else
    print_error "Frontend health check failed"
fi
echo ""

# Test 6: Database Connection
print_info "Test 6: Testing database connection..."
if docker exec flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
fi
echo ""

# Test 7: API Endpoints
print_info "Test 7: Testing API endpoints..."

# Test products endpoint
if curl -f -s http://localhost:5000/api/products > /dev/null 2>&1; then
    print_success "Products API working"
else
    print_error "Products API failed"
fi

# Test customers endpoint
if curl -f -s http://localhost:5000/api/customers > /dev/null 2>&1; then
    print_success "Customers API working"
else
    print_error "Customers API failed"
fi

# Test orders endpoint
if curl -f -s http://localhost:5000/api/orders > /dev/null 2>&1; then
    print_success "Orders API working"
else
    print_error "Orders API failed"
fi
echo ""

# Test 8: Database Collections
print_info "Test 8: Checking database collections..."
COLLECTIONS=$(docker exec flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin flowgrid --quiet --eval "db.getCollectionNames()" 2>/dev/null || echo "[]")

if echo "$COLLECTIONS" | grep -q "users"; then
    print_success "Users collection exists"
else
    print_error "Users collection missing"
fi

if echo "$COLLECTIONS" | grep -q "products"; then
    print_success "Products collection exists"
else
    print_error "Products collection missing"
fi
echo ""

# Test 9: Resource Usage
print_info "Test 9: Checking resource usage..."
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

# Test 10: Network Connectivity
print_info "Test 10: Testing network connectivity..."
if docker network inspect flowgrid_flowgrid-network > /dev/null 2>&1; then
    print_success "Docker network exists"
    NETWORK_CONTAINERS=$(docker network inspect flowgrid_flowgrid-network --format '{{range .Containers}}{{.Name}} {{end}}')
    echo "   Connected containers: $NETWORK_CONTAINERS"
else
    print_error "Docker network not found"
fi
echo ""

# Test 11: Jenkins (if installed)
print_info "Test 11: Checking Jenkins..."
if command -v jenkins &> /dev/null || sudo systemctl is-active jenkins > /dev/null 2>&1; then
    print_success "Jenkins is installed and running"
    if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
        print_success "Jenkins web interface is accessible"
    else
        print_error "Jenkins web interface is not accessible"
    fi
else
    print_info "Jenkins is not installed (optional)"
fi
echo ""

# Summary
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo ""

# Count running containers
RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" | wc -l)
echo "Running Containers: $RUNNING_CONTAINERS"

# Check if all critical services are up
if docker ps --format "{{.Names}}" | grep -q "flowgrid-backend" && \
   docker ps --format "{{.Names}}" | grep -q "flowgrid-frontend" && \
   docker ps --format "{{.Names}}" | grep -q "flowgrid-mongodb"; then
    echo ""
    print_success "All critical services are running!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://${EC2_IP}"
    echo "   API: http://${EC2_IP}/api"
    echo "   Health: http://${EC2_IP}/api/health"
    if command -v jenkins &> /dev/null || sudo systemctl is-active jenkins > /dev/null 2>&1; then
        echo "   Jenkins: http://${EC2_IP}:8080"
    fi
else
    echo ""
    print_error "Some services are not running!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check logs: docker-compose logs -f"
    echo "   2. Restart services: docker-compose restart"
    echo "   3. Rebuild: docker-compose up --build -d"
fi

echo ""
echo "=============================="
