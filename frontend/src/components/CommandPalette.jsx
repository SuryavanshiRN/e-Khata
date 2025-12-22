import { KBarProvider, KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, KBarResults, useMatches } from 'kbar';
import { motion } from 'framer-motion';

const CommandPalette = ({ children, onAddExpense, onAddIncome, onOpenAdvisor, onExportData, onNavigateTab, onNavigatePage }) => {

  const actions = [
    // Quick Actions
    {
      id: 'addExpense',
      name: 'Add Expense',
      shortcut: ['e'],
      keywords: 'new expense create add',
      section: 'Actions',
      perform: () => onAddExpense?.(),
      icon: '💳',
    },
    {
      id: 'addIncome',
      name: 'Add Income',
      shortcut: ['i'],
      keywords: 'new income create add',
      section: 'Actions',
      perform: () => onAddIncome?.(),
      icon: '💰',
    },
    {
      id: 'openAdvisor',
      name: 'Open AI Advisor',
      shortcut: ['a'],
      keywords: 'ai advisor help assistant chatbot',
      section: 'Actions',
      perform: () => onOpenAdvisor?.(),
      icon: '🤖',
    },
    {
      id: 'exportData',
      name: 'Export Data',
      shortcut: ['x'],
      keywords: 'export download csv pdf backup',
      section: 'Actions',
      perform: () => onExportData?.(),
      icon: '📥',
    },

    // Navigation
    {
      id: 'navExpenses',
      name: 'Go to Expenses',
      shortcut: ['1'],
      keywords: 'navigate expenses tab',
      section: 'Navigation',
      perform: () => onNavigateTab?.('expenses'),
      icon: '📊',
    },
    {
      id: 'navIncome',
      name: 'Go to Income',
      shortcut: ['2'],
      keywords: 'navigate income tab',
      section: 'Navigation',
      perform: () => onNavigateTab?.('income'),
      icon: '💵',
    },
    {
      id: 'navInsights',
      name: 'Go to Insights',
      shortcut: ['3'],
      keywords: 'navigate insights analytics tab',
      section: 'Navigation',
      perform: () => onNavigateTab?.('insights'),
      icon: '📈',
    },
    {
      id: 'navSummary',
      name: 'Go to Summary',
      shortcut: ['4'],
      keywords: 'navigate summary overview tab',
      section: 'Navigation',
      perform: () => onNavigateTab?.('summary'),
      icon: '📋',
    },
    {
      id: 'navDashboard',
      name: 'Go to Dashboard',
      keywords: 'navigate dashboard home',
      section: 'Navigation',
      perform: () => onNavigatePage?.('/dashboard'),
      icon: '🏠',
    },
    {
      id: 'navRecurring',
      name: 'Go to Recurring Expenses',
      keywords: 'navigate recurring subscriptions',
      section: 'Navigation',
      perform: () => onNavigatePage?.('/recurring-expenses'),
      icon: '🔄',
    },

    // Filters (example - can be expanded)
    {
      id: 'filterFood',
      name: 'Filter by Food',
      keywords: 'filter category food restaurant',
      section: 'Filters',
      perform: () => onNavigateTab?.('expenses', 'Food'),
      icon: '🍔',
    },
    {
      id: 'filterTransport',
      name: 'Filter by Transport',
      keywords: 'filter category transport uber taxi',
      section: 'Filters',
      perform: () => onNavigateTab?.('expenses', 'Transport'),
      icon: '🚗',
    },
    {
      id: 'filterShopping',
      name: 'Filter by Shopping',
      keywords: 'filter category shopping amazon',
      section: 'Filters',
      perform: () => onNavigateTab?.('expenses', 'Shopping'),
      icon: '🛍️',
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[100] backdrop-blur-sm bg-black/30">
          <KBarAnimator className="max-w-2xl w-full mx-auto mt-32">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="glass-card backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-modal-lg border border-gray-200/30 dark:border-gray-700/30 overflow-hidden"
            >
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <KBarSearch
                  className="w-full px-12 py-4 bg-transparent border-none outline-none text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Type a command or search..."
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <RenderResults />
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">ESC</kbd>
                  <span>Close</span>
                </div>
              </div>
            </motion.div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
            {item}
          </div>
        ) : (
          <motion.div
            className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center gap-3 ${
              active
                ? 'bg-gradient-primary-soft dark:bg-gradient-primary-soft border-l-4 border-teal-500'
                : 'border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            whileHover={{ x: 4 }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800 dark:text-gray-100">{item.name}</div>
              {item.subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</div>
              )}
            </div>
            {item.shortcut && item.shortcut.length > 0 && (
              <div className="flex gap-1">
                {item.shortcut.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            )}
          </motion.div>
        )
      }
    />
  );
}

export default CommandPalette;
