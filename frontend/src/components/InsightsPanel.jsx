import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as insightsAPI from '../api/insights';

const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Health: '#22c55e',
  Education: '#6366f1',
  Other: '#6b7280',
};

const InsightsPanel = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const result = await insightsAPI.getInsights();
      if (result.success) {
        setInsights(result.data);
      } else {
        setError('Failed to load insights');
      }
    } catch (err) {
      console.error('Insights error:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  // Prepare data for charts
  const categoryData = Object.entries(insights.categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
  }));

  const trendData = [
    {
      month: insights.metadata.previousMonth.split(' ')[0],
      amount: insights.trend.previousMonth,
      type: 'Previous'
    },
    {
      month: insights.metadata.currentMonth.split(' ')[0],
      amount: insights.trend.currentMonth,
      type: 'Current'
    }
  ];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          📊 Spending Insights
        </h2>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Total */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ₹{insights.monthlyTotal.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${
            insights.trend.direction === 'up' 
              ? 'text-red-600 dark:text-red-400' 
              : insights.trend.direction === 'down'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {insights.trend.direction === 'up' ? '↑' : insights.trend.direction === 'down' ? '↓' : '→'} 
            {Math.abs(insights.trend.changePercentage).toFixed(1)}% vs last month
          </p>
        </div>

        {/* Projected Spending */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-teal-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Projected</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ₹{insights.projectedMonthlySpending.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Based on avg ₹{insights.averageDailySpend.toFixed(0)}/day
          </p>
        </div>

        {/* Week Over Week */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ₹{insights.weekOverWeek.currentWeek.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${
            insights.weekOverWeek.direction === 'up' 
              ? 'text-red-600 dark:text-red-400' 
              : insights.weekOverWeek.direction === 'down'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {insights.weekOverWeek.direction === 'up' ? '↑' : insights.weekOverWeek.direction === 'down' ? '↓' : '→'} 
            {Math.abs(insights.weekOverWeek.changePercentage).toFixed(1)}% vs last week
          </p>
        </div>

        {/* Top Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Category</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {insights.highestCategory?.category || 'N/A'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {insights.highestCategory ? `₹${insights.highestCategory.amount.toLocaleString()}` : 'No data'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            Daily Spending (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={insights.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            Monthly Comparison
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.category}: ₹${entry.amount.toFixed(0)}`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            Category Trends
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {Object.entries(insights.categoryTrends).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    ₹{data.current.toFixed(0)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    data.direction === 'up'
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                      : data.direction === 'down'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : '→'}
                    {Math.abs(data.changePercentage).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          💡 Smart Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.insights.map((insight, index) => (
            <div
              key={index}
              className={`flex gap-3 p-4 rounded-lg border ${
                insight.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex-shrink-0">{getInsightIcon(insight.type)}</div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {insight.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Data for {insights.metadata.currentMonth} • Day {insights.metadata.currentDay} of {insights.metadata.daysInMonth} • 
        {insights.metadata.daysRemaining} days remaining
      </div>
    </div>
  );
};

export default InsightsPanel;
