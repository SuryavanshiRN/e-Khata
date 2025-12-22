const Expense = require('../models/Expense');

// Helper function to get date ranges
const getDateRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  return { startDate, endDate };
};

// Helper function to calculate week over week change
const getWeekRanges = () => {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  currentWeekStart.setHours(0, 0, 0, 0);
  
  const currentWeekEnd = new Date(now);
  
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastWeekEnd = new Date(currentWeekStart);
  lastWeekEnd.setMilliseconds(-1);
  
  return {
    currentWeek: { start: currentWeekStart, end: currentWeekEnd },
    lastWeek: { start: lastWeekStart, end: lastWeekEnd }
  };
};

// @desc    Get spending insights
// @route   GET /api/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get current month date range
    const { startDate: currentMonthStart, endDate: currentMonthEnd } = getDateRange(currentYear, currentMonth);
    
    // Get previous month date range
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const { startDate: prevMonthStart, endDate: prevMonthEnd } = getDateRange(previousYear, previousMonth);
    
    // Fetch current month expenses
    const currentMonthExpenses = await Expense.find({
      user: userId,
      date: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    
    // Fetch previous month expenses
    const previousMonthExpenses = await Expense.find({
      user: userId,
      date: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });
    
    // Calculate monthly total
    const monthlyTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate category totals for current month
    const categoryTotals = currentMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Calculate category totals for previous month
    const prevCategoryTotals = previousMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Find highest and lowest categories
    const categories = Object.entries(categoryTotals);
    const highestCategory = categories.length > 0
      ? categories.reduce((max, cat) => cat[1] > max[1] ? cat : max)
      : null;
    const lowestCategory = categories.length > 0
      ? categories.reduce((min, cat) => cat[1] < min[1] ? cat : min)
      : null;
    
    // Calculate trend (current vs previous month)
    const trendPercentage = previousMonthTotal > 0
      ? ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;
    
    const trend = {
      currentMonth: monthlyTotal,
      previousMonth: previousMonthTotal,
      change: monthlyTotal - previousMonthTotal,
      changePercentage: trendPercentage,
      direction: monthlyTotal > previousMonthTotal ? 'up' : monthlyTotal < previousMonthTotal ? 'down' : 'stable'
    };
    
    // Calculate week over week change
    const weeks = getWeekRanges();
    
    const currentWeekExpenses = await Expense.find({
      user: userId,
      date: { $gte: weeks.currentWeek.start, $lte: weeks.currentWeek.end }
    });
    
    const lastWeekExpenses = await Expense.find({
      user: userId,
      date: { $gte: weeks.lastWeek.start, $lte: weeks.lastWeek.end }
    });
    
    const currentWeekTotal = currentWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastWeekTotal = lastWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const weekOverWeekPercentage = lastWeekTotal > 0
      ? ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
      : 0;
    
    const weekOverWeek = {
      currentWeek: currentWeekTotal,
      lastWeek: lastWeekTotal,
      change: currentWeekTotal - lastWeekTotal,
      changePercentage: weekOverWeekPercentage,
      direction: currentWeekTotal > lastWeekTotal ? 'up' : currentWeekTotal < lastWeekTotal ? 'down' : 'stable'
    };
    
    // Calculate projected monthly spending
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const averageDailySpend = currentDay > 0 ? monthlyTotal / currentDay : 0;
    const projectedMonthlySpending = averageDailySpend * daysInMonth;
    
    // Calculate daily spending trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayExpenses = await Expense.find({
        user: userId,
        date: { $gte: date, $lte: dayEnd }
      });
      
      const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      dailyTrend.push({
        date: date.toISOString().split('T')[0],
        amount: dayTotal,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    // Calculate category trends (compare current vs previous month)
    const categoryTrends = {};
    const allCategories = new Set([...Object.keys(categoryTotals), ...Object.keys(prevCategoryTotals)]);
    
    allCategories.forEach(category => {
      const current = categoryTotals[category] || 0;
      const previous = prevCategoryTotals[category] || 0;
      const change = current - previous;
      const changePercentage = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      categoryTrends[category] = {
        current,
        previous,
        change,
        changePercentage,
        direction: current > previous ? 'up' : current < previous ? 'down' : 'stable'
      };
    });
    
    // Generate text insights
    const insights = [];
    
    // Trend insight
    if (trend.direction === 'up') {
      insights.push({
        type: 'warning',
        title: 'Spending Increased',
        message: `Your spending increased by ${Math.abs(trend.changePercentage).toFixed(1)}% compared to last month (₹${Math.abs(trend.change).toFixed(2)} more).`
      });
    } else if (trend.direction === 'down') {
      insights.push({
        type: 'success',
        title: 'Great Job!',
        message: `You saved ${Math.abs(trend.changePercentage).toFixed(1)}% compared to last month (₹${Math.abs(trend.change).toFixed(2)} less).`
      });
    }
    
    // Category insights
    Object.entries(categoryTrends).forEach(([category, data]) => {
      if (data.changePercentage > 20) {
        insights.push({
          type: 'info',
          title: `${category} Expenses Up`,
          message: `${category} expenses increased by ${data.changePercentage.toFixed(1)}% this month.`
        });
      } else if (data.changePercentage < -20) {
        insights.push({
          type: 'success',
          title: `${category} Savings`,
          message: `${category} expenses decreased by ${Math.abs(data.changePercentage).toFixed(1)}% this month.`
        });
      }
    });
    
    // Highest category insight
    if (highestCategory) {
      insights.push({
        type: 'info',
        title: 'Top Expense Category',
        message: `${highestCategory[0]} is your largest expense category at ₹${highestCategory[1].toFixed(2)}.`
      });
    }
    
    // Projection insight
    if (projectedMonthlySpending > monthlyTotal * 1.2) {
      insights.push({
        type: 'warning',
        title: 'Projected Overspending',
        message: `At your current pace, you're projected to spend ₹${projectedMonthlySpending.toFixed(2)} this month.`
      });
    }
    
    // Week over week insight
    if (weekOverWeek.direction === 'up' && weekOverWeek.changePercentage > 15) {
      insights.push({
        type: 'warning',
        title: 'Weekly Spending Up',
        message: `This week's spending is ${weekOverWeek.changePercentage.toFixed(1)}% higher than last week.`
      });
    }
    
    res.json({
      success: true,
      data: {
        monthlyTotal,
        categoryTotals,
        highestCategory: highestCategory ? { category: highestCategory[0], amount: highestCategory[1] } : null,
        lowestCategory: lowestCategory ? { category: lowestCategory[0], amount: lowestCategory[1] } : null,
        trend,
        weekOverWeek,
        projectedMonthlySpending,
        averageDailySpend,
        dailyTrend,
        categoryTrends,
        insights,
        metadata: {
          currentMonth: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          previousMonth: new Date(previousYear, previousMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          daysInMonth,
          currentDay,
          daysRemaining: daysInMonth - currentDay
        }
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights'
    });
  }
};

module.exports = {
  getInsights
};
