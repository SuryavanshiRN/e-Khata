import { useState, useContext } from 'react';
import { IncomeContext } from '../context/IncomeContext';

const IncomeCard = ({ income, onEdit }) => {
  const { deleteIncome } = useContext(IncomeContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      const result = await deleteIncome(income._id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sourceColors = {
    Salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Freelance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Business: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    Investment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };

  const sourceIcons = {
    Salary: '💼',
    Freelance: '💻',
    Business: '🏢',
    Investment: '📈',
    Gift: '🎁',
    Other: '💰'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition relative">
      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-10 right-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg z-10 w-32">
          <button
            onClick={() => {
              onEdit(income);
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm dark:text-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 text-sm"
          >
            Delete
          </button>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sourceIcons[income.source] || '💰'}</span>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{income.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(income.date)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sourceColors[income.source] || sourceColors.Other}`}>
          {income.source}
        </span>
        <span className="text-xl font-bold text-green-600 dark:text-green-400">
          +₹{income.amount.toLocaleString()}
        </span>
      </div>

      {income.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic border-t dark:border-gray-700 pt-2">
          {income.description}
        </p>
      )}
    </div>
  );
};

export default IncomeCard;
