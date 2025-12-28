#!/bin/bash

# Jenkins Installation Script for Ubuntu/Debian
# This script installs Jenkins, Docker, and required dependencies

set -e

echo "=========================================="
echo "Jenkins Installation Script"
echo "=========================================="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Java (Jenkins requirement)
echo "Installing Java..."
sudo apt-get install -y fontconfig openjdk-17-jre

# Verify Java installation
java -version

# Add Jenkins repository
echo "Adding Jenkins repository..."
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
echo "Installing Jenkins..."
sudo apt-get update
sudo apt-get install -y jenkins

# Install Docker
echo "Installing Docker..."
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

# Add Jenkins user to Docker group
echo "Adding Jenkins user to Docker group..."
sudo usermod -aG docker jenkins

# Install Node.js (for npm commands)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start and enable Jenkins
echo "Starting Jenkins..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Start and enable Docker
echo "Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Configure firewall (if UFW is enabled)
if sudo ufw status | grep -q "Status: active"; then
    echo "Configuring firewall..."
    sudo ufw allow 8080/tcp
    sudo ufw allow OpenSSH
fi

# Get initial admin password
echo ""
echo "=========================================="
echo "Jenkins Installation Complete!"
echo "=========================================="
echo ""
echo "Jenkins is running on: http://$(curl -s ifconfig.me):8080"
echo ""
echo "Initial Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "=========================================="
echo "Next Steps:"
echo "1. Open Jenkins in your browser"
echo "2. Use the password above to unlock Jenkins"
echo "3. Install suggested plugins"
echo "4. Create your first admin user"
echo "5. Configure Jenkins (see JENKINS_SETUP.md)"
echo "=========================================="
