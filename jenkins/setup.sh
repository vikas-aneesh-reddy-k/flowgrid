#!/bin/bash

# Jenkins Setup Script for Ubuntu/Debian
# This script installs and configures Jenkins with all required plugins and tools

set -e

echo "🚀 Starting Jenkins CI/CD Setup..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Java 17 (required for Jenkins)
echo "📦 Installing Java 17..."
sudo apt-get install -y openjdk-17-jdk

# Add Jenkins repository
echo "📦 Adding Jenkins repository..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
    /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
    /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
echo "📦 Installing Jenkins..."
sudo apt-get update
sudo apt-get install -y jenkins

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and npm
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install AWS CLI
echo "☁️ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Install Trivy for security scanning
echo "🔒 Installing Trivy..."
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Start and enable Jenkins
echo "🚀 Starting Jenkins..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Create Jenkins directories
sudo mkdir -p /var/lib/jenkins/workspace
sudo chown -R jenkins:jenkins /var/lib/jenkins

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Get initial admin password
echo "🔑 Jenkins Initial Setup:"
echo "=========================================="
echo "Jenkins URL: http://$(curl -s ifconfig.me):8080"
echo "Initial Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "=========================================="

# Create Jenkins CLI setup script
cat > /tmp/jenkins-cli-setup.sh << 'EOF'
#!/bin/bash

# Download Jenkins CLI
wget http://localhost:8080/jnlpJars/jenkins-cli.jar

# Install required plugins
java -jar jenkins-cli.jar -s http://localhost:8080/ install-plugin \
    git \
    github \
    pipeline-stage-view \
    docker-workflow \
    aws-credentials \
    email-ext \
    build-timeout \
    timestamper \
    ws-cleanup \
    ant \
    gradle \
    workflow-aggregator \
    github-branch-source \
    pipeline-github-lib \
    ssh-slaves \
    matrix-auth \
    pam-auth \
    ldap \
    role-strategy \
    antisamy-markup-formatter

# Restart Jenkins to load plugins
java -jar jenkins-cli.jar -s http://localhost:8080/ restart
EOF

chmod +x /tmp/jenkins-cli-setup.sh

echo "✅ Jenkins installation completed!"
echo ""
echo "Next steps:"
echo "1. Open Jenkins at http://$(curl -s ifconfig.me):8080"
echo "2. Use the initial admin password shown above"
echo "3. Install suggested plugins"
echo "4. Create an admin user"
echo "5. Run the CLI setup script: /tmp/jenkins-cli-setup.sh"
echo "6. Configure credentials in Jenkins"
echo ""
echo "🔧 Manual Configuration Required:"
echo "- Add Docker Hub credentials (dockerhub-credentials)"
echo "- Add EC2 SSH key (ec2-ssh-key)"
echo "- Add EC2 host (ec2-host)"
echo "- Add MongoDB credentials (mongo-user, mongo-password)"
echo "- Add JWT secret (jwt-secret)"