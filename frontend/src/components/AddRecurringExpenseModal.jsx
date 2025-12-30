import { useState, useContext, useEffect } from 'react';
import { RecurringExpenseContext } from '../context/RecurringExpenseContext';

const AddRecurringExpenseModal = ({ isOpen, onClose, editRecurring = null }) => {
  const { addRecurringExpense, updateRecurringExpense } = useContext(RecurringExpenseContext);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    frequency: 'monthly',
    nextDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRecurring) {
      setFormData({
        title: editRecurring.title,
        amount: editRecurring.amount,
        category: editRecurring.category,
        frequency: editRecurring.frequency,
        nextDate: new Date(editRecurring.nextDate).toISOString().split('T')[0],
        notes: editRecurring.notes || '',
      });
    } else {
      // Reset form when modal is opened for new entry
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        frequency: 'monthly',
        nextDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [editRecurring, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      const result = editRecurring
        ? await updateRecurringExpense(editRecurring._id, formData)
        : await addRecurringExpense(formData);

      if (result.success) {
        setFormData({
          title: '',
          amount: '',
          category: 'Food',
          frequency: 'monthly',
          nextDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
  const frequencies = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '📊' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {editRecurring ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Netflix Subscription"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Frequency *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frequencies.map((freq) => (
                  <label
                    key={freq.value}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                      formData.frequency === freq.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={freq.value}
                      checked={formData.frequency === freq.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-xl">{freq.icon}</span>
                    <span className="font-medium">{freq.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Next Date */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Next Occurrence Date *
              </label>
              <input
                type="date"
                name="nextDate"
                value={formData.nextDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : editRecurring ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRecurringExpenseModal;
