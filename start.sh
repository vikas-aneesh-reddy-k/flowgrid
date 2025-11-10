#!/bin/bash

echo "========================================"
echo "FlowGrid ERP - Starting Development Servers"
echo "========================================"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --eval "db.version()" --quiet > /dev/null 2>&1; then
    echo "[ERROR] MongoDB is not running!"
    echo "Please start MongoDB first:"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Linux: sudo systemctl start mongod"
    echo ""
    exit 1
fi
echo "[OK] MongoDB is running"
echo ""

# Check if backend dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd server
    npm install
    cd ..
    echo ""
fi

# Check if database is seeded
echo "Checking database..."
if ! mongosh flowgrid --eval "db.users.countDocuments()" --quiet > /dev/null 2>&1; then
    echo "Seeding database..."
    cd server
    npm run seed
    cd ..
    echo ""
fi

echo "Starting servers..."
echo "Frontend: http://localhost:8081"
echo "Backend:  http://localhost:5000"
echo ""

# Start both servers in background
cd server && npm run dev &
BACKEND_PID=$!

npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Servers are running"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
