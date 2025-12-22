#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║              Stopping MERN Expense Manager Servers             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🛑 Stopping Frontend server..."
pkill -f "vite" 2>/dev/null && echo "  ✓ Frontend stopped" || echo "  ℹ Frontend not running"

echo ""
echo "🛑 Stopping Backend server..."
pkill -f "nodemon.*server.js" 2>/dev/null && echo "  ✓ Backend stopped" || echo "  ℹ Backend not running"
pkill -f "node.*server.js" 2>/dev/null

echo ""
echo "🛑 Stopping MongoDB..."
sudo systemctl stop mongod 2>/dev/null && echo "  ✓ MongoDB stopped" || echo "  ℹ MongoDB already stopped"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    All Servers Stopped!                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "To start again, run: ./start-servers.sh"
echo ""
