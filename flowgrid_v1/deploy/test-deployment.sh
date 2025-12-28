#!/bin/bash
# Test deployment script
# Run this on EC2 to verify everything is working

set -e

echo "🧪 Testing FlowGrid Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $EC2_IP"
echo ""

# Test 1: Docker is running
echo -n "1. Docker service... "
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    exit 1
fi

# Test 2: Containers are running
echo -n "2. Docker containers... "
RUNNING=$(docker compose ps --services --filter "status=running" | wc -l)
if [ "$RUNNING" -eq 3 ]; then
    echo -e "${GREEN}✓ All 3 containers running${NC}"
else
    echo -e "${RED}✗ Only $RUNNING/3 containers running${NC}"
    docker compose ps
fi

# Test 3: MongoDB health
echo -n "3. MongoDB... "
if docker compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

# Test 4: Backend health
echo -n "4. Backend API... "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$BACKEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Healthy (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Not responding (HTTP $BACKEND_STATUS)${NC}"
fi

# Test 5: Frontend
echo -n "5. Frontend... "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Healthy (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Not responding (HTTP $FRONTEND_STATUS)${NC}"
fi

# Test 6: MongoDB external access
echo -n "6. MongoDB external access... "
if nc -z -w5 $EC2_IP 27017 2>/dev/null; then
    echo -e "${GREEN}✓ Port 27017 accessible${NC}"
else
    echo -e "${YELLOW}⚠ Port 27017 not accessible (check Security Group)${NC}"
fi

# Test 7: Environment variables
echo -n "7. Environment config... "
if [ -f .env ]; then
    if grep -q "YOUR_EC2_PUBLIC_IP" .env; then
        echo -e "${YELLOW}⚠ .env still has placeholder IP${NC}"
    else
        echo -e "${GREEN}✓ Configured${NC}"
    fi
else
    echo -e "${RED}✗ .env file missing${NC}"
fi

echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend:  http://$EC2_IP"
echo "Backend:   http://$EC2_IP:5000/health"
echo "MongoDB:   mongodb://admin:PASSWORD@$EC2_IP:27017/flowgrid?authSource=admin"
echo ""
echo "View logs:    docker compose logs -f"
echo "Restart:      docker compose restart"
echo "Stop:         docker compose down"
echo "Start:        docker compose up -d"
echo ""

# Show container status
echo "Container Status:"
docker compose ps
