import { useState } from 'react';
import { motion } from 'framer-motion';
import SIPCalculator from '../components/SIPCalculator';
import EMICalculator from '../components/EMICalculator';

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('sip');

  const tabs = [
    { id: 'sip', label: 'SIP Calculator', icon: '📈' },
    { id: 'emi', label: 'EMI Calculator', icon: '🏠' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Calculators
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your investments and loans with accurate calculations
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'sip' && <SIPCalculator />}
          {activeTab === 'emi' && <EMICalculator />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📈</span> About SIP
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Systematic Investment Plan (SIP) is a method of investing a fixed sum regularly in mutual funds. 
              It helps in rupee cost averaging and harnesses the power of compounding.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Disciplined and regular investing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Benefit from rupee cost averaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Power of compounding over time</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🏠</span> About EMI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender 
              at a specified date each month. It includes both principal and interest components.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Fixed monthly payment amount</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Reduces principal over time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Helps plan budget effectively</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculators;
