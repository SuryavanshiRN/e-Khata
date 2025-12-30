import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MetricsBar = ({ expenses = [], budgets = [] }) => {
  const [metrics, setMetrics] = useState({
    monthlySpend: 0,
    remainingBudget: 0,
    weeklyChange: 0,
    avgPerDay: 0,
    topCategory: { name: 'N/A', amount: 0 }
  });

  useEffect(() => {
    calculateMetrics();
  }, [expenses, budgets]);

  const calculateMetrics = () => {
    if (!expenses || expenses.length === 0) {
      setMetrics({
        monthlySpend: 0,
        remainingBudget: 0,
        weeklyChange: 0,
        avgPerDay: 0,
        topCategory: { name: 'N/A', amount: 0 }
      });
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses for current month
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    // Calculate monthly spend
    const monthlySpend = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate remaining budget
    const currentMonthBudget = budgets.find(b => {
      const budgetDate = new Date(b.month);
      return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
    });
    const totalBudget = currentMonthBudget?.totalBudget || 0;
    const remainingBudget = totalBudget - monthlySpend;

    // Calculate weekly change
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeekExpenses = monthlyExpenses.filter(exp => new Date(exp.date) >= oneWeekAgo);
    const lastWeekExpenses = monthlyExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= twoWeeksAgo && expDate < oneWeekAgo;
    });

    const thisWeekTotal = thisWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastWeekTotal = lastWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const weeklyChange = lastWeekTotal > 0 
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
      : 0;

    // Calculate average per day
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const avgPerDay = monthlySpend / daysInMonth;

    // Find top spending category
    const categoryTotals = {};
    monthlyExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategory = Object.entries(categoryTotals).length > 0
      ? Object.entries(categoryTotals).reduce((max, [cat, amt]) => 
          amt > max.amount ? { name: cat, amount: amt } : max,
          { name: 'N/A', amount: 0 }
        )
      : { name: 'N/A', amount: 0 };

    setMetrics({
      monthlySpend,
      remainingBudget,
      weeklyChange,
      avgPerDay,
      topCategory
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Food: '🍔',
      Transport: '🚗',
      Shopping: '🛍️',
      Entertainment: '🎬',
      Healthcare: '🏥',
      Bills: '📄',
      Education: '📚',
      Other: '💰'
    };
    return icons[category] || '💰';
  };

  const kpiCards = [
    {
      id: 1,
      title: 'Monthly Spend',
      value: formatCurrency(metrics.monthlySpend),
      icon: '💳',
      gradientClass: 'bg-gradient-primary-soft',
      iconBg: 'bg-teal-500',
      change: null
    },
    {
      id: 2,
      title: 'Remaining Budget',
      value: formatCurrency(metrics.remainingBudget),
      icon: '💰',
      gradientClass: metrics.remainingBudget >= 0 ? 'bg-gradient-success-soft' : 'bg-gradient-danger-soft',
      iconBg: metrics.remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500',
      change: null
    },
    {
      id: 3,
      title: 'Weekly Change',
      value: `${metrics.weeklyChange >= 0 ? '+' : ''}${metrics.weeklyChange.toFixed(1)}%`,
      icon: metrics.weeklyChange >= 0 ? '📈' : '📉',
      gradientClass: metrics.weeklyChange >= 0 ? 'bg-gradient-danger-soft' : 'bg-gradient-success-soft',
      iconBg: metrics.weeklyChange >= 0 ? 'bg-red-500' : 'bg-green-500',
      change: metrics.weeklyChange
    },
    {
      id: 4,
      title: 'Avg/Day',
      value: formatCurrency(metrics.avgPerDay),
      icon: '📊',
      gradientClass: 'bg-gradient-info-soft',
      iconBg: 'bg-blue-500',
      change: null
    },
    {
      id: 5,
      title: 'Top Category',
      value: metrics.topCategory.name,
      icon: getCategoryIcon(metrics.topCategory.name),
      gradientClass: 'bg-gradient-warning-soft',
      iconBg: 'bg-yellow-500',
      change: null,
      subtitle: metrics.topCategory.amount > 0 ? formatCurrency(metrics.topCategory.amount) : null
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative overflow-hidden group"
          >
            {/* Gradient background layer */}
            <div className={`absolute inset-0 ${card.gradientClass} opacity-50`}></div>
            
            {/* Radial highlight on hover */}
            <div className="absolute inset-0 bg-radial-highlight-soft opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Glass card */}
            <div className="relative glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-white/20 shadow-glass hover:shadow-glass-lg transition-all duration-300">
              {/* Header with icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center text-xl shadow-glow-sm`}>
                  {card.icon}
                </div>
                
                {/* Change indicator */}
                {card.change !== null && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    card.change >= 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    <svg 
                      className={`w-3 h-3 ${card.change >= 0 ? 'rotate-0' : 'rotate-180'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {card.title}
              </p>

              {/* Value */}
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                {card.value}
              </p>

              {/* Subtitle (for top category amount) */}
              {card.subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {card.subtitle}
                </p>
              )}

              {/* Progress bar for budget remaining */}
              {card.id === 2 && metrics.remainingBudget !== 0 && (
                <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, Math.max(0, (metrics.remainingBudget / (metrics.monthlySpend + metrics.remainingBudget)) * 100))}%` 
                    }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`h-full ${
                      metrics.remainingBudget >= 0 
                        ? 'bg-gradient-success' 
                        : 'bg-gradient-danger'
                    }`}
                  ></motion.div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MetricsBar;
