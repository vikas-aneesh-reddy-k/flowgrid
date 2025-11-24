#!/bin/bash

# Setup Verification Script
set -e

EC2_HOST="13.62.224.81"
EC2_USER="ubuntu"
PEM_FILE="flowgrid-key.pem"

echo "🔍 FlowGrid CI/CD Setup Verification"
echo "=================================="

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file $PEM_FILE not found!"
    exit 1
else
    echo "✅ PEM file found"
fi

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

# Test SSH connection to EC2
echo "🔗 Testing SSH connection to EC2..."
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'"; then
    echo "✅ SSH connection to EC2 successful"
else
    echo "❌ SSH connection to EC2 failed"
    exit 1
fi

# Check Docker on EC2
echo "🐳 Checking Docker installation on EC2..."
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'EOF'
    if command -v docker &> /dev/null; then
        echo "✅ Docker is installed: $(docker --version)"
    else
        echo "❌ Docker is not installed"
        exit 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is installed: $(docker-compose --version)"
    else
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
EOF

# Check if required files exist
echo "📁 Checking required files..."
required_files=(
    "docker-compose.yml"
    ".env.production"
    "Dockerfile.frontend"
    "server/Dockerfile"
    "docker/nginx.conf"
    "docker/mongo-init.js"
    "Jenkinsfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check Jenkins requirements
echo "🏗️ Jenkins Setup Checklist:"
echo "   - Install Docker Pipeline plugin"
echo "   - Install GitHub Integration plugin"
echo "   - Install SSH Agent plugin"
echo "   - Configure credentials (dockerhub-credentials, ec2-ssh-key, mongo-user, mongo-password, jwt-secret)"
echo "   - Create pipeline job pointing to your GitHub repo"
echo "   - Configure GitHub webhook"

# Test Docker build locally (optional)
echo "🔨 Testing Docker builds locally..."
if command -v docker &> /dev/null; then
    echo "Testing frontend Docker build..."
    if docker build -f Dockerfile.frontend -t test-frontend --build-arg VITE_API_URL=http://$EC2_HOST:5000/api . > /dev/null 2>&1; then
        echo "✅ Frontend Docker build successful"
        docker rmi test-frontend > /dev/null 2>&1
    else
        echo "⚠️  Frontend Docker build failed (check Dockerfile.frontend)"
    fi
    
    echo "Testing backend Docker build..."
    if docker build -f server/Dockerfile -t test-backend server/ > /dev/null 2>&1; then
        echo "✅ Backend Docker build successful"
        docker rmi test-backend > /dev/null 2>&1
    else
        echo "⚠️  Backend Docker build failed (check server/Dockerfile)"
    fi
else
    echo "⚠️  Docker not installed locally - skipping build tests"
fi

echo ""
echo "🎉 Setup verification completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Jenkins credentials as described in jenkins/setup-complete-guide.md"
echo "2. Create Jenkins pipeline job"
echo "3. Configure GitHub webhook"
echo "4. Test the pipeline by pushing a commit"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   - jenkins/setup-complete-guide.md"
echo "   - jenkins/credentials-setup.md"