#!/bin/bash

# Quick Start Script for Testing Feature 3: Reminders & Notifications

echo "🔔 Feature 3: Reminders & Notifications - Quick Start"
echo "======================================================"
echo ""

# Check if backend is running
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "❌ Backend server is not running!"
    echo "   Start it with: cd backend && npm start"
    exit 1
fi

echo "✅ Backend server is running"

# Check if frontend is running
if ! pgrep -f "vite" > /dev/null; then
    echo "❌ Frontend server is not running!"
    echo "   Start it with: cd frontend && npm run dev"
    exit 1
fi

echo "✅ Frontend server is running"
echo ""

# Check if email is configured
if ! grep -q "SMTP_USER=.*@" backend/.env 2>/dev/null; then
    echo "⚠️  Email not configured yet!"
    echo ""
    echo "To enable email notifications:"
    echo "1. Visit: https://myaccount.google.com/apppasswords"
    echo "2. Generate an App Password"
    echo "3. Edit backend/.env and set:"
    echo "   SMTP_USER=your-email@gmail.com"
    echo "   SMTP_PASS=your-16-char-app-password"
    echo "   SMTP_FROM_EMAIL=your-email@gmail.com"
    echo "4. Restart backend server"
    echo ""
    echo "See TEST_EMAIL_SETUP.md for detailed instructions"
    echo ""
else
    SMTP_USER=$(grep "SMTP_USER=" backend/.env | cut -d'=' -f2)
    if [[ "$SMTP_USER" == "your-email@gmail.com" ]] || [[ "$SMTP_USER" == "your-real-email@gmail.com" ]]; then
        echo "⚠️  Email configured but using placeholder!"
        echo "   Please update SMTP_USER in backend/.env with your real email"
        echo ""
    else
        echo "✅ Email configured: $SMTP_USER"
        echo ""
        echo "Test your email setup:"
        echo "  cd backend && node test-email.js $SMTP_USER"
        echo ""
    fi
fi

echo "📋 Quick Testing Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Open Reminders Page:"
echo "   http://localhost:3000/reminders"
echo ""
echo "2️⃣  Create a Test Reminder:"
echo "   - Click '+ Add Reminder' button"
echo "   - Fill in details"
echo "   - Enable email notification"
echo "   - Click 'Create Reminder'"
echo ""
echo "3️⃣  Test Email Notification:"
echo "   - Click '🔔 Test' button on the reminder card"
echo "   - Check your email inbox"
echo ""
echo "4️⃣  Test Actions:"
echo "   - Try Pause/Resume"
echo "   - Try Complete"
echo "   - Try Edit"
echo "   - Try Delete"
echo ""
echo "5️⃣  Test Filters:"
echo "   - Click 'All', 'Active', 'Overdue', 'Upcoming'"
echo "   - Verify correct reminders show"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   • TESTING_CHECKLIST.md - Full testing guide"
echo "   • TEST_EMAIL_SETUP.md - Email setup instructions"
echo "   • FEATURE_3_READY_TO_TEST.md - Feature overview"
echo ""
echo "🚀 Opening reminders page in browser..."
echo ""

# Try to open in browser
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:3000/reminders" 2>/dev/null
elif command -v gnome-open > /dev/null; then
    gnome-open "http://localhost:3000/reminders" 2>/dev/null
fi

echo "✨ Happy Testing! ✨"
