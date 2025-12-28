#!/bin/bash

# Complete EC2 Deployment Fix Script
set -e

EC2_HOST="13.62.224.81"
EC2_USER="ubuntu"
PEM_FILE="flowgrid-key.pem"

echo "🔧 Fixing EC2 Deployment Issues..."

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file $PEM_FILE not found!"
    exit 1
fi

chmod 400 "$PEM_FILE"

echo "📦 Copying deployment files to EC2..."

# Copy all necessary files
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker-compose.yml "$EC2_USER@$EC2_HOST:/home/ubuntu/"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    .env.production "$EC2_USER@$EC2_HOST:/home/ubuntu/.env"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker/nginx.conf "$EC2_USER@$EC2_HOST:/home/ubuntu/"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker/mongo-init.js "$EC2_USER@$EC2_HOST:/home/ubuntu/"

echo "🚀 Deploying on EC2..."

ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    
    echo "Setting up directories..."
    mkdir -p /home/ubuntu/docker
    
    # Move files to correct locations
    mv /home/ubuntu/nginx.conf /home/ubuntu/docker/ 2>/dev/null || true
    mv /home/ubuntu/mongo-init.js /home/ubuntu/docker/ 2>/dev/null || true
    
    echo "Stopping existing containers..."
    docker-compose down || true
    
    echo "Removing old volumes..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    echo "Pulling latest images..."
    docker pull vikaskakarla/flowgrid-frontend:latest
    docker pull vikaskakarla/flowgrid-backend:latest
    
    echo "Starting services..."
    docker-compose up -d
    
    echo "Waiting for services to start..."
    sleep 15
    
    echo "Container status:"
    docker-compose ps
    
    echo ""
    echo "Backend logs:"
    docker-compose logs backend --tail=30
    
    echo ""
    echo "MongoDB logs:"
    docker-compose logs mongodb --tail=20
    
    echo ""
    echo "Checking if backend is responding..."
    curl -s http://localhost:5000/health || echo "Backend not responding yet"
    
    echo ""
    echo "✅ Deployment completed!"
ENDSSH

echo ""
echo "🏥 Running health checks..."
sleep 5

# Check frontend
if curl -f "http://$EC2_HOST" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible at http://$EC2_HOST"
else
    echo "❌ Frontend is not accessible"
fi

# Check backend (internal)
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" \
    'curl -s http://localhost:5000/health' && echo "✅ Backend is running internally" || echo "⚠️ Backend health check failed"

echo ""
echo "📋 Summary:"
echo "Frontend: http://$EC2_HOST"
echo "Backend API: http://$EC2_HOST:5000 (needs security group port 5000 open)"
echo ""
echo "To check logs:"
echo "ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'docker-compose logs -f'"
