#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║            GitHub Repository Setup - e-Khata                   ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git is not installed. Please install it first:${NC}"
    echo "  sudo apt install git"
    exit 1
fi

echo -e "${GREEN}✓ Git is installed${NC}"
echo ""

# Security warning
echo -e "${YELLOW}⚠️  SECURITY CHECK${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"

# Check if .env exists and contains API key
if [ -f "backend/.env" ]; then
    if grep -q "AIzaSy" backend/.env; then
        echo -e "${RED}✗ WARNING: API key found in backend/.env${NC}"
        echo -e "${YELLOW}  This file will be ignored by .gitignore, but please verify!${NC}"
        echo ""
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Aborted. Please remove sensitive data first.${NC}"
            exit 1
        fi
    fi
fi

# Check if .env.example exists
if [ ! -f "backend/.env.example" ]; then
    echo -e "${RED}✗ backend/.env.example not found${NC}"
    echo -e "${YELLOW}  Creating it now...${NC}"
    cat > backend/.env.example << 'EOF'
# Backend Environment Variables
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/expense-manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
GOOGLE_AI_API_KEY=your-google-gemini-api-key-here
EOF
    echo -e "${GREEN}✓ Created backend/.env.example${NC}"
fi

echo -e "${GREEN}✓ Security checks passed${NC}"
echo ""

# Initialize git repository
echo -e "${BLUE}📦 Initializing Git Repository${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
    read -p "Reinitialize? This will delete git history (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .git
        git init
        echo -e "${GREEN}✓ Repository reinitialized${NC}"
    fi
else
    git init
    echo -e "${GREEN}✓ Repository initialized${NC}"
fi

echo ""

# Configure git user (if not set)
echo -e "${BLUE}👤 Git Configuration${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

GIT_NAME=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    echo -e "${YELLOW}Git user not configured. Please enter your details:${NC}"
    read -p "Your name: " USER_NAME
    read -p "Your email: " USER_EMAIL
    git config --global user.name "$USER_NAME"
    git config --global user.email "$USER_EMAIL"
    echo -e "${GREEN}✓ Git user configured${NC}"
else
    echo -e "${GREEN}✓ Git user: $GIT_NAME <$GIT_EMAIL>${NC}"
fi

echo ""

# Add files
echo -e "${BLUE}📝 Adding Files to Git${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

git add .

# Show what will be committed
echo -e "${YELLOW}Files to be committed:${NC}"
git status --short | head -20
TOTAL_FILES=$(git status --short | wc -l)
echo -e "${YELLOW}... and $TOTAL_FILES files total${NC}"
echo ""

read -p "Proceed with commit? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Commit
echo -e "${BLUE}💾 Creating Initial Commit${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

git commit -m "Initial commit: Complete MERN Expense Manager (e-Khata)

Features:
- User authentication with JWT
- Expense and income tracking
- Budget planning and alerts
- Recurring expenses with auto-renewal
- AI-powered smart add (Google Gemini)
- AI financial advisor chatbot
- OCR receipt scanning (Tesseract.js)
- Multilingual support (English, Hindi, Marathi)
- Voice input for expenses and chat
- Export to CSV and PDF
- Beautiful dashboard with charts
- Dark mode theme
- Responsive design
- Real-time updates

Tech Stack:
- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- AI: Google Gemini 2.5-Flash, Tesseract.js
- i18n: react-i18next with language detection"

echo -e "${GREEN}✓ Initial commit created${NC}"
echo ""

# Add remote
echo -e "${BLUE}🌐 Connecting to GitHub${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

REMOTE_EXISTS=$(git remote | grep origin)

if [ ! -z "$REMOTE_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    CURRENT_REMOTE=$(git remote get-url origin)
    echo -e "${YELLOW}  Current: $CURRENT_REMOTE${NC}"
    read -p "Update to https://github.com/SuryavanshiRN/e-Khata.git? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin https://github.com/SuryavanshiRN/e-Khata.git
        echo -e "${GREEN}✓ Remote updated${NC}"
    fi
else
    git remote add origin https://github.com/SuryavanshiRN/e-Khata.git
    echo -e "${GREEN}✓ Remote added${NC}"
fi

echo ""

# Rename branch to main
echo -e "${BLUE}🌿 Setting Branch Name${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
    echo -e "${GREEN}✓ Branch renamed to 'main'${NC}"
else
    echo -e "${GREEN}✓ Already on 'main' branch${NC}"
fi

echo ""

# Push to GitHub
echo -e "${BLUE}🚀 Ready to Push to GitHub${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Repository: https://github.com/SuryavanshiRN/e-Khata${NC}"
echo ""
echo -e "${YELLOW}⚠️  Make sure the repository exists on GitHub first!${NC}"
echo -e "${YELLOW}    Visit: https://github.com/new${NC}"
echo ""
read -p "Push to GitHub now? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    
    # Try to push
    if git push -u origin main; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                                ║${NC}"
        echo -e "${GREEN}║              🎉 Successfully Pushed to GitHub! 🎉              ║${NC}"
        echo -e "${GREEN}║                                                                ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${GREEN}✓ Repository: https://github.com/SuryavanshiRN/e-Khata${NC}"
        echo ""
        echo -e "${YELLOW}Next Steps:${NC}"
        echo "  1. Add a description to your GitHub repository"
        echo "  2. Add topics/tags: mern, expense-tracker, ai, gemini, react"
        echo "  3. Configure GitHub Pages (optional)"
        echo "  4. Set up GitHub Actions for CI/CD (optional)"
        echo "  5. Invite collaborators (optional)"
        echo ""
    else
        echo ""
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                                                ║${NC}"
        echo -e "${RED}║                    ❌ Push Failed! ❌                           ║${NC}"
        echo -e "${RED}║                                                                ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Common issues:${NC}"
        echo "  1. Repository doesn't exist on GitHub"
        echo "     → Create it at: https://github.com/new"
        echo ""
        echo "  2. Authentication failed"
        echo "     → Set up GitHub CLI: gh auth login"
        echo "     → Or use Personal Access Token"
        echo ""
        echo "  3. Branch protection rules"
        echo "     → Check repository settings"
        echo ""
        echo -e "${YELLOW}Manual push command:${NC}"
        echo "  git push -u origin main"
        echo ""
    fi
else
    echo ""
    echo -e "${YELLOW}Push cancelled. You can push later using:${NC}"
    echo "  git push -u origin main"
    echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
