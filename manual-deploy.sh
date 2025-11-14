#!/bin/bash

# Manual Deployment Script for FlowGrid on EC2
# Run this script on your EC2 instance after setup-ec2.sh completes

set -e

echo "🚀 Starting FlowGrid Manual Deployment..."

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $EC2_IP"

# Configuration
APP_DIR="$HOME/flowgrid"
REPO_URL="https://github.com/vikas-aneesh-reddy-k/flowgrid.git"

# Stop existing services
echo "⏹️  Stopping existing services..."
pm2 stop all || true
pm2 delete all || true

# Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo "📦 Updating repository..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo "📦 Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create frontend environment file
echo "⚙️  Creating frontend environment..."
cat > .env.production << EOF
VITE_API_URL=http://${EC2_IP}/api
EOF

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Deploy frontend to Nginx
echo "🌐 Deploying frontend..."
sudo rm -rf /var/www/flowgrid
sudo mkdir -p /var/www/flowgrid
sudo cp -r dist/* /var/www/flowgrid/
sudo chown -R www-data:www-data /var/www/flowgrid

# Configure Nginx
echo "⚙️  Configuring Nginx..."
sudo tee /etc/nginx/sites-available/flowgrid > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/flowgrid;
        try_files $uri $uri/ /index.html;
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
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/flowgrid /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup backend
echo "🔧 Setting up backend..."
cd "$APP_DIR/server"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create backend environment file
if [ ! -f .env ]; then
    echo "⚙️  Creating backend environment..."
    JWT_SECRET=$(openssl rand -base64 32)
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
CORS_ORIGIN=http://${EC2_IP}
EOF
fi

# Build backend
echo "🔨 Building backend..."
npm run build

# Start MongoDB
echo "🗄️  Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
sleep 5

# Seed database
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed or already seeded"

# Start backend with PM2
echo "🚀 Starting backend..."
cd "$APP_DIR/server"
pm2 start dist/index.js --name flowgrid-backend
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Show status
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
sudo systemctl status mongod --no-pager | head -5
echo ""
sudo systemctl status nginx --no-pager | head -5
echo ""
echo "🌐 Application URL: http://${EC2_IP}"
echo "🔌 Backend API: http://${EC2_IP}/api"
echo ""
echo "📝 Useful Commands:"
echo "  - View backend logs: pm2 logs flowgrid-backend"
echo "  - Restart backend: pm2 restart flowgrid-backend"
echo "  - Check MongoDB: sudo systemctl status mongod"
echo "  - Check Nginx: sudo systemctl status nginx"
echo ""
