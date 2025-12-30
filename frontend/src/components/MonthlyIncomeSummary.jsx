import { useContext, useState, useEffect } from 'react';
import { IncomeContext } from '../context/IncomeContext';
import { ExpenseContext } from '../context/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MonthlyIncomeSummary = () => {
  const { incomes } = useContext(IncomeContext);
  const { expenses } = useContext(ExpenseContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    incomeBySource: []
  });

  useEffect(() => {
    calculateMonthlyData();
  }, [incomes, expenses, selectedMonth, selectedYear]);

  const calculateMonthlyData = () => {
    // Filter incomes for selected month
    const monthlyIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() + 1 === selectedMonth &&
             incomeDate.getFullYear() === selectedYear;
    });

    // Filter expenses for selected month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === selectedMonth &&
             expenseDate.getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalIncome = monthlyIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Group income by source
    const incomeBySource = {};
    monthlyIncomes.forEach(income => {
      if (!incomeBySource[income.source]) {
        incomeBySource[income.source] = 0;
      }
      incomeBySource[income.source] += income.amount;
    });

    const incomeSourceData = Object.keys(incomeBySource).map(source => ({
      name: source,
      value: incomeBySource[source]
    }));

    setMonthlyData({
      totalIncome,
      totalExpense,
      netBalance,
      incomeBySource: incomeSourceData
    });
  };

  const COLORS = {
    Salary: '#10b981',
    Freelance: '#3b82f6',
    Business: '#8b5cf6',
    Investment: '#f59e0b',
    Gift: '#ec4899',
    Other: '#6b7280'
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Monthly Summary</h2>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{monthlyData.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">
            ₹{monthlyData.totalExpense.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-lg p-4 border ${
          monthlyData.netBalance >= 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm font-medium mb-1 ${
            monthlyData.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            Net Balance
          </p>
          <p className={`text-2xl font-bold ${
            monthlyData.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            ₹{Math.abs(monthlyData.netBalance).toLocaleString()}
            {monthlyData.netBalance < 0 && ' (Deficit)'}
          </p>
        </div>
      </div>

      {/* Income by Source Chart */}
      {monthlyData.incomeBySource.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Income by Source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={monthlyData.incomeBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {monthlyData.incomeBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Other} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No income data for {months[selectedMonth - 1]} {selectedYear}</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyIncomeSummary;
