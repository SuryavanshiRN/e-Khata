import { motion, AnimatePresence } from 'framer-motion';
import useAdaptiveTheme from '../hooks/useAdaptiveTheme';

const ThemeStatusIndicator = () => {
  const { getThemeStatus, toggleTheme, themeMode } = useAdaptiveTheme();
  const status = getThemeStatus();

  return (
    <AnimatePresence>
      {status.special && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed top-20 right-4 z-40"
        >
          <div className="glass backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 rounded-full px-4 py-2 border border-white/30 dark:border-gray-700/30 shadow-glass-lg flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm">{status.message}</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeStatusIndicator;
