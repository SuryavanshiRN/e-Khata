import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReminders, deleteReminder, pauseReminder, resumeReminder, completeReminder, testNotification } from '../api/reminders';
import AddReminderModal from '../components/AddReminderModal';
import { useTranslation } from 'react-i18next';

const Reminders = () => {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, overdue, upcoming
  const [view, setView] = useState('list'); // list or calendar

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await getReminders();
      setReminders(response.data);
      setSummary(response.summary);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await deleteReminder(id);
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder');
    }
  };

  const handlePause = async (id) => {
    try {
      await pauseReminder(id);
      fetchReminders();
    } catch (error) {
      console.error('Error pausing reminder:', error);
      alert('Failed to pause reminder');
    }
  };

  const handleResume = async (id) => {
    try {
      await resumeReminder(id);
      fetchReminders();
    } catch (error) {
      console.error('Error resuming reminder:', error);
      alert('Failed to resume reminder');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeReminder(id);
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Failed to complete reminder');
    }
  };

  const handleTestNotification = async (id) => {
    try {
      // Find the reminder to get its notification email
      const reminder = reminders.find(r => r._id === id);
      const emailTo = reminder?.notificationEmail || 'your registered email';
      
      const response = await testNotification(id);
      
      // Show the actual email where notification was sent
      alert(`✅ Test notification sent! Check email at: ${emailTo}`);
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert(error.response?.data?.message || 'Failed to send test notification');
    }
  };

  const handleEdit = (reminder) => {
    setSelectedReminder(reminder);
    setShowAddModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeUntilDue = (reminder) => {
    const dueDate = new Date(reminder.nextDueDate || reminder.dueDate);
    const now = new Date();
    const diff = dueDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-red-600 dark:text-red-400' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400' };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'text-blue-600 dark:text-blue-400' };
    return { text: `Due in ${days} days`, color: 'text-gray-600 dark:text-gray-400' };
  };

  const getTypeIcon = (type) => {
    const icons = {
      bill: '💡',
      emi: '🏠',
      subscription: '📱',
      payment: '💳',
      other: '📝'
    };
    return icons[type] || '📝';
  };

  const getTypeColor = (type) => {
    const colors = {
      bill: 'from-yellow-500 to-orange-500',
      emi: 'from-blue-500 to-cyan-500',
      subscription: 'from-purple-500 to-pink-500',
      payment: 'from-green-500 to-teal-500',
      other: 'from-gray-500 to-gray-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'active') return reminder.status === 'active';
    if (filter === 'overdue') return reminder.isOverdue;
    if (filter === 'upcoming') {
      const days = reminder.daysUntilDue;
      return reminder.status === 'active' && days >= 0 && days <= 7;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔔 Reminders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Never miss a payment with smart reminders
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedReminder(null);
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            ➕ Add Reminder
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.active}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.overdue}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">This Week</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.upcomingThisWeek}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(summary.totalAmount)}
              </p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'active', 'overdue', 'upcoming'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Reminders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredReminders.map((reminder, index) => {
              const timeUntil = getTimeUntilDue(reminder);
              
              return (
                <motion.div
                  key={reminder._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${getTypeColor(reminder.type)} p-4`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getTypeIcon(reminder.type)}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">{reminder.title}</h3>
                          <p className="text-sm text-white/80 capitalize">{reminder.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {reminder.status === 'active' && (
                          <button
                            onClick={() => handlePause(reminder._id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Pause"
                          >
                            ⏸️
                          </button>
                        )}
                        {reminder.status === 'paused' && (
                          <button
                            onClick={() => handleResume(reminder._id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Resume"
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Amount and Due Date */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(reminder.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatDate(reminder.nextDueDate || reminder.dueDate)}
                        </p>
                        <p className={`text-sm font-medium ${timeUntil.color}`}>
                          {timeUntil.text}
                        </p>
                      </div>
                    </div>

                    {/* Status and Repeat */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reminder.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        reminder.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                      }`}>
                        {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                      </span>
                      
                      {reminder.repeat !== 'none' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          🔄 {reminder.repeat.charAt(0).toUpperCase() + reminder.repeat.slice(1)}
                        </span>
                      )}

                      {reminder.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {reminder.category}
                        </span>
                      )}
                    </div>

                    {/* Notification Channels */}
                    <div className="flex gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {reminder.notificationChannels.email && <span>📧</span>}
                      {reminder.notificationChannels.push && <span>📱</span>}
                      {reminder.notificationChannels.inApp && <span>🔔</span>}
                      {reminder.notificationEmail && (
                        <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
                          → {reminder.notificationEmail}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {reminder.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        📝 {reminder.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestNotification(reminder._id)}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                        title="Send test notification"
                      >
                        🔔 Test
                      </button>
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      {reminder.status === 'active' && (
                        <button
                          onClick={() => handleComplete(reminder._id)}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          ✅ Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredReminders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Reminders Yet' : `No ${filter} Reminders`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Create your first reminder to stay on top of payments'
                : `You don't have any ${filter} reminders`
              }
            </p>
            {filter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                ➕ Add Your First Reminder
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Add/Edit Reminder Modal */}
      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedReminder(null);
        }}
        onSuccess={() => {
          fetchReminders();
          setShowAddModal(false);
          setSelectedReminder(null);
        }}
        reminder={selectedReminder}
      />
    </div>
  );
};

export default Reminders;
