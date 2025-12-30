import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSIP, searchFunds } from '../api/sips';

const AddSIPModal = ({ isOpen, onClose, onSuccess, sip }) => {
  const [formData, setFormData] = useState({
    name: '',
    fundSymbol: '',
    fundName: '',
    monthlyAmount: '',
    startDate: '',
    autoTopup: false,
    topupPercentage: 10,
    notes: ''
  });

  const [fundSearch, setFundSearch] = useState('');
  const [fundResults, setFundResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFundDropdown, setShowFundDropdown] = useState(false);

  useEffect(() => {
    if (sip) {
      setFormData({
        name: sip.name || '',
        fundSymbol: sip.fundSymbol || '',
        fundName: sip.fundName || '',
        monthlyAmount: sip.monthlyAmount || '',
        startDate: sip.startDate ? new Date(sip.startDate).toISOString().split('T')[0] : '',
        autoTopup: sip.autoTopup || false,
        topupPercentage: sip.topupPercentage || 10,
        notes: sip.notes || ''
      });
    }
  }, [sip]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        fundSymbol: '',
        fundName: '',
        monthlyAmount: '',
        startDate: '',
        autoTopup: false,
        topupPercentage: 10,
        notes: ''
      });
      setError('');
      setFundSearch('');
      setFundResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fundSearch.length >= 2) {
        handleFundSearch();
      } else {
        setFundResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fundSearch]);

  const handleFundSearch = async () => {
    try {
      setSearching(true);
      const response = await searchFunds(fundSearch);
      setFundResults(response.data || []);
      setShowFundDropdown(true);
    } catch (error) {
      console.error('Fund search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFundSelect = (fund) => {
    setFormData(prev => ({
      ...prev,
      fundSymbol: fund.symbol,
      fundName: fund.name
    }));
    setFundSearch(fund.symbol);
    setShowFundDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.fundSymbol || !formData.monthlyAmount || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.monthlyAmount < 100) {
      setError('Monthly amount must be at least ₹100');
      return;
    }

    if (new Date(formData.startDate) > new Date()) {
      setError('Start date cannot be in the future');
      return;
    }

    try {
      setLoading(true);
      await createSIP(formData);
      onSuccess();
    } catch (error) {
      console.error('Create SIP error:', error);
      setError(error.response?.data?.message || 'Failed to create SIP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {sip ? '✏️ Edit SIP' : '➕ Add New SIP'}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* SIP Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SIP Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., My Retirement Fund"
                  required
                />
              </div>

              {/* Fund Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fund Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fundSearch}
                  onChange={(e) => {
                    setFundSearch(e.target.value);
                    setFormData(prev => ({ ...prev, fundSymbol: e.target.value }));
                  }}
                  onFocus={() => setShowFundDropdown(true)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Search for fund symbol (e.g., NIFTYBEES)"
                  required
                />
                
                {/* Fund Dropdown */}
                {showFundDropdown && fundResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  >
                    {fundResults.map((fund, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleFundSelect(fund)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {fund.symbol}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {fund.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {fund.type} • {fund.region}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {searching && (
                  <div className="absolute right-3 top-11 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                  </div>
                )}
              </div>

              {/* Fund Name (Auto-filled) */}
              {formData.fundName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fund Name
                  </label>
                  <input
                    type="text"
                    value={formData.fundName}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
                  />
                </div>
              )}

              {/* Monthly Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Investment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyAmount: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="5000"
                  min="100"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum: ₹100
                </p>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Auto Top-up */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="autoTopup"
                  checked={formData.autoTopup}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoTopup: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-teal-500 rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <label htmlFor="autoTopup" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Enable Auto Top-up
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Automatically increase SIP amount yearly
                  </p>
                  
                  {formData.autoTopup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Top-up Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={formData.topupPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, topupPercentage: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                        placeholder="10"
                        min="1"
                        max="100"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  sip ? 'Update SIP' : 'Create SIP'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddSIPModal;
