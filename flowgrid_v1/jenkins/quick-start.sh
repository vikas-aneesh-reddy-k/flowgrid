#!/bin/bash

# Quick Start Script for Jenkins Setup
# This script provides an interactive setup experience

set -e

echo "=========================================="
echo "Jenkins CI/CD Quick Start"
echo "=========================================="
echo ""

# Check if running on Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    echo "❌ This script requires Ubuntu/Debian"
    echo "Please run install-jenkins.sh manually"
    exit 1
fi

# Check if Jenkins is already installed
if command -v jenkins &> /dev/null; then
    echo "✅ Jenkins is already installed"
    echo ""
    echo "Jenkins URL: http://$(curl -s ifconfig.me):8080"
    echo ""
    read -p "Do you want to reinstall? (y/N): " reinstall
    if [[ ! $reinstall =~ ^[Yy]$ ]]; then
        echo "Skipping installation..."
        exit 0
    fi
fi

# Confirm installation
echo "This script will install:"
echo "  - Java 17"
echo "  - Jenkins"
echo "  - Docker"
echo "  - Node.js 20"
echo ""
read -p "Continue with installation? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Installation cancelled"
    exit 0
fi

# Run installation
echo ""
echo "Starting installation..."
chmod +x jenkins/install-jenkins.sh
./jenkins/install-jenkins.sh

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "🌐 Jenkins URL: http://${SERVER_IP}:8080"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open Jenkins in your browser:"
echo "   http://${SERVER_IP}:8080"
echo ""
echo "2. Get the initial admin password:"
echo "   sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo ""
echo "3. Follow the setup guide:"
echo "   jenkins/JENKINS_SETUP.md"
echo ""
echo "4. Configure your pipeline:"
echo "   - Add Docker Hub credentials"
echo "   - Add EC2 SSH key"
echo "   - Set environment variables"
echo "   - Create pipeline job"
echo ""
echo "5. Set up GitHub webhook:"
echo "   http://${SERVER_IP}:8080/github-webhook/"
echo ""
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: jenkins/JENKINS_SETUP.md"
echo "   - Migration Guide: jenkins/MIGRATION_GUIDE.md"
echo "   - README: jenkins/README.md"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check Jenkins status: sudo systemctl status jenkins"
echo "   - View Jenkins logs: sudo journalctl -u jenkins -f"
echo "   - Restart Jenkins: sudo systemctl restart jenkins"
echo ""
echo "=========================================="
