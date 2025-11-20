#!/bin/sh
set -e

echo "🚀 Starting FlowGrid Application..."

# Start nginx in background
echo "📦 Starting Nginx..."
nginx

# Start backend
echo "🔧 Starting Backend..."
cd /app/server
node dist/index.js
