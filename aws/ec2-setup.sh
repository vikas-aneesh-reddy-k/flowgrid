#!/bin/bash

# EC2 Instance Setup Script for FlowGrid Application
# This script prepares an EC2 instance for Docker-based deployment

set -e

echo "🚀 Setting up EC2 instance for FlowGrid deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
sudo apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    htop \
    nano \
    ufw \
    fail2ban

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /home/ubuntu/app
sudo chown ubuntu:ubuntu /home/ubuntu/app
cd /home/ubuntu/app

# Create docker-compose.yml for production
echo "📝 Creating production docker-compose.yml..."
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
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - app-network
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
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: vikaskakarla/flowgrid-frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  mongodb_data:
    driver: local

networks:
  app-network:
    driver: bridge
EOF

# Create MongoDB initialization script
echo "📝 Creating MongoDB initialization script..."
cat > mongo-init.js << 'EOF'
// MongoDB initialization script
db = db.getSiblingDB('flowgrid');

// Create application user
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'flowgrid'
    }
  ]
});

// Create initial collections with indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Database initialization completed');
EOF

# Create nginx configuration
echo "📝 Creating nginx configuration..."
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp

# Configure fail2ban
echo "🛡️ Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create deployment script
echo "📝 Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

set -e

echo "🚀 Starting FlowGrid deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Backup database (if exists)
if docker ps | grep -q mongodb; then
    echo "💾 Creating database backup..."
    docker exec mongodb mongodump --out /tmp/backup-$(date +%Y%m%d-%H%M%S) || true
fi

# Stop services gracefully
echo "🛑 Stopping services..."
docker-compose down --timeout 30

# Start services with health checks
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout 300 bash -c '
    while ! docker-compose ps | grep -q "healthy"; do
        echo "Waiting for services to be healthy..."
        sleep 10
    done
'

# Verify deployment
echo "✅ Verifying deployment..."
curl -f http://localhost/health || {
    echo "❌ Health check failed"
    docker-compose logs
    exit 1
}

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
EOF

chmod +x deploy.sh

# Create monitoring script
echo "📝 Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

# System monitoring script for FlowGrid

echo "=== FlowGrid System Status ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Services ==="
docker-compose ps
echo ""

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2 $3}'
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "Disk Usage:"
df -h /
echo ""

echo "=== Application Health ==="
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "DOWN")"
echo "Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "DOWN")"
echo ""

echo "=== Recent Logs ==="
echo "Backend logs (last 10 lines):"
docker-compose logs --tail=10 backend
echo ""

echo "Frontend logs (last 10 lines):"
docker-compose logs --tail=10 frontend
EOF

chmod +x monitor.sh

# Create log rotation configuration
echo "📝 Configuring log rotation..."
sudo tee /etc/logrotate.d/docker-compose << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Set up automatic updates
echo "🔄 Setting up automatic security updates..."
sudo apt-get install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades

# Create systemd service for application
echo "📝 Creating systemd service..."
sudo tee /etc/systemd/system/flowgrid.service << 'EOF'
[Unit]
Description=FlowGrid Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable flowgrid.service

# Start Docker service
echo "🐳 Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Create initial environment file template
echo "📝 Creating environment template..."
cat > .env.template << 'EOF'
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Application Configuration
NODE_ENV=production
EOF

echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Create .env file with your actual credentials:"
echo "   cp .env.template .env"
echo "   nano .env"
echo ""
echo "2. Start the application:"
echo "   ./deploy.sh"
echo ""
echo "3. Monitor the application:"
echo "   ./monitor.sh"
echo ""
echo "4. View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Backend API: http://$(curl -s ifconfig.me):5000"
echo "   Health Check: http://$(curl -s ifconfig.me)/health"