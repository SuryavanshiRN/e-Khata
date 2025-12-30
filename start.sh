#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 18
nvm use 18

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         Starting MERN Expense Manager Servers (NVM)           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo ""

# Kill any existing servers
echo "Cleaning up existing processes..."
pkill -f "nodemon.*server.js" 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start MongoDB
echo ""
echo "=== MongoDB ==="
sudo systemctl start mongod 2>/dev/null
if sudo systemctl is-active mongod --quiet; then
    echo "✓ MongoDB running"
else
    echo "✗ MongoDB failed to start"
    exit 1
fi

# Start Backend
echo ""
echo "=== Backend Server ==="
cd "/home/aryan/aryan/Expense Manager 2/backend"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Starting backend server..."
nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "✓ Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
else
    echo "✗ Backend failed to start. Check backend/backend.log"
fi

# Start Frontend
echo ""
echo "=== Frontend Server ==="
cd "/home/aryan/aryan/Expense Manager 2/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
else
    echo "✗ Frontend failed to start. Check frontend/frontend.log"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                    Servers Are Running!                        ║"
echo "║                                                                ║"
echo "║  Backend:  http://localhost:5000                               ║"
echo "║  Frontend: http://localhost:3000                               ║"
echo "║                                                                ║"
echo "║  Backend PID:  $BACKEND_PID                                          ║"
echo "║  Frontend PID: $FRONTEND_PID                                          ║"
echo "║                                                                ║"
echo "║  To stop servers: ./stop.sh                                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Logs:"
echo "  • Backend:  tail -f backend/backend.log"
echo "  • Frontend: tail -f frontend/frontend.log"
echo ""
echo "🌐 Open in browser: http://localhost:3000"
echo ""
