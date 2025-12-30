const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  pauseReminder,
  resumeReminder,
  completeReminder,
  deleteReminder,
  testNotification,
  getUpcomingReminders
} = require('../controllers/reminderController');

// Get upcoming reminders (dashboard widget) - must be before /:id routes
router.get('/upcoming/dashboard', protect, getUpcomingReminders);

// CRUD operations
router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.get('/:id', protect, getReminder);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

// State management
router.put('/:id/pause', protect, pauseReminder);
router.put('/:id/resume', protect, resumeReminder);
router.put('/:id/complete', protect, completeReminder);

// Testing
router.post('/:id/test-notification', protect, testNotification);

module.exports = router;
