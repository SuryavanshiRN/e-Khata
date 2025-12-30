import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpenseContext } from '../context/ExpenseContext';

const DynamicGreeting = () => {
  const { expenses, totalExpenses } = useContext(ExpenseContext);
  const [greeting, setGreeting] = useState({ message: '', icon: '', timeOfDay: '' });
  const [insights, setInsights] = useState({ topCategory: '', trend: '', percentage: 0 });

  useEffect(() => {
    // Detect time of day
    const hour = new Date().getHours();
    let message, icon, timeOfDay;

    if (hour >= 5 && hour < 12) {
      message = 'Good Morning';
      icon = '🌅';
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      message = 'Good Afternoon';
      icon = '☀️';
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      message = 'Good Evening';
      icon = '🌆';
      timeOfDay = 'evening';
    } else {
      message = 'Good Night';
      icon = '🌙';
      timeOfDay = 'night';
    }

    setGreeting({ message, icon, timeOfDay });
  }, []);

  useEffect(() => {
    // Calculate insights from expenses
    if (expenses && expenses.length > 0) {
      // Get top spending category
      const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

      // Calculate trend (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

      const recentExpenses = expenses.filter(e => new Date(e.date) >= sevenDaysAgo);
      const previousExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      });

      const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);

      let trend = 'stable';
      let percentage = 0;

      if (previousTotal > 0) {
        percentage = Math.round(((recentTotal - previousTotal) / previousTotal) * 100);
        if (percentage > 10) trend = 'up';
        else if (percentage < -10) trend = 'down';
      }

      setInsights({
        topCategory: topCategory ? topCategory[0] : 'General',
        trend,
        percentage: Math.abs(percentage)
      });
    }
  }, [expenses]);

  // Get contextual message based on insights
  const getContextualMessage = () => {
    const { trend, topCategory, percentage } = insights;
    
    if (trend === 'up') {
      return {
        text: `Your spending is up ${percentage}% this week. Most spent on ${topCategory}.`,
        icon: '📈',
        color: 'text-orange-300'
      };
    } else if (trend === 'down') {
      return {
        text: `Great job! Spending down ${percentage}% this week. Keep it up!`,
        icon: '📉',
        color: 'text-green-300'
      };
    } else if (topCategory) {
      return {
        text: `${topCategory} is your top spending category this month.`,
        icon: '💡',
        color: 'text-blue-300'
      };
    } else {
      return {
        text: `Ready to track your expenses? Let's get started!`,
        icon: '🚀',
        color: 'text-teal-300'
      };
    }
  };

  const contextualMsg = getContextualMessage();

  // Get gradient based on time of day
  const getTimeGradient = () => {
    switch (greeting.timeOfDay) {
      case 'morning':
        return 'bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-teal-400/20';
      case 'afternoon':
        return 'bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20';
      case 'evening':
        return 'bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20';
      case 'night':
        return 'bg-gradient-to-r from-indigo-500/20 via-teal-500/20 to-blue-500/20';
      default:
        return 'bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className={`relative overflow-hidden rounded-2xl ${getTimeGradient()} backdrop-blur-sm`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          <div className="relative glass-card backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30 shadow-glass-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Greeting Section */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-5xl"
                >
                  {greeting.icon}
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {greeting.message}!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </motion.div>

              {/* Insights Section */}
              {expenses.length > 0 && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center gap-3 glass backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-white/30 dark:border-gray-600/30 shadow-glass"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="text-3xl"
                  >
                    {contextualMsg.icon}
                  </motion.span>
                  <div>
                    <p className={`text-sm font-semibold ${contextualMsg.color}`}>
                      Smart Insight
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 max-w-xs">
                      {contextualMsg.text}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Trend Indicator */}
            {expenses.length > 0 && insights.trend !== 'stable' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-700/30"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Weekly Trend:</span>
                  <div className="flex items-center gap-1">
                    {insights.trend === 'up' ? (
                      <>
                        <span className="text-orange-500">↗</span>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          +{insights.percentage}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-green-500">↘</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          -{insights.percentage}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DynamicGreeting;
