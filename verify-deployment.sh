#!/bin/bash

#############################################
# Deployment Verification Script
# Tests all endpoints and services
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get EC2 IP
if [ -z "$1" ]; then
    echo "Usage: ./verify-deployment.sh YOUR_EC2_IP"
    echo "Example: ./verify-deployment.sh 54.123.45.67"
    exit 1
fi

EC2_IP=$1
BASE_URL="http://${EC2_IP}"
API_URL="${BASE_URL}/api"

echo "============================================"
echo "FlowGrid Deployment Verification"
echo "============================================"
echo "Testing: $BASE_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_code)"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "  Response: $response"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Response: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "============================================"
echo "1. Basic Connectivity Tests"
echo "============================================"
echo ""

# Test if server is reachable
test_endpoint "Server Reachability" "$BASE_URL" 200

# Test health endpoint
test_json_endpoint "Health Check" "${BASE_URL}/health" "healthy"

# Test API health
test_json_endpoint "API Health Check" "${API_URL}/health" "healthy"

echo ""
echo "============================================"
echo "2. Frontend Tests"
echo "============================================"
echo ""

# Test frontend loads
test_endpoint "Frontend Homepage" "$BASE_URL" 200

# Test static assets
test_endpoint "Frontend Assets" "${BASE_URL}/assets" 200 || true

echo ""
echo "============================================"
echo "3. Backend API Tests"
echo "============================================"
echo ""

# Test auth endpoints
echo -n "Testing Login Endpoint... "
login_response=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@flowgrid.com","password":"admin123"}' 2>/dev/null)

if echo "$login_response" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC}"
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token received: ${TOKEN:0:20}..."
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Response: $login_response"
    ((TESTS_FAILED++))
    TOKEN=""
fi

# Test protected endpoints with token
if [ -n "$TOKEN" ]; then
    echo ""
    echo "Testing Protected Endpoints (with auth):"
    echo ""
    
    # Test products endpoint
    echo -n "Testing Products API... "
    products_response=$(curl -s "${API_URL}/products" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if echo "$products_response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Response: $products_response"
        ((TESTS_FAILED++))
    fi
    
    # Test customers endpoint
    echo -n "Testing Customers API... "
    customers_response=$(curl -s "${API_URL}/customers" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if echo "$customers_response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Test orders endpoint
    echo -n "Testing Orders API... "
    orders_response=$(curl -s "${API_URL}/orders" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if echo "$orders_response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Test employees endpoint
    echo -n "Testing Employees API... "
    employees_response=$(curl -s "${API_URL}/employees" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if echo "$employees_response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Test dashboard endpoint
    echo -n "Testing Dashboard API... "
    dashboard_response=$(curl -s "${API_URL}/dashboard/stats" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    
    if echo "$dashboard_response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
fi

echo ""
echo "============================================"
echo "4. Database Tests"
echo "============================================"
echo ""

# Test if MongoDB is accessible through API
echo -n "Testing MongoDB Connection... "
health_response=$(curl -s "${API_URL}/health" 2>/dev/null)

if echo "$health_response" | grep -q '"database":"connected"'; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  Database: Connected"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Response: $health_response"
    ((TESTS_FAILED++))
fi

echo ""
echo "============================================"
echo "5. Performance Tests"
echo "============================================"
echo ""

# Test response time
echo -n "Testing Response Time... "
start_time=$(date +%s%N)
curl -s "$BASE_URL" > /dev/null 2>&1
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 2000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${response_time}ms)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time}ms)"
    ((TESTS_FAILED++))
fi

echo ""
echo "============================================"
echo "Test Summary"
echo "============================================"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "Your application is fully functional!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: $BASE_URL"
    echo "   Backend API: $API_URL"
    echo ""
    echo "👤 Demo Login:"
    echo "   Email: admin@flowgrid.com"
    echo "   Password: admin123"
    echo ""
    exit 0
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo "Please check the following:"
    echo "  1. All services are running"
    echo "  2. MongoDB is connected"
    echo "  3. Environment variables are correct"
    echo "  4. Nginx configuration is correct"
    echo ""
    echo "For troubleshooting, SSH into EC2 and run:"
    echo "  pm2 logs flowgrid-backend"
    echo "  sudo systemctl status mongod"
    echo "  sudo systemctl status nginx"
    echo ""
    exit 1
fi
