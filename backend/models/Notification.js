const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'budget', 'milestone', 'system', 'alert'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    enum: ['Reminder', 'Budget', 'Expense', 'SIP', null]
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }); // For cleanup of old notifications

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
