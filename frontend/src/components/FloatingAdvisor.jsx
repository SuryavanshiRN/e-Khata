import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFinancialAdvice } from '../api/ai';

/* 🔧 Helper to enhance weak AI responses */
const enhanceShortAnswer = (text) => {
  if (!text || text.length < 80) {
    return `${text || '🤖 I need more financial data to give a detailed answer.'}

💡 Tip: Try asking about spending trends, savings health, or portfolio diversification.`;
  }
  return text;
};

const FloatingAdvisor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: `👋 Hi! I'm your AI Financial Advisor.

You can ask me about:
• Spending analysis
• Savings health
• Portfolio risk & diversification
• Investment mistakes
• Financial priorities

💡 Tip: The more financial data you add, the smarter my advice becomes.`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Focus input */
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFinancialAdvice(userMessage.text);

      const adviceText =
        response?.data?.advice?.trim() ||
        '🤖 I need more financial data to give a useful answer.';

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: enhanceShortAnswer(adviceText),
        timestamp: new Date(),
        trends: response?.data?.trends,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          isError: true,
          text:
            '❌ I ran into an issue analyzing your data.\n\nPlease make sure you have added expenses, income, or portfolio data and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are my biggest spending categories?',
    'Is my savings rate healthy?',
    'Am I over-concentrated in one stock?',
    'What investment mistakes should I avoid?',
    'How can I improve my portfolio?',
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-primary rounded-full shadow-glow flex items-center justify-center text-3xl z-50"
          >
            🤖
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed z-50 glass-card flex flex-col ${
              isMaximized
                ? 'inset-4'
                : 'bottom-6 right-6 w-96 h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-primary text-white flex justify-between items-center rounded-t-2xl">
              <h3 className="font-semibold">AI Financial Advisor</h3>
              <div className="flex gap-2">
                <button onClick={() => setIsMaximized(!isMaximized)}>
                  {isMaximized ? '🗕' : '🗖'}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMaximized(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.type === 'user'
                        ? 'bg-gradient-primary text-white'
                        : msg.isError
                        ? 'bg-red-100 text-red-700'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="text-sm text-gray-500">🤖 Thinking...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && !isLoading && (
              <div className="p-3 border-t">
                <p className="text-xs text-gray-500 mb-2">💡 Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-full border"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-full bg-gradient-primary text-white"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAdvisor;
