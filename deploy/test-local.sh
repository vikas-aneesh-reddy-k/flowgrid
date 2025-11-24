#!/bin/bash
# Local testing script - Run before deploying
# Tests Docker builds locally

set -e

echo "🧪 Testing FlowGrid locally..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Test backend build
echo "📦 Building backend Docker image..."
docker build -t flowgrid-backend-test:latest -f server/Dockerfile ./server
echo "✅ Backend build successful"
echo ""

# Test frontend build
echo "📦 Building frontend Docker image..."
docker build -t flowgrid-frontend-test:latest \
    --build-arg VITE_API_URL=http://localhost:5000/api \
    -f Dockerfile.frontend .
echo "✅ Frontend build successful"
echo ""

# Test docker-compose
echo "🐳 Testing docker-compose configuration..."
docker compose config > /dev/null
echo "✅ docker-compose.yml is valid"
echo ""

# Clean up test images
echo "🧹 Cleaning up test images..."
docker rmi flowgrid-backend-test:latest flowgrid-frontend-test:latest
echo "✅ Cleanup complete"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Commit and push to GitHub"
echo "2. GitHub Actions will build and deploy automatically"
echo "3. Check deployment: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo ""
