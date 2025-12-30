import axios from "./axios";

/**
 * Auto-categorize an expense using AI
 * @param {string} text - expense description
 * @param {string} lang - language (default: en)
 */
export const categorizeExpense = async (text, lang = "en") => {
  const res = await axios.post("/ai/categorize", {
    text,
    lang,
  });

  return res.data;
};

/**
 * Parse full expense details from natural language text
 * @param {string} text - natural language expense description
 * @param {string} lang - language (default: en)
 */
export const parseExpenseText = async (text, lang = "en") => {
  const res = await axios.post("/ai/parse-expense", {
    text,
    lang,
  });

  return res.data;
};

/**
 * Ask AI Financial Advisor (expenses + portfolio + market)
 * @param {string} question - user question
 * @param {string} lang - language (default: en)
 */
export const getFinancialAdvice = async (question, lang = "en") => {
  const res = await axios.post("/ai/advisor", {
    question,
    lang,
  });

  return res.data;
};
