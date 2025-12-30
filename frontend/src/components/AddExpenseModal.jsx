import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpenseContext } from '../context/ExpenseContext';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
const commonTags = ['urgent', 'recurring', 'weekend', 'business', 'personal', 'gift', 'online', 'cash'];

const AddExpenseModal = ({ isOpen, onClose, editExpense, aiDetectedExpense }) => {
  const { addExpense, editExpense: updateExpense } = useContext(ExpenseContext);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editExpense) {
      setFormData({
        title: editExpense.title,
        amount: editExpense.amount,
        category: editExpense.category,
        date: new Date(editExpense.date).toISOString().split('T')[0],
        description: editExpense.description || '',
        tags: editExpense.tags || [],
      });
    } else if (aiDetectedExpense) {
      // Pre-fill with AI detected data
      setFormData({
        title: aiDetectedExpense.title || '',
        amount: aiDetectedExpense.amount || '',
        category: aiDetectedExpense.category || 'Food',
        date: aiDetectedExpense.date || new Date().toISOString().split('T')[0],
        description: aiDetectedExpense.description || '',
        tags: aiDetectedExpense.tags || [],
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
        tags: [],
      });
    }
    setTagInput('');
  }, [editExpense, aiDetectedExpense, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = editExpense
      ? await updateExpense(editExpense._id, formData)
      : await addExpense(formData);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold dark:text-gray-100">
                {editExpense ? 'Edit Expense' : aiDetectedExpense ? 'Review AI Suggestion' : 'Add New Expense'}
              </h2>
              {aiDetectedExpense && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 text-xs font-semibold rounded-full"
                >
                  AI Detected
                </motion.span>
              )}
            </div>
            
            {aiDetectedExpense && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 We've automatically filled in the details. Please review and edit if needed.
                </p>
              </motion.div>
            )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Tags Section */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Tags (Optional)
            </label>
            
            {/* Selected Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Type and press Enter to add custom tags"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 mb-2"
            />

            {/* Common Tags */}
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.tags.includes(tag)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows="3"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition shadow-button"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-button hover:shadow-button-hover"
            >
              {editExpense ? 'Update' : 'Add'} Expense
            </motion.button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;
