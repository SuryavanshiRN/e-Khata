import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculateEMI } from '../api/calculators';
import { useTranslation } from 'react-i18next';

const EMICalculator = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    principal: 500000,
    rate: 8.5,
    months: 60
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presets = {
    rates: [7.5, 8.5, 9.5, 10.5, 11.5],
    principals: [500000, 1000000, 2500000, 5000000, 10000000],
    tenures: [12, 36, 60, 120, 180, 240, 360] // months
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputs.principal > 0 && inputs.rate > 0 && inputs.months > 0) {
        handleCalculate();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs]);

  const handleCalculate = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await calculateEMI(inputs.principal, inputs.rate, inputs.months);
      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
      console.error('EMI calculation error:', err);
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

  const COLORS = ['#3B82F6', '#EF4444'];

  const pieData = result ? [
    { name: 'Principal', value: result.totalPrincipal },
    { name: 'Interest', value: result.totalInterest }
  ] : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🏠 EMI Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Calculate your monthly loan payments (EMI - Equated Monthly Installment)
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Amount (Principal)
              </label>
              <input
                type="number"
                value={inputs.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="500000"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.principals.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('principal', amount)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      inputs.principal === amount
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    ₹{amount >= 100000 ? `${(amount / 100000).toFixed(0)}L` : `${amount / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                value={inputs.rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="8.5"
                step="0.1"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.rates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleInputChange('rate', rate)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      inputs.rate === rate
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Tenure (Months)
              </label>
              <input
                type="number"
                value={inputs.months}
                onChange={(e) => handleInputChange('months', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="60"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.tenures.map(tenure => (
                  <button
                    key={tenure}
                    onClick={() => handleInputChange('months', tenure)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      inputs.months === tenure
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {tenure >= 12 ? `${tenure / 12}Y` : `${tenure}M`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!loading && result && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg"
                  >
                    <p className="text-sm opacity-90 mb-1">Monthly EMI</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.emi)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg"
                  >
                    <p className="text-sm opacity-90 mb-1">Principal Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.totalPrincipal)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg"
                  >
                    <p className="text-sm opacity-90 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.totalInterest)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg"
                  >
                    <p className="text-sm opacity-90 mb-1">Total Payment</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.totalPayment)}</p>
                  </motion.div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {!loading && !result && (
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

      {/* Amortization Schedule */}
      {result && result.amortizationSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Amortization Schedule
          </h3>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">Month</th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">EMI</th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">Principal</th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">Interest</th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.amortizationSchedule.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-2 px-4 text-gray-900 dark:text-white">{item.month}</td>
                      <td className="py-2 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.emi)}
                      </td>
                      <td className="py-2 px-4 text-right text-blue-600 dark:text-blue-400">
                        {formatCurrency(item.principalPayment)}
                      </td>
                      <td className="py-2 px-4 text-right text-red-600 dark:text-red-400">
                        {formatCurrency(item.interestPayment)}
                      </td>
                      <td className="py-2 px-4 text-right text-gray-900 dark:text-white font-medium">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EMICalculator;
