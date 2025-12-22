import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as aiAPI from '../api/ai';
import VoiceInput from './VoiceInput';

const SmartAddExpense = ({ onExpenseDetected }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [parsedHints, setParsedHints] = useState(null);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const { i18n } = useTranslation();
  const debounceTimer = useRef(null);

  // Handle voice transcript
  const handleVoiceTranscript = (transcript) => {
    setText(transcript);
  };

  // Real-time NLP parsing with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.trim().length < 3) {
      setParsedHints(null);
      setSuggestedCategories([]);
      setConfidence(0);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        // Simple client-side parsing for instant feedback
        const parseResult = parseTextLocally(text);
        setParsedHints(parseResult);
        
        // Set confidence based on how much we could parse
        let conf = 0;
        if (parseResult.amount) conf += 40;
        if (parseResult.category) conf += 30;
        if (parseResult.description) conf += 30;
        setConfidence(Math.min(conf, 100));

        // Set suggested categories based on keywords
        const suggestions = getCategorySuggestions(text);
        setSuggestedCategories(suggestions);
      } catch (err) {
        console.error('Parse error:', err);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [text]);

  // Local text parsing function
  const parseTextLocally = (input) => {
    const result = { amount: null, category: null, description: null, date: null };
    
    // Extract amount (₹ symbol or numbers)
    const amountMatch = input.match(/₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract category keywords
    const categoryKeywords = {
      'Food': ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'domino', 'mcdonald', 'kfc'],
      'Transport': ['uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'ride', 'cab'],
      'Shopping': ['bought', 'purchase', 'shopping', 'mall', 'amazon', 'flipkart', 'store', 'clothes', 'shoes'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'prime', 'hotstar', 'game', 'concert'],
      'Bills': ['bill', 'electricity', 'water', 'internet', 'phone', 'rent', 'wifi', 'subscription'],
      'Health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health', 'clinic'],
      'Education': ['book', 'course', 'class', 'tuition', 'education', 'school', 'college']
    };

    const lowerText = input.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        result.category = category;
        break;
      }
    }

    // Extract description (remove amount and currency symbols)
    result.description = input.replace(/₹?\s*\d+(?:,\d{3})*(?:\.\d{2})?/g, '').trim();

    return result;
  };

  // Get category suggestions based on keywords
  const getCategorySuggestions = (input) => {
    const lowerText = input.toLowerCase();
    const suggestions = [];
    
    const categoryKeywords = {
      'Food': ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'domino', 'coffee'],
      'Transport': ['uber', 'ola', 'taxi', 'metro', 'bus', 'ride'],
      'Shopping': ['bought', 'purchase', 'shopping', 'mall'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game'],
      'Bills': ['bill', 'electricity', 'subscription', 'rent'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        suggestions.push(category);
      }
    }

    return suggestions.slice(0, 3); // Top 3 suggestions
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await aiAPI.categorizeExpense(text, i18n.language);
      
      if (result.success) {
        // Show success animation
        setShowSuccess(true);
        
        // Call parent callback with extracted data
        onExpenseDetected(result.data);
        
        // Clear input
        setText('');
        
        // Hide success after 1 second
        setTimeout(() => setShowSuccess(false), 1000);
      } else {
        setError(result.error || 'Failed to categorize expense');
      }
    } catch (err) {
      console.error('Smart add error:', err);
      setError('Failed to process your text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Spent ₹450 at Domino's with friends",
    "Bought coffee ₹120 with Sam",
    "Uber ride to office 250",
    "Netflix subscription 199",
    "Medicines from pharmacy ₹850"
  ];

  const handleExampleClick = (example) => {
    setText(example);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 group">
      {/* Multi-layer gradient background - Exact Good Evening style */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 backdrop-blur-sm"></div>
      
      {/* Animated background pattern - same as greeting */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      
      {/* Glass card overlay - exact match */}
      <div className="relative glass-card backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30 shadow-glass-lg rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass rounded-full p-2 border border-teal-400/30 shadow-glow-sm bg-teal-500/10">
            <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              ✨ Smart Add Expense
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Just type naturally, AI will do the rest!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Try: "Bought coffee ₹120 with Sam" or "Uber ride 250"'
              className="flex-1 px-4 py-3 glass rounded-lg backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none shadow-glass transition-all duration-200"
              rows="2"
              disabled={loading}
            />
            
            {/* Voice Input Button */}
            <div className="flex items-center">
              <VoiceInput 
                onTranscript={handleVoiceTranscript} 
                language={i18n.language}
                placeholder="Click to speak..."
              />
            </div>
            
            {/* Character count */}
            <div className="absolute bottom-2 right-20 text-xs text-gray-400 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded backdrop-blur-sm">
              {text.length}/200
            </div>
          </div>

          {/* Real-time NLP Parsing Hints with Fade Animation */}
          <AnimatePresence>
            {parsedHints && text.trim().length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Detected Info
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {parsedHints.amount && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass backdrop-blur-sm bg-green-500/20 border border-green-400/30 rounded px-2 py-1"
                    >
                      <span className="text-xs text-green-200 font-medium">Amount: </span>
                      <span className="text-sm text-white font-bold">₹{parsedHints.amount}</span>
                    </motion.div>
                  )}
                  {parsedHints.category && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="glass backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded px-2 py-1"
                    >
                      <span className="text-xs text-blue-200 font-medium">Category: </span>
                      <span className="text-sm text-white font-bold">{parsedHints.category}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Category Chip Suggestions */}
          <AnimatePresence>
            {suggestedCategories.length > 0 && text.trim().length > 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Suggested Categories
                </div>
                <div className="flex gap-2 flex-wrap">
                  {suggestedCategories.map((category, index) => (
                    <motion.div
                      key={category}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                      className="glass backdrop-blur-sm bg-teal-500/20 border border-teal-400/30 rounded-full px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 font-medium hover:bg-teal-500/30 transition-colors cursor-default"
                    >
                      {category}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confidence Indicator Progress Bar */}
          <AnimatePresence>
            {confidence > 0 && text.trim().length > 3 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Parsing Confidence</span>
                  <span className="text-gray-800 dark:text-gray-100 font-bold">{confidence}%</span>
                </div>
                <div className="h-2 glass backdrop-blur-sm bg-white/10 rounded-full overflow-hidden border border-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      confidence >= 80 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : confidence >= 50 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="glass-card bg-gradient-danger-soft backdrop-blur-lg border border-red-300/30 dark:border-red-700/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-glass animate-slide-down">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex-1 glass backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 text-teal-600 dark:text-teal-300 px-6 py-3 rounded-lg hover:bg-white hover:shadow-glow transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : showSuccess ? (
                <>
                  <svg className="w-5 h-5 text-green-500 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 dark:text-green-400">Done!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Categorize
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setText('')}
              className="px-4 py-3 glass backdrop-blur-lg bg-white/20 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-white/30 hover:shadow-glow-sm transition-all duration-200 border border-white/10"
              disabled={loading || !text}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Examples */}
        <div className="mt-4">
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium flex items-center gap-1">
            <span>📝</span>
            <span>Try these examples:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 glass backdrop-blur-sm bg-white/10 text-gray-800 dark:text-gray-200 rounded-full hover:bg-white/20 hover:scale-105 hover:shadow-glow-sm transition-all duration-200 border border-white/10"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 glass-card backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
              AI will extract the amount, category, and details automatically. 
              You can review and edit before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAddExpense;
