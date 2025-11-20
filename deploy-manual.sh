#!/bin/bash

#############################################
# Manual Deployment Script
# Run this to deploy updates to EC2
#############################################

set -e

echo "🚀 Deploying FlowGrid to EC2..."

# Configuration
EC2_IP="13.53.86.36"
EC2_USER="ubuntu"
SSH_KEY="flowgrid-key.pem"

# Build locally
echo "📦 Building application..."
npm ci
npm run build

cd server
npm ci
npm run build
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy-package/frontend
mkdir -p deploy-package/backend
cp -r dist/* deploy-package/frontend/
cp -r server/dist deploy-package/backend/
cp server/package*.json deploy-package/backend/
tar -czf deploy.tar.gz deploy-package/

# Copy to EC2
echo "📤 Copying to EC2..."
scp -i $SSH_KEY deploy.tar.gz $EC2_USER@$EC2_IP:/home/ubuntu/

# Deploy on EC2
echo "🚀 Deploying on EC2..."
ssh -i $SSH_KEY $EC2_USER@$EC2_IP << 'ENDSSH'
  set -e
  
  # Extract
  cd /home/ubuntu
  tar -xzf deploy.tar.gz
  
  # Deploy Frontend
  sudo rm -rf /var/www/flowgrid
  sudo mkdir -p /var/www/flowgrid
  sudo cp -r deploy-package/frontend/* /var/www/flowgrid/
  sudo chown -R www-data:www-data /var/www/flowgrid
  
  # Deploy Backend
  mkdir -p ~/flowgrid/server
  cp -r deploy-package/backend/dist ~/flowgrid/server/
  cp deploy-package/backend/package*.json ~/flowgrid/server/
  
  cd ~/flowgrid/server
  npm ci --production
  
  # Restart
  pm2 restart flowgrid-backend
  sudo systemctl restart nginx
  
  # Cleanup
  rm -rf /home/ubuntu/deploy-package /home/ubuntu/deploy.tar.gz
  
  echo "✅ Deployment complete!"
  pm2 status
ENDSSH

# Cleanup local
rm -rf deploy-package deploy.tar.gz

echo ""
echo "✅ Deployment successful!"
echo "🌐 Your app: http://$EC2_IP"
echo ""
