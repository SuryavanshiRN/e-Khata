import { useContext } from 'react';
import { RecurringExpenseContext } from '../context/RecurringExpenseContext';

const RecurringExpenseCard = ({ recurringExpense, onEdit }) => {
  const { deleteRecurringExpense, toggleRecurringExpense } = useContext(RecurringExpenseContext);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      const result = await deleteRecurringExpense(recurringExpense._id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggle = async () => {
    const result = await toggleRecurringExpense(recurringExpense._id);
    if (!result.success) {
      alert(result.error);
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
      Food: 'bg-red-100 text-red-800',
      Transport: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-teal-100 text-teal-800',
      Shopping: 'bg-pink-100 text-pink-800',
      Bills: 'bg-yellow-100 text-yellow-800',
      Health: 'bg-green-100 text-green-800',
      Education: 'bg-indigo-100 text-indigo-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Other;
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      daily: '📅',
      weekly: '📆',
      monthly: '🗓️',
      yearly: '📊',
    };
    return icons[frequency] || '🔄';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      daily: 'bg-orange-100 text-orange-800',
      weekly: 'bg-cyan-100 text-cyan-800',
      monthly: 'bg-blue-100 text-blue-800',
      yearly: 'bg-teal-100 text-teal-800',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition ${!recurringExpense.isActive ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-800">{recurringExpense.title}</h3>
            {!recurringExpense.isActive && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Paused</span>
            )}
          </div>
          <p className="text-sm text-gray-500">Next: {formatDate(recurringExpense.nextDate)}</p>
        </div>
        <span className="text-xl font-bold text-red-600">₹{recurringExpense.amount}</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(recurringExpense.category)}`}>
            {recurringExpense.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getFrequencyColor(recurringExpense.frequency)}`}>
            <span>{getFrequencyIcon(recurringExpense.frequency)}</span>
            {recurringExpense.frequency}
          </span>
        </div>
      </div>

      {recurringExpense.notes && (
        <p className="text-sm text-gray-600 mb-3 border-t pt-2">{recurringExpense.notes}</p>
      )}

      <div className="flex gap-2 border-t pt-3">
        <button
          onClick={handleToggle}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${
            recurringExpense.isActive
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {recurringExpense.isActive ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => onEdit(recurringExpense)}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-200 transition"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-200 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecurringExpenseCard;
