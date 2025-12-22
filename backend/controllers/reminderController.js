const Reminder = require('../models/Reminder');
const notificationService = require('../services/notificationService');

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
  try {
    const { title, amount, dueDate, repeat, type, reminderTime, notificationChannels, notes, category, notificationEmail } = req.body;

    // Validation
    if (!title || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, and due date'
      });
    }

    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be in the past'
      });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      title,
      amount,
      dueDate,
      repeat: repeat || 'none',
      type: type || 'bill',
      reminderTime: reminderTime || 60,
      notificationChannels: notificationChannels || { email: true, push: false, inApp: true },
      notificationEmail: notificationEmail || null, // Add custom email
      notes,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create reminder'
    });
  }
};

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;

    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    let reminders = await Reminder.find(query).sort({ dueDate: 1 });

    // Filter upcoming reminders (next 30 days)
    if (upcoming === 'true') {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      reminders = reminders.filter(reminder => {
        const dueDate = reminder.nextDueDate || reminder.dueDate;
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
      });
    }

    // Calculate summary statistics
    const summary = {
      total: reminders.length,
      active: reminders.filter(r => r.status === 'active').length,
      paused: reminders.filter(r => r.status === 'paused').length,
      overdue: reminders.filter(r => r.isOverdue).length,
      totalAmount: reminders
        .filter(r => r.status === 'active')
        .reduce((sum, r) => sum + r.amount, 0),
      upcomingThisWeek: reminders.filter(r => {
        const dueDate = r.nextDueDate || r.dueDate;
        const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        return r.status === 'active' && daysUntilDue >= 0 && daysUntilDue <= 7;
      }).length
    };

    res.json({
      success: true,
      count: reminders.length,
      summary,
      data: reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
exports.getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder'
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res) => {
  try {
    const { title, amount, dueDate, repeat, type, reminderTime, notificationChannels, notes, category, status } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Update fields
    if (title) reminder.title = title;
    if (amount !== undefined) reminder.amount = amount;
    if (dueDate) {
      if (new Date(dueDate) < new Date() && reminder.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Due date cannot be in the past for active reminders'
        });
      }
      reminder.dueDate = dueDate;
      if (reminder.isRecurring) {
        reminder.nextDueDate = dueDate;
      }
    }
    if (repeat) reminder.repeat = repeat;
    if (type) reminder.type = type;
    if (reminderTime !== undefined) reminder.reminderTime = reminderTime;
    if (notificationChannels) reminder.notificationChannels = notificationChannels;
    if (notes !== undefined) reminder.notes = notes;
    if (category) reminder.category = category;
    if (status) reminder.status = status;

    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update reminder'
    });
  }
};

// @desc    Pause reminder
// @route   PUT /api/reminders/:id/pause
// @access  Private
exports.pauseReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.status = 'paused';
    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder paused',
      data: reminder
    });
  } catch (error) {
    console.error('Pause reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause reminder'
    });
  }
};

// @desc    Resume reminder
// @route   PUT /api/reminders/:id/resume
// @access  Private
exports.resumeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.status = 'active';
    reminder.lastNotificationSent = null; // Reset notification flag
    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder resumed',
      data: reminder
    });
  } catch (error) {
    console.error('Resume reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume reminder'
    });
  }
};

// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.markCompleted();

    res.json({
      success: true,
      message: reminder.isRecurring 
        ? 'Reminder completed and next occurrence scheduled' 
        : 'Reminder marked as completed',
      data: reminder
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete reminder'
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder'
    });
  }
};

// @desc    Send test reminder notification
// @route   POST /api/reminders/:id/test-notification
// @access  Private
exports.testNotification = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    const result = await notificationService.sendReminder(reminder, user);

    res.json({
      success: true,
      message: 'Test notification sent',
      data: result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
};

// @desc    Get upcoming reminders (dashboard widget)
// @route   GET /api/reminders/upcoming/dashboard
// @access  Private
exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: req.user.id,
      status: 'active'
    }).sort({ dueDate: 1 }).limit(5);

    // Filter to only show reminders due within next 7 days
    const upcomingReminders = reminders
      .filter(reminder => {
        const dueDate = reminder.nextDueDate || reminder.dueDate;
        return dueDate >= now && dueDate <= sevenDaysFromNow;
      })
      .map(reminder => ({
        ...reminder.toObject(),
        dueDate: reminder.nextDueDate || reminder.dueDate
      }));

    res.json({
      success: true,
      count: upcomingReminders.length,
      data: upcomingReminders
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming reminders'
    });
  }
};
