#!/bin/bash

# FlowGrid AWS Deployment Script
# This script should be run on your EC2 instance

set -e

echo "🚀 Starting FlowGrid deployment..."

# Configuration
APP_DIR="$HOME/flowgrid"
REPO_URL="https://github.com/vikas-aneesh-reddy-k/flowgrid.git"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop existing services
echo -e "${YELLOW}Stopping existing services...${NC}"
pm2 stop flowgrid-backend || true

# Update code
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Updating existing repository...${NC}"
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci

cd server
npm ci
cd ..

# Build applications
echo -e "${YELLOW}Building applications...${NC}"

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create production env file
cat > .env.production << EOF
VITE_API_URL=http://${EC2_IP}/api
EOF

npm run build

cd server
npm run build
cd ..

# Setup environment if not exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}Creating environment file...${NC}"
    cat > server/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
CORS_ORIGIN=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF
fi

# Seed database (only on first run)
if ! mongo flowgrid --eval "db.users.findOne()" > /dev/null 2>&1; then
    echo -e "${YELLOW}Seeding database...${NC}"
    cd server
    npm run seed || true
    cd ..
fi

# Deploy frontend
echo -e "${YELLOW}Deploying frontend...${NC}"
sudo mkdir -p /var/www/flowgrid
sudo cp -r dist/* /var/www/flowgrid/
sudo chown -R www-data:www-data /var/www/flowgrid

# Start backend
echo -e "${YELLOW}Starting backend service...${NC}"
cd server
pm2 start dist/index.js --name flowgrid-backend || pm2 restart flowgrid-backend
pm2 save
cd ..

# Show status
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Backend status:"
pm2 status flowgrid-backend
echo ""
echo "Access your application at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
