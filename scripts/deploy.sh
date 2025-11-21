#!/bin/bash

# Deployment script for EC2
set -e

EC2_HOST="13.53.86.36"
EC2_USER="ubuntu"
PEM_FILE="flowgrid-key.pem"

echo "🚀 Starting deployment to EC2..."

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file $PEM_FILE not found!"
    exit 1
fi

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

echo "📦 Copying files to EC2..."

# Copy deployment files
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker-compose.yml "$EC2_USER@$EC2_HOST:/home/ubuntu/"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    .env.production "$EC2_USER@$EC2_HOST:/home/ubuntu/.env"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker/nginx.conf "$EC2_USER@$EC2_HOST:/home/ubuntu/"

scp -i "$PEM_FILE" -o StrictHostKeyChecking=no \
    docker/mongo-init.js "$EC2_USER@$EC2_HOST:/home/ubuntu/"

echo "🔧 Setting up EC2 environment..."

# Execute deployment commands on EC2
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'EOF'
    # Update system
    sudo apt-get update -y

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker ubuntu
        rm get-docker.sh
    fi

    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi

    # Create necessary directories
    mkdir -p /home/ubuntu/docker

    # Move files to correct locations
    mv /home/ubuntu/nginx.conf /home/ubuntu/docker/ 2>/dev/null || true
    mv /home/ubuntu/mongo-init.js /home/ubuntu/docker/ 2>/dev/null || true

    # Stop existing containers
    docker-compose down 2>/dev/null || true

    # Pull latest images
    docker-compose pull

    # Start services
    docker-compose up -d

    # Wait for services to start
    echo "Waiting for services to start..."
    sleep 30

    # Check if services are running
    docker-compose ps

    echo "✅ Deployment completed successfully!"
EOF

echo "🏥 Running health checks..."

# Wait a bit more for services to fully initialize
sleep 10

# Health check
if curl -f "http://$EC2_HOST" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend health check failed"
fi

if curl -f "http://$EC2_HOST:5000/health" > /dev/null 2>&1; then
    echo "✅ Backend API is accessible"
else
    echo "❌ Backend health check failed"
fi

echo "🎉 Deployment process completed!"
echo "🌐 Frontend: http://$EC2_HOST"
echo "🔗 Backend API: http://$EC2_HOST:5000"