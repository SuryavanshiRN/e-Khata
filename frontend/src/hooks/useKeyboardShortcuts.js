import { useEffect, useState } from 'react';

/**
 * Global keyboard shortcuts hook
 * Provides keyboard navigation and quick actions across the app
 */
export const useKeyboardShortcuts = (callbacks = {}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if this is the first time user is using shortcuts
    const hasSeenTooltip = localStorage.getItem('keyboardShortcutsTooltipSeen');
    if (!hasSeenTooltip) {
      setShowTooltip(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('keyboardShortcutsTooltipSeen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Except for Ctrl/Cmd + K which opens command palette
        if (!(e.key === 'k' && (e.ctrlKey || e.metaKey))) {
          return;
        }
      }

      // Ctrl/Cmd + K - Open Command Palette
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callbacks.openCommandPalette?.();
        return;
      }

      // Ctrl/Cmd + E - Add Expense
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callbacks.addExpense?.();
        return;
      }

      // Ctrl/Cmd + I - Add Income
      if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callbacks.addIncome?.();
        return;
      }

      // Ctrl/Cmd + A - Open AI Advisor
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callbacks.openAdvisor?.();
        return;
      }

      // Ctrl/Cmd + X - Export Data
      if (e.key === 'x' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callbacks.exportData?.();
        return;
      }

      // Number keys 1-4 - Navigate Tabs (without modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          callbacks.navigateToTab?.('expenses');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          callbacks.navigateToTab?.('income');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          callbacks.navigateToTab?.('insights');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          callbacks.navigateToTab?.('summary');
          return;
        }
      }

      // ? - Show shortcuts help
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        callbacks.showHelp?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);

  const hideTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('keyboardShortcutsTooltipSeen', 'true');
  };

  return { showTooltip, hideTooltip };
};

// Keyboard shortcuts reference
export const SHORTCUTS = [
  { key: 'Ctrl+K', mac: '⌘K', description: 'Open Command Palette', action: 'commandPalette' },
  { key: 'Ctrl+E', mac: '⌘E', description: 'Add Expense', action: 'addExpense' },
  { key: 'Ctrl+I', mac: '⌘I', description: 'Add Income', action: 'addIncome' },
  { key: 'Ctrl+A', mac: '⌘A', description: 'Open AI Advisor', action: 'openAdvisor' },
  { key: 'Ctrl+X', mac: '⌘X', description: 'Export Data', action: 'exportData' },
  { key: '1-4', mac: '1-4', description: 'Navigate Tabs', action: 'navigateTabs' },
  { key: '?', mac: '?', description: 'Show Help', action: 'showHelp' },
];

export default useKeyboardShortcuts;
