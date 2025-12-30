import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Health: '#22c55e',
  Education: '#6366f1',
  Other: '#6b7280',
};

const Charts = ({ expenses }) => {
  // Calculate category-wise totals
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-gray-500 dark:text-gray-400 py-8"
      >
        No expenses to display. Add some expenses to see the chart.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Expense Breakdown</h2>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-4 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">Total Expenses</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{totalExpenses.toFixed(2)}</p>
      </motion.div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category] || COLORS.Other} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 grid grid-cols-2 gap-2"
      >
        {categoryData.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: COLORS[item.category] }}
            />
            <span className="text-sm text-gray-700">
              {item.category}: ₹{item.amount.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Charts;
