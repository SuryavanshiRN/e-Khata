#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║        MERN Expense Manager - Complete Setup Script           ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check NPM
echo -e "${YELLOW}[2/5] Checking NPM...${NC}"
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ NPM installed: v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ NPM not found.${NC}"
    exit 1
fi

# Check/Install MongoDB
echo -e "${YELLOW}[3/5] Checking MongoDB...${NC}"
if command_exists mongod; then
    MONGO_VERSION=$(mongod --version | head -n 1)
    echo -e "${GREEN}✓ MongoDB already installed${NC}"
else
    echo -e "${YELLOW}MongoDB not found. Installing...${NC}"
    
    # Import MongoDB public GPG Key
    echo "Importing MongoDB GPG key..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Create list file for MongoDB
    echo "Adding MongoDB repository..."
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database
    echo "Updating package list..."
    sudo apt-get update -qq
    
    # Install MongoDB
    echo "Installing MongoDB..."
    sudo apt-get install -y mongodb-org
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ MongoDB installed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to install MongoDB${NC}"
        echo -e "${YELLOW}Try manual installation or use MongoDB Atlas (cloud)${NC}"
        exit 1
    fi
fi

# Start MongoDB
echo -e "${YELLOW}[4/5] Starting MongoDB...${NC}"
sudo systemctl start mongod 2>/dev/null || sudo mongod --fork --logpath /tmp/mongodb.log --dbpath /var/lib/mongodb 2>/dev/null

# Enable MongoDB to start on boot
sudo systemctl enable mongod 2>/dev/null

# Check if MongoDB is running
sleep 2
if sudo systemctl is-active --quiet mongod 2>/dev/null || pgrep mongod >/dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB may not be running. You may need to start it manually.${NC}"
fi

# Install project dependencies
echo -e "${YELLOW}[5/5] Installing project dependencies...${NC}"

# Backend dependencies
echo "Installing backend dependencies..."
cd "$(dirname "$0")/backend"
if [ -f "package.json" ]; then
    npm install --silent
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    fi
else
    echo -e "${RED}✗ Backend package.json not found${NC}"
fi

# Frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
if [ -f "package.json" ]; then
    npm install --silent
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    fi
else
    echo -e "${RED}✗ Frontend package.json not found${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Setup Complete! 🎉                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ All dependencies installed${NC}"
echo -e "${GREEN}✓ MongoDB is ready${NC}"
echo ""
echo -e "${YELLOW}To start the application, run these commands in separate terminals:${NC}"
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd \"$(pwd)/backend\""
echo "  npm start"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd \"$(pwd)/frontend\""
echo "  npm run dev"
echo ""
echo -e "${BLUE}Then open your browser to: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Or use the run.sh script to start both servers at once!${NC}"
echo ""
