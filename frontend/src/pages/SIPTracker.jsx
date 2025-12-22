import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSIPs, deleteSIP, refreshSIP } from '../api/sips';
import AddSIPModal from '../components/AddSIPModal';
import { useTranslation } from 'react-i18next';

const SIPTracker = () => {
  const { t } = useTranslation();
  const [sips, setSips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSIP, setSelectedSIP] = useState(null);
  const [refreshing, setRefreshing] = useState({});

  useEffect(() => {
    fetchSIPs();
  }, []);

  const fetchSIPs = async () => {
    try {
      setLoading(true);
      const response = await getSIPs(true);
      setSips(response.data);
      setSummary(response.summary);
    } catch (error) {
      console.error('Error fetching SIPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SIP?')) return;

    try {
      await deleteSIP(id);
      fetchSIPs();
    } catch (error) {
      console.error('Error deleting SIP:', error);
      alert('Failed to delete SIP');
    }
  };

  const handleRefresh = async (id) => {
    try {
      setRefreshing(prev => ({ ...prev, [id]: true }));
      await refreshSIP(id);
      fetchSIPs();
    } catch (error) {
      console.error('Error refreshing SIP:', error);
      alert('Failed to refresh SIP');
    } finally {
      setRefreshing(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (returns) => {
    if (returns > 15) return 'text-green-600 dark:text-green-400';
    if (returns > 0) return 'text-teal-600 dark:text-teal-400';
    return 'text-red-600 dark:text-red-400';
  };

  const COLORS = ['#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
               SIP Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your Systematic Investment Plans and monitor performance
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            ➕ Add New SIP
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total SIPs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {summary.totalSIPs}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.totalInvested)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.currentValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Returns</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(summary.returnsPercentage)}`}>
                    {formatCurrency(summary.totalReturns)}
                  </p>
                  <p className={`text-sm ${getPerformanceColor(summary.returnsPercentage)}`}>
                    {summary.returnsPercentage > 0 ? '+' : ''}{summary.returnsPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center ${
                  summary.returnsPercentage > 0 
                    ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800'
                    : 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800'
                }`}>
                  <span className="text-2xl">{summary.returnsPercentage > 0 ? '🎯' : '📉'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Portfolio Allocation Chart */}
        {sips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Portfolio Allocation
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sips.map(sip => ({
                        name: sip.name,
                        value: sip.currentValue || sip.totalInvested
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sips.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 grid grid-cols-1 gap-3">
                {sips.map((sip, index) => (
                  <div key={sip._id} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sip.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {sip.fundSymbol}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(sip.currentValue || sip.totalInvested)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SIP Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {sips.map((sip, index) => (
              <motion.div
                key={sip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{sip.name}</h3>
                      <p className="text-sm text-teal-100">{sip.fundSymbol}</p>
                      {sip.fundName && (
                        <p className="text-xs text-teal-100 mt-1">{sip.fundName}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefresh(sip._id)}
                        disabled={refreshing[sip._id]}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh valuation"
                      >
                        <span className={refreshing[sip._id] ? 'animate-spin' : ''}>🔄</span>
                      </button>
                      <button
                        onClick={() => handleDelete(sip._id)}
                        className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
                        title="Delete SIP"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly SIP</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(sip.monthlyAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Started On</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDate(sip.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Invested</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(sip.totalInvested || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(sip.currentValue || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Returns</p>
                      <p className={`text-lg font-bold ${getPerformanceColor((sip.returns / sip.totalInvested) * 100)}`}>
                        {formatCurrency(sip.returns || 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">XIRR</p>
                      <p className={`text-lg font-bold ${getPerformanceColor(sip.xirr || 0)}`}>
                        {(sip.xirr || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CAGR</p>
                      <p className={`text-lg font-bold ${getPerformanceColor(sip.cagr || 0)}`}>
                        {(sip.cagr || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Performance Alert */}
                  {sip.performance && sip.performance.isUnderperforming && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{sip.performance.message}</span>
                      </p>
                    </div>
                  )}

                  {sip.autoTopup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>🔝</span>
                      <span>Auto Top-up: {sip.topupPercentage}% yearly</span>
                    </div>
                  )}

                  {sip.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📝 {sip.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No SIPs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your systematic investment plans
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              ➕ Add Your First SIP
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Add SIP Modal */}
      <AddSIPModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedSIP(null);
        }}
        onSuccess={() => {
          fetchSIPs();
          setShowAddModal(false);
          setSelectedSIP(null);
        }}
        sip={selectedSIP}
      />
    </div>
  );
};

export default SIPTracker;
