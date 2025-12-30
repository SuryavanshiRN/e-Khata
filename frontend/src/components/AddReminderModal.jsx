import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReminder, updateReminder } from '../api/reminders';

const AddReminderModal = ({ isOpen, onClose, onSuccess, reminder }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dueDate: '',
    repeat: 'none',
    type: 'bill',
    reminderTime: 60,
    notificationChannels: {
      email: true,
      push: false,
      inApp: true
    },
    notificationEmail: '', // Add custom email field
    notes: '',
    category: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || '',
        amount: reminder.amount || '',
        dueDate: reminder.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : '',
        repeat: reminder.repeat || 'none',
        type: reminder.type || 'bill',
        reminderTime: reminder.reminderTime || 60,
        notificationChannels: reminder.notificationChannels || {
          email: true,
          push: false,
          inApp: true
        },
        notificationEmail: reminder.notificationEmail || '',
        notes: reminder.notes || '',
        category: reminder.category || ''
      });
    }
  }, [reminder]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        amount: '',
        dueDate: '',
        repeat: 'none',
        type: 'bill',
        reminderTime: 60,
        notificationChannels: {
          email: true,
          push: false,
          inApp: true
        },
        notificationEmail: '',
        notes: '',
        category: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.amount || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.amount < 0) {
      setError('Amount must be positive');
      return;
    }

    if (new Date(formData.dueDate) < new Date() && !reminder) {
      setError('Due date cannot be in the past');
      return;
    }

    try {
      setLoading(true);
      if (reminder) {
        await updateReminder(reminder._id, formData);
      } else {
        await createReminder(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Create/Update reminder error:', error);
      setError(error.response?.data?.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      notificationChannels: {
        ...prev.notificationChannels,
        [channel]: !prev.notificationChannels[channel]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {reminder ? '✏️ Edit Reminder' : '🔔 Add New Reminder'}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Electricity Bill, Home Loan EMI"
                  required
                />
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="2000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="bill">Bill</option>
                    <option value="emi">EMI</option>
                    <option value="subscription">Subscription</option>
                    <option value="payment">Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Repeat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repeat
                  </label>
                  <select
                    value={formData.repeat}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Category & Reminder Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Utilities, Loans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remind Me (minutes before)
                  </label>
                  <select
                    value={formData.reminderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="1440">1 day</option>
                    <option value="2880">2 days</option>
                    <option value="10080">1 week</option>
                  </select>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Notification Channels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.email}
                      onChange={() => handleChannelToggle('email')}
                      className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">📧 Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.push}
                      onChange={() => handleChannelToggle('push')}
                      className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">📱 Push Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.inApp}
                      onChange={() => handleChannelToggle('inApp')}
                      className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">🔔 In-App Notifications</span>
                  </label>
                </div>
                
                {/* Email Address Field - Shows when email is enabled */}
                {formData.notificationChannels.email && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.notificationEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, notificationEmail: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your-email@example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      💡 Leave empty to use your account email. Add a custom email to send reminders to others.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </span>
                ) : (
                  reminder ? 'Update Reminder' : 'Create Reminder'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddReminderModal;
