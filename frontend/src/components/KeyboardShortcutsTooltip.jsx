import { motion, AnimatePresence } from 'framer-motion';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

const KeyboardShortcutsTooltip = ({ show, onClose }) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 right-6 z-50 max-w-sm"
        >
          <div className="glass-card backdrop-blur-lg bg-white/95 dark:bg-gray-800/95 rounded-2xl p-4 border border-gray-200/30 dark:border-gray-700/30 shadow-glass-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⌨️</span>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Keyboard Shortcuts</h3>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"
              >
                ✕
              </motion.button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-2">
              {SHORTCUTS.map((shortcut, index) => (
                <motion.div
                  key={shortcut.action}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-gradient-primary-soft rounded border border-teal-200/30 dark:border-teal-700/30 font-mono text-xs font-semibold text-teal-700 dark:text-teal-300">
                    {isMac ? shortcut.mac : shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">?</kbd> anytime to see shortcuts
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsTooltip;
