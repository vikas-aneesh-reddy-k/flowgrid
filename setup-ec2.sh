#!/bin/bash

# FlowGrid EC2 Setup Script
# Run this script once on a fresh Ubuntu EC2 instance

set -e

echo "🚀 Setting up FlowGrid on AWS EC2..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root. Run as ubuntu user.${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo -e "${YELLOW}Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install MongoDB
echo -e "${YELLOW}Installing MongoDB...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
echo -e "${YELLOW}Starting MongoDB...${NC}"
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod --no-pager

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
sudo npm install -g pm2

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
sudo apt install -y nginx

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/flowgrid > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/flowgrid;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/flowgrid /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable

# Create application directory
mkdir -p ~/flowgrid

# Setup PM2 startup
pm2 startup | tail -n 1 | sudo bash

echo ""
echo -e "${GREEN}✅ EC2 setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Add GitHub secrets to your repository:"
echo "   - AWS_EC2_HOST: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   - AWS_EC2_USER: ubuntu"
echo "   - AWS_SSH_KEY: (contents of your .pem file)"
echo ""
echo "2. Run the deployment script:"
echo "   bash deploy-to-aws.sh"
echo ""
echo "3. Access your application at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
