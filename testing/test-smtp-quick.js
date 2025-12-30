#!/usr/bin/env node
/**
 * Minimal SMTP Connection Test
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🔧 SMTP Configuration Test');
console.log('==========================');
console.log(`Host: ${process.env.SMTP_HOST}`);
console.log(`Port: ${process.env.SMTP_PORT}`);
console.log(`User: ${process.env.SMTP_USER}`);
console.log(`Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
console.log(`Pass Length: ${process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0} chars`);
console.log('\n🔄 Testing SMTP connection...\n');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection FAILED');
    console.error('\nError Details:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Verify App Password is correct (16 chars, no spaces)');
    console.error('  2. Check if 2-Step Verification is enabled on Gmail');
    console.error('  3. Regenerate App Password if needed');
    console.error('  4. Make sure you copied the ENTIRE password');
    console.error('\n📝 Your current password ends with: ***' + process.env.SMTP_PASS.slice(-4));
    console.error('   Expected format: 16 characters, letters only, no spaces');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection SUCCESSFUL!');
    console.log('\n📧 Now testing actual email send...\n');
    
    const testEmail = process.argv[2] || process.env.SMTP_USER;
    
    transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ e-Khata SMTP Test - Success!',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>✅ SMTP Working!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px;">
            <h2>Connection Successful</h2>
            <p>Your SMTP configuration is working correctly!</p>
            <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
            <p><strong>To:</strong> ${testEmail}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>✅ You can now receive reminder notifications!</p>
          </div>
        </div>
      `
    }, (err, info) => {
      if (err) {
        console.error('❌ Failed to send test email');
        console.error(err.message);
        process.exit(1);
      }
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Sent to: ${testEmail}`);
      console.log('\n📬 Check your inbox!\n');
      process.exit(0);
    });
  }
});
