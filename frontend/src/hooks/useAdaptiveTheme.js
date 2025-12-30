import { useState, useEffect, useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';

const useAdaptiveTheme = () => {
  const { totalExpenses } = useContext(ExpenseContext);
  const [themeMode, setThemeMode] = useState('auto');
  const [financeMood, setFinanceMood] = useState('neutral');
  const [specialTheme, setSpecialTheme] = useState(null);

  // Auto dark mode by time
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      
      if (themeMode === 'auto') {
        // Auto dark mode from 6 PM to 6 AM
        if (hour >= 18 || hour < 6) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [themeMode]);

  // Finance mood theming based on budget performance
  useEffect(() => {
    const calculateFinanceMood = () => {
      // Get current month expenses
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Assume average budget of ₹30,000 per month (can be customized)
      const monthlyBudget = 30000;
      
      // Calculate percentage of budget used
      const budgetUsed = (totalExpenses / monthlyBudget) * 100;

      let mood;
      if (budgetUsed > 90) {
        mood = 'overspend'; // Warm red/pink
      } else if (budgetUsed > 70) {
        mood = 'caution'; // Orange/yellow
      } else if (budgetUsed > 50) {
        mood = 'neutral'; // Default turquoise
      } else {
        mood = 'under-budget'; // Cool blue/green
      }

      setFinanceMood(mood);
      applyFinanceMoodTheme(mood);
    };

    if (totalExpenses !== undefined) {
      calculateFinanceMood();
    }
  }, [totalExpenses]);

  // Check for special festival/seasonal themes
  useEffect(() => {
    const checkSpecialThemes = () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();

      // Diwali (October/November) - Check range
      if ((month === 9 && day >= 20) || (month === 10 && day <= 15)) {
        setSpecialTheme('diwali');
        applySpecialTheme('diwali');
      }
      // Christmas (December)
      else if (month === 11 && day >= 20) {
        setSpecialTheme('christmas');
        applySpecialTheme('christmas');
      }
      // New Year (January)
      else if (month === 0 && day <= 7) {
        setSpecialTheme('newyear');
        applySpecialTheme('newyear');
      }
      // Holi (March)
      else if (month === 2 && day >= 15 && day <= 25) {
        setSpecialTheme('holi');
        applySpecialTheme('holi');
      }
      else {
        setSpecialTheme(null);
      }
    };

    checkSpecialThemes();
  }, []);

  // Apply finance mood theme colors
  const applyFinanceMoodTheme = (mood) => {
    const root = document.documentElement;

    switch (mood) {
      case 'overspend':
        // Warm red/pink theme
        root.style.setProperty('--theme-primary-from', '#ef4444'); // red-500
        root.style.setProperty('--theme-primary-via', '#ec4899'); // pink-500
        root.style.setProperty('--theme-primary-to', '#f97316'); // orange-500
        root.style.setProperty('--theme-glow', 'rgba(239, 68, 68, 0.5)');
        break;

      case 'caution':
        // Orange/yellow theme
        root.style.setProperty('--theme-primary-from', '#f59e0b'); // amber-500
        root.style.setProperty('--theme-primary-via', '#eab308'); // yellow-500
        root.style.setProperty('--theme-primary-to', '#f97316'); // orange-500
        root.style.setProperty('--theme-glow', 'rgba(245, 158, 11, 0.5)');
        break;

      case 'under-budget':
        // Cool blue/green theme
        root.style.setProperty('--theme-primary-from', '#06b6d4'); // cyan-500
        root.style.setProperty('--theme-primary-via', '#0ea5e9'); // sky-500
        root.style.setProperty('--theme-primary-to', '#10b981'); // emerald-500
        root.style.setProperty('--theme-glow', 'rgba(6, 182, 212, 0.5)');
        break;

      default:
        // Neutral turquoise theme (default - CHANGED from purple)
        root.style.setProperty('--theme-primary-from', '#14b8a6'); // turquoise-500
        root.style.setProperty('--theme-primary-via', '#0d9488'); // teal-600
        root.style.setProperty('--theme-primary-to', '#06b6d4'); // cyan-500
        root.style.setProperty('--theme-glow', 'rgba(20, 184, 166, 0.5)');
    }
  };

  // Apply special festival themes
  const applySpecialTheme = (theme) => {
    const root = document.documentElement;

    switch (theme) {
      case 'diwali':
        // Golden/orange Diwali theme
        root.style.setProperty('--theme-primary-from', '#f59e0b'); // amber-500
        root.style.setProperty('--theme-primary-via', '#d97706'); // amber-600
        root.style.setProperty('--theme-primary-to', '#ea580c'); // orange-600
        root.style.setProperty('--theme-glow', 'rgba(245, 158, 11, 0.6)');
        break;

      case 'christmas':
        // Red/green Christmas theme
        root.style.setProperty('--theme-primary-from', '#dc2626'); // red-600
        root.style.setProperty('--theme-primary-via', '#16a34a'); // green-600
        root.style.setProperty('--theme-primary-to', '#b91c1c'); // red-700
        root.style.setProperty('--theme-glow', 'rgba(220, 38, 38, 0.5)');
        break;

      case 'newyear':
        // Gold/silver New Year theme
        root.style.setProperty('--theme-primary-from', '#fbbf24'); // amber-400
        root.style.setProperty('--theme-primary-via', '#94a3b8'); // slate-400
        root.style.setProperty('--theme-primary-to', '#f59e0b'); // amber-500
        root.style.setProperty('--theme-glow', 'rgba(251, 191, 36, 0.6)');
        break;

      case 'holi':
        // Vibrant multi-color Holi theme (with turquoise)
        root.style.setProperty('--theme-primary-from', '#ec4899'); // pink-500
        root.style.setProperty('--theme-primary-via', '#14b8a6'); // turquoise-500
        root.style.setProperty('--theme-primary-to', '#06b6d4'); // cyan-500
        root.style.setProperty('--theme-glow', 'rgba(236, 72, 153, 0.5)');
        break;
    }
  };

  // Manual theme toggle
  const toggleTheme = () => {
    if (themeMode === 'auto') {
      setThemeMode('light');
      document.documentElement.classList.remove('dark');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
      document.documentElement.classList.add('dark');
    } else {
      setThemeMode('auto');
    }
  };

  // Get theme status message
  const getThemeStatus = () => {
    let status = {
      mode: themeMode,
      mood: financeMood,
      special: specialTheme,
      message: ''
    };

    if (specialTheme) {
      const themeNames = {
        'diwali': '🪔 Diwali Theme',
        'christmas': '🎄 Christmas Theme',
        'newyear': '🎉 New Year Theme',
        'holi': '🌈 Holi Theme'
      };
      status.message = themeNames[specialTheme] || '';
    } else {
      const moodMessages = {
        'overspend': '⚠️ Budget Alert Theme',
        'caution': '⚡ Caution Theme',
        'under-budget': '✨ Saving Mode Theme',
        'neutral': '🌊 Turquoise Theme'
      };
      status.message = moodMessages[financeMood] || '';
    }

    return status;
  };

  return {
    themeMode,
    financeMood,
    specialTheme,
    toggleTheme,
    getThemeStatus
  };
};

export default useAdaptiveTheme;
