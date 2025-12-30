#!/bin/bash

# Test Reminder Email Debugging Script
# This script will help debug the test notification issue

echo "🔍 Reminder Email Debugging"
echo "=============================="
echo ""

# Get the first reminder ID from database
REMINDER_ID=$(mongosh expense-manager --quiet --eval "db.reminders.findOne()._id.toString()" 2>/dev/null)

if [ -z "$REMINDER_ID" ]; then
    echo "❌ No reminders found in database"
    echo "   Please create a reminder first in the UI"
    exit 1
fi

echo "📋 Found Reminder ID: $REMINDER_ID"
echo ""

# Get reminder details
echo "🔍 Reminder Details:"
mongosh expense-manager --quiet --eval "
    const r = db.reminders.findOne({_id: ObjectId('$REMINDER_ID')});
    print('Title: ' + r.title);
    print('Notification Email: ' + (r.notificationEmail || 'NOT SET'));
    print('Email Channel Enabled: ' + r.notificationChannels.email);
    print('User ID: ' + r.user);
"

echo ""
echo "👤 User Email:"
USER_ID=$(mongosh expense-manager --quiet --eval "db.reminders.findOne({_id: ObjectId('$REMINDER_ID')}).user.toString()" 2>/dev/null)
mongosh expense-manager --quiet --eval "print(db.users.findOne({_id: ObjectId('$USER_ID')}).email)"

echo ""
echo "🧪 Testing with actual API call..."
echo ""

# Get token (you need to provide this)
echo "⚠️  You need to be logged in. Please provide your auth token."
echo "   Get it from: localStorage.getItem('token') in browser console"
echo ""
read -p "Enter your auth token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided. Cannot test."
    exit 1
fi

echo ""
echo "📡 Sending POST request to test endpoint..."
echo "   URL: http://localhost:5000/api/reminders/$REMINDER_ID/test-notification"
echo ""

# Make the API call and show response
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:5000/api/reminders/$REMINDER_ID/test-notification)

echo "📬 API Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "📊 Check backend logs:"
tail -20 /tmp/backend-real.log | grep -A5 -B5 "email\|Email\|📧"

echo ""
echo "✅ Test complete!"
echo ""
echo "Expected behavior:"
echo "  1. Should see: 📧 Sending email to: [custom email]"
echo "  2. Should see: ✅ Email notification sent successfully"
echo "  3. Check the specified email inbox"
