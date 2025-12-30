import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getFinancialAdvice } from "../api/ai";
import VoiceInput from "../components/VoiceInput";

const AdvisorChat = () => {
  const { i18n } = useTranslation();

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text:
        "👋 Hi! I'm your AI Financial Advisor.\n\n" +
        "You can ask me about:\n" +
        "• Spending analysis\n" +
        "• Saving suggestions\n" +
        "• Portfolio risk & concentration\n" +
        "• Investment mistakes\n" +
        "• Financial priorities",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVoiceTranscript = (text) => {
    setInput(text);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await getFinancialAdvice(
        userMessage.text,
        i18n.language
      );

      /**
       * ✅ BACKEND-SAFE RESPONSE HANDLING
       * Works with:
       * { advice: "..." }
       * { reply: "..." }
       */
      const aiText =
        res?.advice ||
        res?.reply ||
        "I analyzed your data, but couldn't generate a clear response.";

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: aiText,
        timestamp: new Date(),
        trends: res?.trends || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Advisor Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          text:
            "❌ Sorry, something went wrong while analyzing your finances. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Am I over-concentrated in one stock?",
    "What is my portfolio risk level?",
    "Is my portfolio aggressive or conservative?",
    "What mistakes should I avoid with my investments?",
    "What should be my next financial priority?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:to-gray-900">

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6 dark:text-white">
          💡 AI Financial Advisor
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* CHAT AREA */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                        : msg.isError
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 dark:bg-gray-700 dark:text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.trends && (
                      <div className="mt-4 text-sm opacity-90">
                        📊 Quick Stats:
                        <div>💰 Expenses: ₹{msg.trends.totalExpenses}</div>
                        <div>💵 Income: ₹{msg.trends.totalIncome}</div>
                        <div>📈 Savings Rate: {msg.trends.savingsRate}%</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="text-gray-500">🤖 Thinking...</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm hover:bg-teal-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4 flex gap-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-5 py-3 rounded-full border dark:bg-gray-700 dark:text-white"
              placeholder="Ask me anything about your finances..."
              disabled={isLoading}
            />

            <VoiceInput
              onTranscript={handleVoiceTranscript}
              language={i18n.language}
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-full bg-teal-600 text-white font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          🔒 Your data is private • AI analyzes expenses + portfolio
        </p>
      </div>
    </div>
  );
};

export default AdvisorChat;
