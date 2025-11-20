#!/bin/bash

#############################################
# Complete FlowGrid Deployment Script
# This script sets up everything from scratch
#############################################

set -e

echo "🚀 FlowGrid Complete Deployment Starting..."
echo "============================================"

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
echo "📍 EC2 IP: $EC2_IP"

# Configuration
APP_DIR="$HOME/flowgrid"
REPO_URL="https://github.com/vikas-aneesh-reddy-k/flowgrid.git"

#############################################
# 1. INSTALL DEPENDENCIES
#############################################
echo ""
echo "📦 Step 1: Installing system dependencies..."

# Update system
sudo apt-get update -qq

# Install Node.js 20 (LTS)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MongoDB
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update -qq
    sudo apt-get install -y mongodb-org
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

echo "✅ Dependencies installed"

#############################################
# 2. START SERVICES
#############################################
echo ""
echo "🔧 Step 2: Starting services..."

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sleep 3

# Verify MongoDB is running
if ! sudo systemctl is-active --quiet mongod; then
    echo "❌ MongoDB failed to start"
    exit 1
fi

echo "✅ MongoDB is running"

#############################################
# 3. CLONE/UPDATE CODE
#############################################
echo ""
echo "📥 Step 3: Getting application code..."

# Stop existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo "Updating repository..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

#############################################
# 4. SETUP BACKEND
#############################################
echo ""
echo "🔧 Step 4: Setting up backend..."

cd "$APP_DIR/server"

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file
echo "Creating backend environment..."
JWT_SECRET=$(openssl rand -base64 32)
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
CORS_ORIGIN=http://${EC2_IP}
EOF

# Build backend
echo "Building backend..."
npm run build

# Seed database
echo "Seeding database..."
npm run seed || echo "⚠️  Database already seeded"

echo "✅ Backend setup complete"

#############################################
# 5. SETUP FRONTEND
#############################################
echo ""
echo "🎨 Step 5: Setting up frontend..."

cd "$APP_DIR"

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create production env
echo "Creating frontend environment..."
cat > .env.production << EOF
VITE_API_URL=http://${EC2_IP}/api
EOF

# Build frontend
echo "Building frontend..."
npm run build

# Deploy to Nginx
echo "Deploying frontend..."
sudo rm -rf /var/www/flowgrid
sudo mkdir -p /var/www/flowgrid
sudo cp -r dist/* /var/www/flowgrid/
sudo chown -R www-data:www-data /var/www/flowgrid

echo "✅ Frontend setup complete"

#############################################
# 6. CONFIGURE NGINX
#############################################
echo ""
echo "🌐 Step 6: Configuring Nginx..."

sudo tee /etc/nginx/sites-available/flowgrid > /dev/null << 'NGINX_CONFIG'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Frontend
    location / {
        root /var/www/flowgrid;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

# Enable site
sudo ln -sf /etc/nginx/sites-available/flowgrid /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured"

#############################################
# 7. START BACKEND WITH PM2
#############################################
echo ""
echo "🚀 Step 7: Starting backend service..."

cd "$APP_DIR/server"

# Start with PM2
pm2 start dist/index.js --name flowgrid-backend --time
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep -v PM2 | sudo bash || true

echo "✅ Backend service started"

#############################################
# 8. VERIFY DEPLOYMENT
#############################################
echo ""
echo "🔍 Step 8: Verifying deployment..."

# Wait for backend to start
sleep 5

# Check services
MONGO_STATUS=$(sudo systemctl is-active mongod)
NGINX_STATUS=$(sudo systemctl is-active nginx)
PM2_STATUS=$(pm2 list | grep -c "online" || echo "0")

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "📊 Service Status:"
echo "  MongoDB: $MONGO_STATUS"
echo "  Nginx: $NGINX_STATUS"
echo "  Backend: $PM2_STATUS process(es) online"
echo ""
echo "🌐 Access Your Application:"
echo "  Frontend: http://${EC2_IP}"
echo "  Backend API: http://${EC2_IP}/api"
echo "  Health Check: http://${EC2_IP}/health"
echo ""
echo "👤 Demo Login Credentials:"
echo "  Email: admin@flowgrid.com"
echo "  Password: admin123"
echo ""
echo "📝 Useful Commands:"
echo "  View logs: pm2 logs flowgrid-backend"
echo "  Restart: pm2 restart flowgrid-backend"
echo "  Status: pm2 status"
echo "  MongoDB: sudo systemctl status mongod"
echo "  Nginx: sudo systemctl status nginx"
echo ""

# Show PM2 status
pm2 status

echo ""
echo "🎉 Your FlowGrid ERP is now live!"
