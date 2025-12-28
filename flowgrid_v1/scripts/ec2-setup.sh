#!/bin/bash

# EC2 Initial Setup Script
set -e

echo "🚀 Setting up EC2 instance for FlowGrid deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker is already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose is already installed"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directories..."
mkdir -p /home/ubuntu/flowgrid
mkdir -p /home/ubuntu/docker
mkdir -p /home/ubuntu/logs

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/flowgrid > /dev/null << 'EOF'
/home/ubuntu/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Create systemd service for auto-start
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/flowgrid.service > /dev/null << 'EOF'
[Unit]
Description=FlowGrid Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable flowgrid.service

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt-get install -y htop iotop nethogs

# Set up basic monitoring script
tee /home/ubuntu/monitor.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== FlowGrid System Status ==="
echo "Date: $(date)"
echo ""
echo "=== Docker Containers ==="
docker-compose ps
echo ""
echo "=== System Resources ==="
free -h
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Network Connections ==="
netstat -tlnp | grep -E ':(80|443|5000|27017)'
EOF

chmod +x /home/ubuntu/monitor.sh

# Create backup script
tee /home/ubuntu/backup.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Creating backup at $DATE..."

# Backup MongoDB data
docker-compose exec -T mongodb mongodump --out /tmp/backup_$DATE
docker cp $(docker-compose ps -q mongodb):/tmp/backup_$DATE $BACKUP_DIR/

# Backup application logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /home/ubuntu/logs/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x /home/ubuntu/backup.sh

# Set up cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/logs/backup.log 2>&1") | crontab -

# Configure swap if not present
if [ ! -f /swapfile ]; then
    echo "💾 Setting up swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Optimize system settings
echo "⚡ Optimizing system settings..."
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
echo 'net.core.somaxconn=65535' | sudo tee -a /etc/sysctl.conf

# Apply sysctl settings
sudo sysctl -p

echo ""
echo "🎉 EC2 setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Docker and Docker Compose installed"
echo "✅ Firewall configured (ports 22, 80, 443, 5000)"
echo "✅ Application directories created"
echo "✅ Systemd service configured"
echo "✅ Monitoring and backup scripts installed"
echo "✅ System optimizations applied"
echo ""
echo "🔄 Please log out and log back in to apply Docker group changes"
echo "🚀 Your EC2 instance is ready for FlowGrid deployment!"