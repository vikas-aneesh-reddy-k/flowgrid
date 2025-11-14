#!/bin/bash

# FlowGrid Deployment Script for EC2
# This script should be run on your EC2 instance

set -e

echo "🚀 Starting FlowGrid deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/flowgrid"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR || exit 1

echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}🐳 Pulling latest Docker images...${NC}"
docker-compose pull

echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker-compose down

echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -af

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)${NC}"
