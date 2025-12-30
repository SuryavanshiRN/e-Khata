import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10">
        <div className="px-6 py-3 flex justify-end items-center gap-4">

          <LanguageSwitcher />

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 relative"
          >
            <div
              className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'translate-x-7' : ''
              }`}
            />
          </motion.button>

          {/* Welcome */}
          <span className="text-sm bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white px-3 py-1 rounded-full">
            {t('common.welcome')}, {user?.name}
          </span>

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white"
          >
            {t('common.logout')}
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
