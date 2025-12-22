import { useContext } from 'react';
import { motion } from 'framer-motion';
import { ExpenseContext } from '../context/ExpenseContext';

const ExpenseCard = ({ expense, onEdit }) => {
  const { removeExpense } = useContext(ExpenseContext);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const result = await removeExpense(expense._id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-gradient-danger-soft text-red-700 dark:text-red-300 border border-red-200/30 dark:border-red-800/30',
      Transport: 'bg-gradient-info-soft text-blue-700 dark:text-blue-300 border border-blue-200/30 dark:border-blue-800/30',
      Entertainment: 'bg-gradient-primary-soft text-teal-700 dark:text-teal-300 border border-teal-200/30 dark:border-teal-800/30',
      Shopping: 'bg-gradient-warning-soft text-pink-700 dark:text-pink-300 border border-pink-200/30 dark:border-pink-800/30',
      Bills: 'bg-gradient-warning-soft text-yellow-700 dark:text-yellow-300 border border-yellow-200/30 dark:border-yellow-800/30',
      Health: 'bg-gradient-success-soft text-green-700 dark:text-green-300 border border-green-200/30 dark:border-green-800/30',
      Education: 'bg-gradient-info-soft text-indigo-700 dark:text-indigo-300 border border-indigo-200/30 dark:border-indigo-800/30',
      Other: 'bg-gradient-light text-gray-700 dark:text-gray-300 border border-gray-200/30 dark:border-gray-700/30',
    };
    return colors[category] || colors.Other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden group"
    >
      {/* Radial highlight overlay */}
      <div className="absolute inset-0 bg-radial-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Glass card with gradient */}
      <motion.div
        whileHover={{ boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.5)' }}
        transition={{ duration: 0.3 }}
        className="relative glass-card rounded-lg p-4 shadow-card hover:shadow-card-hover transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{expense.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(expense.date)}</p>
          </div>
          <span className="text-xl font-bold bg-gradient-success bg-clip-text text-transparent">₹{expense.amount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getCategoryColor(expense.category)}`}>
            {expense.category}
          </span>
          <div className="flex gap-2">
            <motion.button
              onClick={() => onEdit(expense)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1 rounded-md bg-gradient-info-soft text-blue-700 dark:text-blue-300 hover:bg-gradient-info hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-blue-200/30 shadow-button hover:shadow-button-hover"
            >
              Edit
            </motion.button>
            <motion.button
              onClick={handleDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1 rounded-md bg-gradient-danger-soft text-red-700 dark:text-red-300 hover:bg-gradient-danger hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-red-200/30 shadow-button hover:shadow-button-hover"
            >
              Delete
            </motion.button>
          </div>
        </div>

        {/* Tags Display */}
        {expense.tags && expense.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {expense.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-info-soft backdrop-blur-sm text-blue-700 dark:text-blue-300 border border-blue-200/30 dark:border-blue-700/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Description */}
        {expense.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ExpenseCard;
