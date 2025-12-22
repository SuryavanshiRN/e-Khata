import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSIP } from '../api/calculators';
import { useTranslation } from 'react-i18next';

const SIPCalculator = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    monthly: 5000,
    rate: 12,
    years: 10
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presets = {
    rates: [5, 8, 10, 12, 15],
    amounts: [1000, 5000, 10000, 25000, 50000],
    years: [5, 10, 15, 20, 25]
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputs.monthly > 0 && inputs.rate > 0 && inputs.years > 0) {
        handleCalculate();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs]);

  const handleCalculate = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await calculateSIP(inputs.monthly, inputs.rate, inputs.years);
      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
      console.error('SIP calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📈 SIP Calculator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Calculate returns on your Systematic Investment Plan
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investment Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Investment Amount
              </label>
              <input
                type="number"
                value={inputs.monthly}
                onChange={(e) => handleInputChange('monthly', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter monthly amount"
                min="0"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {presets.amounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('monthly', amount)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      inputs.monthly === amount
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                value={inputs.rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter annual return %"
                min="0"
                max="100"
                step="0.1"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {presets.rates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleInputChange('rate', rate)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      inputs.rate === rate
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Period (Years)
              </label>
              <input
                type="number"
                value={inputs.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter years"
                min="1"
                max="50"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {presets.years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleInputChange('years', year)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      inputs.years === year
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {year}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investment Summary
            </h3>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              </div>
            ) : result ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">Future Value</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(result.futureValue)}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Invested</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(result.totalInvested)}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Returns</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(result.totalReturns)}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">CAGR</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatPercentage(result.cagr)}
                    </p>
                  </motion.div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Growth Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={result.monthlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        stroke="#9CA3AF"
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Invested"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="futureValue" 
                        stroke="#14B8A6" 
                        strokeWidth={2}
                        name="Future Value"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>Enter values to see results</p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SIPCalculator;
