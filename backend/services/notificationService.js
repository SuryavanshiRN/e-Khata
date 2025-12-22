const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // OneSignal configuration (for push notifications)
    this.oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    this.oneSignalApiKey = process.env.ONESIGNAL_API_KEY;
    
    // FCM configuration (Firebase Cloud Messaging)
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
  }

  /**
   * Send reminder notification via configured channels
   * @param {Object} reminder - Reminder object
   * @param {Object} user - User object
   * @returns {Object} Notification result
   */
  async sendReminder(reminder, user) {
    const results = {
      email: null,
      push: null,
      inApp: null,
      success: false
    };

    try {
      // Send email notification
      if (reminder.notificationChannels.email) {
        // Use reminder's custom email if provided, otherwise use user's email
        const emailTo = reminder.notificationEmail || user.email;
        console.log(`📧 Sending email to: ${emailTo} (Custom: ${reminder.notificationEmail || 'None'}, User: ${user.email})`);
        if (emailTo) {
          results.email = await this.sendEmailNotification(reminder, user, emailTo);
        }
      }

      // Send push notification
      if (reminder.notificationChannels.push) {
        results.push = await this.sendPushNotification(reminder, user);
      }

      // In-app notification (stored in DB for display in app)
      if (reminder.notificationChannels.inApp) {
        results.inApp = await this.createInAppNotification(reminder, user);
      }

      results.success = true;
      return results;
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(reminder, user, emailTo) {
    try {
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(reminder.amount);

      const mailOptions = {
        from: `"Expense Manager" <${process.env.SMTP_USER}>`,
        to: emailTo, // Use the custom email parameter
        subject: `💰 Reminder: ${reminder.title} - ${formattedAmount} due soon`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .reminder-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .amount { font-size: 28px; font-weight: bold; color: #14B8A6; }
              .due-date { font-size: 18px; color: #666; margin: 10px 0; }
              .type-badge { display: inline-block; padding: 5px 15px; background: #06B6D4; color: white; border-radius: 20px; font-size: 12px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 12px 30px; background: #14B8A6; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Payment Reminder</h1>
              </div>
              <div class="content">
                <div class="reminder-card">
                  <h2>${reminder.title}</h2>
                  <span class="type-badge">${reminder.type.toUpperCase()}</span>
                  <div class="amount">${formattedAmount}</div>
                  <div class="due-date">📅 Due: ${formattedDate}</div>
                  ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
                  ${reminder.isRecurring ? `<p>🔄 Recurring: ${reminder.repeat}</p>` : ''}
                </div>
                <p>Hello ${user.name},</p>
                <p>This is a friendly reminder that you have an upcoming payment.</p>
                <p>Please ensure you have sufficient funds available to avoid any late fees or service disruptions.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reminders" class="button">View Reminders</a>
              </div>
              <div class="footer">
                <p>This is an automated reminder from Expense Manager</p>
                <p>To manage your reminder settings, visit the Reminders page in the app</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ Email notification sent successfully to: ${emailTo}`);
      console.log(`   Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, sentTo: emailTo };
    } catch (error) {
      console.error(`❌ Email notification error (to: ${emailTo}):`, error.message);
      return { success: false, error: error.message, attemptedEmail: emailTo };
    }
  }

  /**
   * Send push notification via OneSignal
   */
  async sendPushNotification(reminder, user) {
    if (!this.oneSignalAppId || !this.oneSignalApiKey) {
      console.log('OneSignal not configured, skipping push notification');
      return { success: false, error: 'OneSignal not configured' };
    }

    try {
      const axios = require('axios');
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(reminder.amount);

      const notification = {
        app_id: this.oneSignalAppId,
        filters: [
          { field: 'tag', key: 'userId', relation: '=', value: user._id.toString() }
        ],
        headings: { en: '💰 Payment Reminder' },
        contents: { 
          en: `${reminder.title} - ${formattedAmount} due on ${new Date(dueDate).toLocaleDateString()}` 
        },
        data: {
          type: 'reminder',
          reminderId: reminder._id.toString(),
          url: '/reminders'
        }
      };

      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        notification,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.oneSignalApiKey}`
          }
        }
      );

      console.log('Push notification sent:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Push notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification via FCM (Firebase)
   */
  async sendFCMNotification(reminder, user, fcmToken) {
    if (!this.fcmServerKey || !fcmToken) {
      console.log('FCM not configured or no token, skipping push notification');
      return { success: false, error: 'FCM not configured' };
    }

    try {
      const axios = require('axios');
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(reminder.amount);

      const notification = {
        to: fcmToken,
        notification: {
          title: '💰 Payment Reminder',
          body: `${reminder.title} - ${formattedAmount} due on ${new Date(dueDate).toLocaleDateString()}`,
          icon: '/icon.png',
          click_action: process.env.FRONTEND_URL + '/reminders'
        },
        data: {
          type: 'reminder',
          reminderId: reminder._id.toString()
        }
      };

      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        notification,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${this.fcmServerKey}`
          }
        }
      );

      console.log('FCM notification sent:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('FCM notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create in-app notification (stored in database)
   */
  async createInAppNotification(reminder, user) {
    try {
      const Notification = require('../models/Notification');
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      
      const notification = await Notification.create({
        user: user._id,
        type: 'reminder',
        title: `Payment Reminder: ${reminder.title}`,
        message: `${reminder.title} (₹${reminder.amount}) is due on ${new Date(dueDate).toLocaleDateString()}`,
        relatedId: reminder._id,
        relatedType: 'Reminder',
        priority: reminder.isOverdue ? 'high' : 'normal'
      });

      console.log('In-app notification created:', notification._id);
      return { success: true, notificationId: notification._id };
    } catch (error) {
      console.error('In-app notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(email) {
    try {
      const mailOptions = {
        from: `"Expense Manager" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '✅ Email Notifications Configured Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #14B8A6;">✅ Email Setup Complete!</h2>
            <p>Your email notifications are now configured and working correctly.</p>
            <p>You'll receive reminders for upcoming bills, EMIs, and other payments.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email from Expense Manager</p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Test email error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
