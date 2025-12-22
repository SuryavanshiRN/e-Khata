import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaTachometerAlt,
  FaSyncAlt,
  FaCalculator,
  FaChartLine,
  FaDollarSign,
  FaBell,
  FaLightbulb,
} from 'react-icons/fa';

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const groups = [
    {
      title: 'Finance Tracking',
      items: [
        { name: t('navbar.dashboard'), path: '/dashboard', icon: <FaTachometerAlt /> },
        { name: `${t('navbar.recurring')}`, path: '/recurring-expenses', icon: <FaSyncAlt /> },
        { name: ' Reminders', path: '/reminders', icon: <FaBell /> },
      ],
    },
    {
      title: 'Investments',
      items: [
        { name: ' Calculators', path: '/calculators', icon: <FaCalculator /> },
        { name: ' SIP Tracker', path: '/sip-tracker', icon: <FaChartLine /> },
        { name: ' Portfolio', path: '/portfolio', icon: <FaDollarSign /> },
        { name: ' Stock Market Analyzer', path: '/stocks', icon: <FaChartLine /> },
      ],
    },
    {
      title: 'Support',
      items: [
        { name: ` ${t('navbar.advisor')}`, path: '/advisor', icon: <FaLightbulb /> },
      ],
    },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col shadow-lgbg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="p-6 text-2xl font-bold cursor-pointer text-gray-900 dark:text-white"
  onClick={() => navigate('/dashboard')}>
        Expense Manager
      </div>
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title} className="mb-6 border-b border-gray-200 dark:border-white/10">
            <h3 className="px-6 py-2 uppercase text-xs text-gray-500 dark:text-gray-400">{group.title}</h3>
            <div className="flex flex-col">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-r-lg ${
                      isActive ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-600/30 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg text-cyan-500 dark:text-cyan-400">{item.icon}</span>
                    <span>{item.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
