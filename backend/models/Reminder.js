const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  type: {
    type: String,
    enum: ['bill', 'emi', 'subscription', 'payment', 'other'],
    default: 'bill'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  reminderTime: {
    type: Number, // Minutes before due date to send reminder
    default: 60, // 1 hour before
    min: 0
  },
  notificationChannels: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  notificationEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  lastNotificationSent: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  completedDates: [{
    type: Date
  }],
  nextDueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
reminderSchema.index({ user: 1, status: 1 });
reminderSchema.index({ dueDate: 1, status: 1 });
reminderSchema.index({ nextDueDate: 1, status: 1 });

// Virtual for checking if reminder is overdue
reminderSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'active') return false;
  const dueDate = this.nextDueDate || this.dueDate;
  return new Date() > dueDate;
});

// Virtual for days until due
reminderSchema.virtual('daysUntilDue').get(function() {
  const dueDate = this.nextDueDate || this.dueDate;
  const diff = dueDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to calculate next due date for recurring reminders
reminderSchema.methods.calculateNextDueDate = function() {
  if (this.repeat === 'none') {
    return this.dueDate;
  }

  const currentDue = this.nextDueDate || this.dueDate;
  const nextDue = new Date(currentDue);

  switch (this.repeat) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }

  return nextDue;
};

// Method to mark reminder as completed
reminderSchema.methods.markCompleted = function() {
  this.completedDates.push(new Date());
  
  if (this.repeat !== 'none') {
    this.nextDueDate = this.calculateNextDueDate();
    this.lastNotificationSent = null; // Reset notification flag
  } else {
    this.status = 'completed';
  }
  
  return this.save();
};

// Pre-save middleware to set isRecurring and nextDueDate
reminderSchema.pre('save', function(next) {
  this.isRecurring = this.repeat !== 'none';
  
  if (!this.nextDueDate && this.isRecurring) {
    this.nextDueDate = this.dueDate;
  }
  
  next();
});

// Ensure virtuals are included in JSON
reminderSchema.set('toJSON', { virtuals: true });
reminderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reminder', reminderSchema);
