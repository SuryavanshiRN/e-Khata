import { useState, useContext } from 'react';
import { RecurringExpenseContext } from '../context/RecurringExpenseContext';
import RecurringExpenseCard from '../components/RecurringExpenseCard';
import AddRecurringExpenseModal from '../components/AddRecurringExpenseModal';
import FloatingAdvisor from '../components/FloatingAdvisor';

const frequencies = ['All', 'daily', 'weekly', 'monthly', 'yearly'];

const RecurringExpenses = () => {
  const { recurringExpenses, loading } = useContext(RecurringExpenseContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('All');
  const [showActive, setShowActive] = useState('all'); // 'all', 'active', 'paused'

  const handleEdit = (recurring) => {
    setEditingRecurring(recurring);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecurring(null);
  };

  const filteredRecurring = recurringExpenses.filter((item) => {
    const frequencyMatch = selectedFrequency === 'All' || item.frequency === selectedFrequency;
    const activeMatch = 
      showActive === 'all' || 
      (showActive === 'active' && item.isActive) ||
      (showActive === 'paused' && !item.isActive);
    return frequencyMatch && activeMatch;
  });

  const activeCount = recurringExpenses.filter(item => item.isActive).length;
  const pausedCount = recurringExpenses.filter(item => !item.isActive).length;
  const totalMonthlyAmount = recurringExpenses
    .filter(item => item.isActive && item.frequency === 'monthly')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recurring Expenses</h1>
              <p className="text-cyan-100">Automate your regular payments</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-cyan-100 text-sm">Active</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
                <div>
                  <p className="text-cyan-100 text-sm">Paused</p>
                  <p className="text-2xl font-bold">{pausedCount}</p>
                </div>
                <div>
                  <p className="text-cyan-100 text-sm">Monthly Total</p>
                  <p className="text-2xl font-bold">₹{totalMonthlyAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
            >
              + New Recurring
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Frequency Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <div className="flex gap-2 flex-wrap">
                {frequencies.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSelectedFrequency(freq)}
                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                      selectedFrequency === freq
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowActive('all')}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    showActive === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setShowActive('active')}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    showActive === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowActive('paused')}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    showActive === 'paused'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Expenses List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Your Recurring Expenses ({filteredRecurring.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : filteredRecurring.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-gray-500 text-lg mb-2">No recurring expenses found</p>
              <p className="text-gray-400 text-sm mb-4">
                {selectedFrequency !== 'All' || showActive !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first recurring expense to get started'}
              </p>
              {selectedFrequency === 'All' && showActive === 'all' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
                >
                  + Add Recurring Expense
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecurring.map((recurring) => (
                <RecurringExpenseCard
                  key={recurring._id}
                  recurringExpense={recurring}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong> Recurring expenses are automatically converted to regular expenses on their scheduled date. 
                You can pause or resume them anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddRecurringExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editRecurring={editingRecurring}
      />

      {/* Floating AI Advisor */}
      <FloatingAdvisor />
    </div>
  );
};

export default RecurringExpenses;
