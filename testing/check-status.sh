#!/bin/bash

echo "🔍 Checking Server Status..."
echo ""

# Check Backend
echo "=== BACKEND (Port 5000) ==="
if lsof -i :5000 | grep -q LISTEN; then
    echo "✅ Backend is RUNNING on port 5000"
    echo "   Process: $(lsof -i :5000 | grep LISTEN | awk '{print $1, $2}')"
else
    echo "❌ Backend is NOT running"
fi

echo ""

# Check Frontend
echo "=== FRONTEND (Port 3000/3001) ==="
if lsof -i :3000 | grep -q LISTEN; then
    echo "✅ Frontend is RUNNING on port 3000"
    echo "   URL: http://localhost:3000"
elif lsof -i :3001 | grep -q LISTEN; then
    echo "✅ Frontend is RUNNING on port 3001"
    echo "   URL: http://localhost:3001"
else
    echo "❌ Frontend is NOT running"
fi

echo ""

# Check MongoDB
echo "=== MONGODB ==="
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB is RUNNING"
else
    echo "❌ MongoDB is NOT running"
fi

echo ""

# Test Backend API
echo "=== BACKEND API TEST ==="
response=$(curl -s http://localhost:5000/)
if echo "$response" | grep -q "Expense Manager API"; then
    echo "✅ Backend API is responding"
else
    echo "⚠️  Backend API check failed"
fi

echo ""

# Test Frontend
echo "=== FRONTEND TEST ==="
if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend is serving pages"
elif curl -s http://localhost:3001 | grep -q "html"; then
    echo "✅ Frontend is serving pages on port 3001"
else
    echo "⚠️  Frontend check failed"
fi

echo ""
echo "================================"
echo "🎉 SERVERS ARE READY!"
echo ""
echo "📱 Open: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "================================"
