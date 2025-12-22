import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExpenseContext } from '../context/ExpenseContext';
import { IncomeContext } from '../context/IncomeContext';
import ExpenseCard from '../components/ExpenseCard';
import IncomeCard from '../components/IncomeCard';
import AddExpenseModal from '../components/AddExpenseModal';
import AddIncomeModal from '../components/AddIncomeModal';
import Charts from '../components/Charts';
import MonthlyIncomeSummary from '../components/MonthlyIncomeSummary';
import ExportDropdown from '../components/ExportDropdown';
import InsightsPanel from '../components/InsightsPanel';
import SmartAddExpense from '../components/SmartAddExpense';
import ReceiptOCR from '../components/ReceiptOCR';
import FloatingAdvisor from '../components/FloatingAdvisor';
import MetricsBar from '../components/MetricsBar';
import CommandPalette from '../components/CommandPalette';
import KeyboardShortcutsTooltip from '../components/KeyboardShortcutsTooltip';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import DynamicGreeting from '../components/DynamicGreeting';
import ThemeStatusIndicator from '../components/ThemeStatusIndicator';
import useAdaptiveTheme from '../hooks/useAdaptiveTheme';

const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
const incomeSources = ['All', 'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

const Dashboard = () => {
  const { expenses, loading: expenseLoading, fetchExpenses, totalExpenses } = useContext(ExpenseContext);
  const { incomes, loading: incomeLoading, fetchIncomes, totalIncome } = useContext(IncomeContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'income'
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [aiDetectedExpense, setAiDetectedExpense] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);

  const netBalance = totalIncome - totalExpenses;

  // Initialize adaptive theming
  useAdaptiveTheme();

  // Keyboard shortcuts integration
  const { showTooltip, hideTooltip } = useKeyboardShortcuts({
    openCommandPalette: () => {
      // Command palette is handled by kbar (Ctrl+K)
      console.log('Command palette triggered');
    },
    addExpense: () => {
      setIsExpenseModalOpen(true);
      setAiDetectedExpense(null);
      setEditingExpense(null);
    },
    addIncome: () => {
      setIsIncomeModalOpen(true);
      setEditingIncome(null);
    },
    openAdvisor: () => {
      setShowAdvisor(true);
    },
    exportData: () => {
      // Trigger export dropdown programmatically if needed
      console.log('Export triggered');
    },
    navigateToTab: (tab) => {
      setActiveTab(tab);
    },
    showHelp: () => {
      alert('Keyboard Shortcuts:\n\nCtrl+K - Command Palette\nCtrl+E - Add Expense\nCtrl+I - Add Income\nCtrl+A - AI Advisor\nCtrl+X - Export\n1-4 - Navigate Tabs');
    }
  });

  // Handle AI detected expense from Smart Add
  const handleAIExpenseDetected = (expenseData) => {
    // Set the AI detected expense data
    setAiDetectedExpense(expenseData);
    // Open the expense modal
    setIsExpenseModalOpen(true);
  };

  // Handle OCR receipt processed
  const handleReceiptProcessed = (expenseData) => {
    setAiDetectedExpense(expenseData);
    setIsExpenseModalOpen(true);
    setShowOCRModal(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setAiDetectedExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIsIncomeModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setAiDetectedExpense(null);
  };

  const handleCloseIncomeModal = () => {
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      fetchExpenses({});
    } else {
      fetchExpenses({ category });
    }
  };

  const handleSourceFilter = (source) => {
    setSelectedSource(source);
    if (source === 'All') {
      fetchIncomes({});
    } else {
      fetchIncomes({ source });
    }
  };

  const filteredExpenses = selectedCategory === 'All' 
    ? expenses 
    : expenses.filter(exp => exp.category === selectedCategory);

  const filteredIncomes = selectedSource === 'All'
    ? incomes
    : incomes.filter(inc => inc.source === selectedSource);

  const loading = expenseLoading || incomeLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">

      {/* Theme Status Indicator */}
      <ThemeStatusIndicator />

      {/* Keyboard Shortcuts Tooltip - Temporarily Disabled */}
      {/* {showTooltip && <KeyboardShortcutsTooltip onClose={hideTooltip} />} */}

      {/* Main Container - 12 Column Grid */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Dynamic Greeting Banner */}
        <DynamicGreeting />

        {/* Header Section - Full Width */}
        <div className="relative overflow-hidden rounded-2xl mb-6 group">
          {/* Multi-layer gradient background */}
          <div className="absolute inset-0 bg-gradient-primary"></div>
          <div className="absolute inset-0 bg-radial-highlight opacity-40 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* Glass header overlay */}
          <div className="relative glass-dark backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-glass-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-100 to-teal-100 bg-clip-text text-transparent">
                  Financial Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Income Card */}
                  <div className="glass backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-cyan-100 text-sm font-medium mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-white">₹{totalIncome.toLocaleString()}</p>
                  </div>
                  {/* Total Expenses Card */}
                  <div className="glass backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-cyan-100 text-sm font-medium mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                  {/* Net Balance Card */}
                  <div className="glass backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-cyan-100 text-sm font-medium mb-1">Net Balance</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      ₹{Math.abs(netBalance).toLocaleString()}
                      {netBalance < 0 && ' (-)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <ExportDropdown 
                  filters={{
                    category: selectedCategory !== 'All' ? selectedCategory : undefined,
                    source: selectedSource !== 'All' ? selectedSource : undefined
                  }}
                />
                <motion.button
                  onClick={() => setIsIncomeModalOpen(true)}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="glass backdrop-blur-sm bg-gradient-success text-white px-6 py-2.5 rounded-lg hover:shadow-glow transition-all duration-200 font-semibold border border-white/20 shadow-button"
                >
                  + Add Income
                </motion.button>
                <motion.button
                  onClick={() => setIsExpenseModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass backdrop-blur-sm bg-white/90 text-teal-600 px-6 py-2.5 rounded-lg hover:bg-white hover:shadow-glass transition-all duration-200 font-semibold border border-white/30 shadow-button hover:shadow-button-hover"
                >
                  + Add Expense
                </motion.button>
                <motion.button
                  onClick={() => setShowOCRModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass backdrop-blur-sm bg-gradient-to-r from-cyan-500/90 to-teal-500/90 text-white px-6 py-2.5 rounded-lg hover:shadow-glow transition-all duration-200 font-semibold border border-white/30 shadow-button flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  📸 Upload Receipt
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 glass-card backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl p-1 border border-gray-200/30 dark:border-gray-700/30 shadow-card">
          <div className="flex gap-2 relative">
            <motion.button
              onClick={() => setActiveTab('expenses')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 relative z-10 ${
                activeTab === 'expenses'
                  ? 'bg-gradient-primary text-white shadow-card-hover'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
               Expenses
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('income')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 relative z-10 ${
                activeTab === 'income'
                  ? 'bg-gradient-success text-white shadow-card-hover'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
               Income
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('insights')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 relative z-10 ${
                activeTab === 'insights'
                  ? 'bg-gradient-warning text-white shadow-card-hover'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
               Insights
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('summary')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 relative z-10 ${
                activeTab === 'summary'
                  ? 'bg-gradient-info text-white shadow-card-hover'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
               Summary
            </motion.button>
          </div>
        </div>

        {/* Smart Add Expense - Full Width */}
        <SmartAddExpense onExpenseDetected={handleAIExpenseDetected} />

        {/* Level 1: Metrics Bar - Full Width (12 cols) */}
        <MetricsBar expenses={expenses} budgets={[]} />

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Level 2: Category Filter Pills - Full Width */}
            <div className="glass-card backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30 shadow-glass">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Category:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      selectedCategory === category
                        ? 'bg-gradient-primary text-white shadow-glass scale-105'
                        : 'glass backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-200/30 dark:border-gray-600/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 12-Column Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Level 3: Charts/Trends Section - Left Side (4 cols on lg, full on mobile) */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span>Spending Trends</span>
                  </h3>
                  <Charts expenses={filteredExpenses} />
                </div>
              </div>

              {/* Level 4: Expense History - Right Side (8 cols on lg, full on mobile) */}
              <div className="col-span-12 lg:col-span-8">
                <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="text-2xl">🧾</span>
                      <span>Recent Expenses</span>
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
                    </span>
                  </div>
                  
                  {expenseLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4">Loading expenses...</p>
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500 dark:text-gray-400">No expenses found. Add your first expense!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredExpenses.map((expense, index) => (
                        <div key={expense._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <ExpenseCard expense={expense} onEdit={handleEditExpense} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            {/* Source Filter Pills */}
            <div className="glass-card backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30 shadow-glass">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Source:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {incomeSources.map((source) => (
                  <button
                    key={source}
                    onClick={() => handleSourceFilter(source)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      selectedSource === source
                        ? 'bg-gradient-success text-white shadow-glass scale-105'
                        : 'glass backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-200/30 dark:border-gray-600/30'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Grid - Full Width */}
            <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  <span>Income History</span>
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredIncomes.length} {filteredIncomes.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              
              {incomeLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Loading income...</p>
                </div>
              ) : filteredIncomes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💸</div>
                  <p className="text-gray-500 dark:text-gray-400">No income found. Add your first income!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredIncomes.map((income, index) => (
                    <div key={income._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <IncomeCard income={income} onEdit={handleEditIncome} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg">
            <InsightsPanel />
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Monthly Income Summary - Left (6 cols) */}
            <div className="col-span-12 lg:col-span-6">
              <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg h-full">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span>Monthly Summary</span>
                </h3>
                <MonthlyIncomeSummary />
              </div>
            </div>
            
            {/* Charts - Right (6 cols) */}
            <div className="col-span-12 lg:col-span-6">
              <div className="glass-card backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg h-full">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span>Expense Breakdown</span>
                </h3>
                <Charts expenses={expenses} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        editExpense={editingExpense}
        aiDetectedExpense={aiDetectedExpense}
      />
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={handleCloseIncomeModal}
        editIncome={editingIncome}
      />

      {/* OCR Receipt Modal */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>📸</span>
                Upload Receipt / Bill
              </h2>
              <button
                onClick={() => setShowOCRModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ReceiptOCR onReceiptProcessed={handleReceiptProcessed} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating AI Advisor */}
      <FloatingAdvisor />
    </div>
  );
};

export default Dashboard;
