#!/usr/bin/env node
/**
 * Direct Email Test - Tests SMTP without reminder creation
 * Usage: node test-direct-email.js recipient@email.com
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Usage: node test-direct-email.js recipient@email.com');
  process.exit(1);
}

console.log('\n📧 Testing Direct Email Send');
console.log('=====================================');
console.log(`From: ${process.env.SMTP_USER}`);
console.log(`To: ${recipientEmail}`);
console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
console.log('\n🔄 Sending...\n');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

const mailOptions = {
  from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
  to: recipientEmail,
  subject: '✅ Direct Email Test from e-Khata',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Email Test Successful!</h1>
        </div>
        <div class="content">
          <h2>Direct SMTP Test</h2>
          <p>This email was sent directly using Node.js and Nodemailer.</p>
          <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>To:</strong> ${recipientEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this, your SMTP configuration is working perfectly! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `Email Test Successful! Sent from ${process.env.SMTP_USER} to ${recipientEmail}`
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('\n❌ FAILED to send email');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Check SMTP_PASS in .env (no spaces!)');
    console.error('  2. Verify Gmail App Password is correct');
    console.error('  3. Check internet connection');
    console.error('  4. Ensure 2-Step Verification is enabled on Gmail');
    process.exit(1);
  }

  console.log('\n✅ SUCCESS! Email sent');
  console.log(`Message ID: ${info.messageId}`);
  console.log(`Accepted: ${info.accepted.join(', ')}`);
  console.log(`\n📬 Check inbox at: ${recipientEmail}`);
  console.log('\nIf you received the email, your SMTP is working!\n');
  process.exit(0);
});
