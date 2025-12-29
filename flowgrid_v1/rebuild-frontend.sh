#!/bin/bash

# Rebuild frontend with correct API URL for production
echo "Building frontend with API URL: /api"

# Build the Docker image with the correct API URL
docker build \
  --build-arg VITE_API_URL=/api \
  -f Dockerfile.frontend \
  -t vikaskakarla/flowgrid-frontend:latest \
  .

echo "Frontend built successfully!"
echo ""
echo "Pushing to Docker Hub..."
docker push vikaskakarla/flowgrid-frontend:latest

echo ""
echo "✅ Frontend image pushed to Docker Hub!"
echo ""
echo "On EC2 (13.51.176.153), run:"
echo "docker-compose pull frontend"
echo "docker-compose up -d frontend"
