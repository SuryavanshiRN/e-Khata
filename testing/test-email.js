#!/usr/bin/env node
/**
 * Email Configuration Test Script
 * 
 * This script tests your SMTP email configuration without needing to 
 * create a reminder or login to the app.
 * 
 * Usage: node test-email.js your-email@gmail.com
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Get email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Please provide an email address:');
  console.error('   node test-email.js your-email@gmail.com');
  process.exit(1);
}

// Check if SMTP is configured
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ SMTP not configured in .env file!');
  console.error('   Please update SMTP_USER and SMTP_PASS in /backend/.env');
  console.error('   See TEST_EMAIL_SETUP.md for instructions.');
  process.exit(1);
}

console.log('\n📧 Testing Email Configuration...\n');
console.log('Configuration:');
console.log(`  SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
console.log(`  SMTP Port: ${process.env.SMTP_PORT || 587}`);
console.log(`  SMTP User: ${process.env.SMTP_USER}`);
console.log(`  Test Email: ${testEmail}`);
console.log('\n🔄 Connecting to SMTP server...\n');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test email template
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .success-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin: 20px 0;
    }
    .info-box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Email Configuration Successful!</h1>
  </div>
  <div class="content">
    <div class="success-badge">✅ TEST PASSED</div>
    
    <p>Great news! Your email configuration is working correctly.</p>
    
    <div class="info-box">
      <h3>What's Working:</h3>
      <ul>
        <li>✅ SMTP connection established</li>
        <li>✅ Authentication successful</li>
        <li>✅ Email delivery working</li>
        <li>✅ HTML templates rendering</li>
      </ul>
    </div>

    <h3>Next Steps:</h3>
    <ol>
      <li>Create reminders in your e-Khata app</li>
      <li>Enable email notifications when creating reminders</li>
      <li>Test the "Send Test Notification" feature</li>
      <li>Wait for automatic reminders from the scheduler</li>
    </ol>

    <p>
      <strong>🔔 Reminder System Status:</strong><br>
      The scheduler is running and will check for upcoming reminders every 15 minutes.
      You'll receive email notifications before your reminders are due!
    </p>
  </div>
  <div class="footer">
    <p>This is a test email from e-Khata Expense Manager</p>
    <p>If you received this, your email configuration is perfect! 🎊</p>
  </div>
</body>
</html>
`;

// Send test email
async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'e-Khata'}" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ e-Khata Email Configuration Test - Success!',
      html: emailHtml,
      text: 'Your e-Khata email configuration is working! You should see a nicely formatted HTML email.'
    });

    console.log('✅ SUCCESS! Test email sent successfully!\n');
    console.log('Email Details:');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  To: ${testEmail}`);
    console.log(`  From: ${process.env.SMTP_USER}`);
    console.log('\n📬 Check your inbox (and spam folder)!');
    console.log('   You should receive a beautifully formatted test email.\n');
    console.log('🎉 Your email configuration is working perfectly!\n');
    console.log('Next: Create reminders in your app and enable email notifications.\n');
  } catch (error) {
    console.error('❌ FAILED! Could not send email.\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    
    if (error.message.includes('Invalid login')) {
      console.error('  → Issue: Invalid login credentials');
      console.error('  → Solution: Make sure you are using an App Password, not your regular Gmail password');
      console.error('  → See TEST_EMAIL_SETUP.md for instructions on generating an App Password');
    } else if (error.message.includes('timeout')) {
      console.error('  → Issue: Connection timeout');
      console.error('  → Solution: Check your internet connection or try SMTP_PORT=465');
    } else if (error.message.includes('authentication')) {
      console.error('  → Issue: Authentication failed');
      console.error('  → Solution: Regenerate your App Password and update .env file');
    } else {
      console.error('  → Check TEST_EMAIL_SETUP.md for more troubleshooting tips');
    }
    console.error('');
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
