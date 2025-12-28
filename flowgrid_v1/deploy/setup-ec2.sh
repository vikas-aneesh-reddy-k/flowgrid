#!/bin/bash
# EC2 Initial Setup Script
# Run this ONCE on your EC2 instance after launching it

set -e

echo "🚀 Setting up EC2 instance for FlowGrid deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/flowgrid
cd /home/ubuntu/flowgrid

# Create .env file
echo "📝 Creating environment file..."
cat > .env << 'EOF'
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=FlowGrid2024SecurePassword!

# JWT Configuration
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!

# Node Environment
NODE_ENV=production

# CORS Origin (replace with your EC2 public IP)
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP
EOF

# Create docker-compose.yml
echo "🐳 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    ports:
      - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    image: vikaskakarla/flowgrid-backend:latest
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/flowgrid?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
      NODE_ENV: ${NODE_ENV}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: vikaskakarla/flowgrid-frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mongodb_data:
    driver: local

networks:
  app-network:
    driver: bridge
EOF

echo "✅ EC2 setup complete!"
echo ""
echo "⚠️  IMPORTANT: Edit /home/ubuntu/flowgrid/.env and replace YOUR_EC2_PUBLIC_IP with your actual EC2 public IP"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano /home/ubuntu/flowgrid/.env"
echo "2. Update CORS_ORIGIN with your EC2 public IP"
echo "3. Run: docker compose up -d"
echo ""
echo "To view logs: docker compose logs -f"
echo "To check status: docker compose ps"
