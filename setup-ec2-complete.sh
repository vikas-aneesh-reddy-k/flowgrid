#!/bin/bash

# Complete EC2 Setup Script for FlowGrid
# This script installs Docker, Jenkins, and prepares the environment

set -e

echo "🚀 Starting FlowGrid EC2 Setup..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    print_error "This script must be run as ubuntu user"
    exit 1
fi

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    print_success "Docker installed"
else
    print_info "Docker already installed"
fi

# Install Docker Compose
print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_info "Docker Compose already installed"
fi

# Install Java for Jenkins
print_info "Installing Java..."
if ! command -v java &> /dev/null; then
    sudo apt install -y openjdk-17-jdk
    print_success "Java installed"
else
    print_info "Java already installed"
fi

# Install Jenkins
print_info "Installing Jenkins..."
if ! command -v jenkins &> /dev/null; then
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
        /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
        https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
        /etc/apt/sources.list.d/jenkins.list > /dev/null
    
    sudo apt update
    sudo apt install -y jenkins
    print_success "Jenkins installed"
else
    print_info "Jenkins already installed"
fi

# Start Jenkins
print_info "Starting Jenkins..."
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
print_success "Jenkins started"

# Create deployment directory
print_info "Creating deployment directory..."
mkdir -p /home/ubuntu/flowgrid
cd /home/ubuntu/flowgrid

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
print_info "EC2 Public IP: $EC2_IP"

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
print_info "Creating environment file..."
cat > .env << EOF
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=admin123
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/flowgrid?authSource=admin

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Application Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*

# Frontend Configuration
VITE_API_URL=http://${EC2_IP}/api

# Docker Hub (update with your username)
DOCKER_HUB_USERNAME=your-dockerhub-username
EOF

print_success "Environment file created"

# Get Jenkins initial password
print_info "Getting Jenkins initial password..."
sleep 5
JENKINS_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "Not available yet")

# Print summary
echo ""
echo "=================================="
print_success "Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Jenkins:"
echo "   URL: http://${EC2_IP}:8080"
echo "   Initial Password: ${JENKINS_PASSWORD}"
echo ""
echo "2. Update .env file:"
echo "   nano /home/ubuntu/flowgrid/.env"
echo "   - Update MONGO_PASSWORD"
echo "   - Update DOCKER_HUB_USERNAME"
echo ""
echo "3. Add Jenkins Credentials:"
echo "   - Docker Hub credentials"
echo "   - EC2 SSH key"
echo "   - MongoDB URI"
echo "   - JWT secret"
echo ""
echo "4. Create Jenkins Pipeline:"
echo "   - New Item → Pipeline"
echo "   - Connect to GitHub repository"
echo "   - Use Jenkinsfile from repo"
echo ""
echo "5. Setup GitHub Webhook:"
echo "   URL: http://${EC2_IP}:8080/github-webhook/"
echo ""
echo "=================================="
echo "📊 System Information:"
echo "=================================="
echo "EC2 IP: ${EC2_IP}"
echo "Docker Version: $(docker --version)"
echo "Docker Compose Version: $(docker-compose --version)"
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Jenkins Status: $(sudo systemctl is-active jenkins)"
echo ""
echo "=================================="
echo "🔐 Security Reminders:"
echo "=================================="
echo "- Change MongoDB password in .env"
echo "- Restrict Jenkins port 8080 to your IP"
echo "- Setup HTTPS with SSL certificate"
echo "- Enable AWS CloudWatch monitoring"
echo ""
echo "=================================="
print_success "You can now proceed with Jenkins configuration!"
echo "=================================="
echo ""
echo "⚠️  IMPORTANT: Logout and login again for docker group changes to take effect"
echo ""
