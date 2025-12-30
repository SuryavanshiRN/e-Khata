const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const notificationService = require('./notificationService');

class ReminderScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all scheduled jobs
   */
  startAll() {
    // Check for due reminders every 15 minutes
    const reminderCheckJob = cron.schedule('*/15 * * * *', async () => {
      await this.checkDueReminders();
    });

    // Cleanup old notifications daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    this.jobs.push(
      { name: 'reminderCheck', job: reminderCheckJob },
      { name: 'cleanup', job: cleanupJob }
    );

    console.log('✅ Reminder scheduler started:');
    console.log('  - Checking reminders every 15 minutes');
    console.log('  - Cleanup old notifications daily at 2 AM');
  }

  /**
   * Check for reminders that are due soon
   */
  async checkDueReminders() {
    try {
      const now = new Date();
      const checkWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Next 2 hours

      // Find active reminders due within the check window
      const reminders = await Reminder.find({
        status: 'active',
        $or: [
          { nextDueDate: { $gte: now, $lte: checkWindow } },
          { 
            nextDueDate: { $exists: false },
            dueDate: { $gte: now, $lte: checkWindow }
          }
        ]
      });

      console.log(`Found ${reminders.length} reminders to check`);

      for (const reminder of reminders) {
        await this.processReminder(reminder);
      }
    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  }

  /**
   * Process individual reminder
   */
  async processReminder(reminder) {
    try {
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      const now = new Date();
      const minutesUntilDue = Math.floor((dueDate - now) / (1000 * 60));

      // Check if we should send notification based on reminderTime setting
      const shouldNotify = minutesUntilDue <= reminder.reminderTime;
      
      // Don't send if we already sent notification recently (within 12 hours)
      if (reminder.lastNotificationSent) {
        const hoursSinceLastNotification = (now - reminder.lastNotificationSent) / (1000 * 60 * 60);
        if (hoursSinceLastNotification < 12) {
          console.log(`Skipping reminder ${reminder._id} - notification sent ${hoursSinceLastNotification.toFixed(1)} hours ago`);
          return;
        }
      }

      if (shouldNotify) {
        // Get user
        const user = await User.findById(reminder.user);
        if (!user) {
          console.error(`User not found for reminder ${reminder._id}`);
          return;
        }

        // Send notification
        console.log(`Sending reminder notification for: ${reminder.title} (due in ${minutesUntilDue} minutes)`);
        const result = await notificationService.sendReminder(reminder, user);

        if (result.success) {
          // Update last notification sent time
          reminder.lastNotificationSent = now;
          await reminder.save();
          console.log(`✅ Reminder notification sent successfully for: ${reminder.title}`);
        } else {
          console.error(`❌ Failed to send reminder notification for: ${reminder.title}`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error processing reminder ${reminder._id}:`, error);
    }
  }

  /**
   * Cleanup old read notifications (older than 30 days)
   */
  async cleanupOldNotifications() {
    try {
      const Notification = require('../models/Notification');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        isRead: true,
        readAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs = [];
  }

  /**
   * Manually trigger reminder check (for testing)
   */
  async triggerReminderCheck() {
    console.log('Manually triggering reminder check...');
    await this.checkDueReminders();
  }
}

module.exports = new ReminderScheduler();
