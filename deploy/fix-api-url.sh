#!/bin/bash

# Fix API URL for new EC2 IP
# Run this script on your EC2 instance

set -e

echo "🔧 Fixing API URL for new EC2 IP address..."

NEW_IP="13.51.176.153"
NEW_API_URL="http://${NEW_IP}:5000/api"

echo "📝 New API URL: ${NEW_API_URL}"

# Stop the frontend container
echo "⏸️  Stopping frontend container..."
docker-compose stop frontend

# Remove the old frontend container and image
echo "🗑️  Removing old frontend container and image..."
docker-compose rm -f frontend
docker rmi vikaskakarla/flowgrid-frontend:latest || true

# Rebuild the frontend with the new API URL
echo "🔨 Building new frontend image with updated API URL..."
docker build \
  --build-arg VITE_API_URL=${NEW_API_URL} \
  -f Dockerfile.frontend \
  -t vikaskakarla/flowgrid-frontend:latest \
  .

# Start the frontend container
echo "🚀 Starting frontend container..."
docker-compose up -d frontend

# Wait for container to be healthy
echo "⏳ Waiting for frontend to be ready..."
sleep 5

# Check if frontend is running
if docker-compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend is running!"
    echo ""
    echo "🌐 Your application should now be accessible at:"
    echo "   http://${NEW_IP}"
    echo ""
    echo "🔍 Test the signup at:"
    echo "   http://${NEW_IP}/signup"
else
    echo "❌ Frontend failed to start. Check logs with:"
    echo "   docker-compose logs frontend"
    exit 1
fi

echo ""
echo "✨ Done! The API URL has been updated to ${NEW_API_URL}"
