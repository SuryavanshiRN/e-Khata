const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Portfolio = require("../models/Portfolio");
const MonthlyBudget = require("../models/MonthlyBudget");
const advisorEngine = require("../utils/advisorEngine");
const geminiService = require("../services/geminiService");

exports.getFinancialAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question, language, lang } = req.body;
    const selectedLanguage = language || lang || "en";

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [expenses, incomes, portfolio, budgets] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Income.find({ user: userId }),
      Portfolio.find({ user: userId }),
      MonthlyBudget.find({ user: userId }),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    let advice;
    let isAi = false;

    // Try using Gemini if API key is present
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        advice = await geminiService.getFinancialAdvice(
          { 
            expenses, 
            income: totalIncome, 
            portfolio, 
            budget: budgets 
          },
          question,
          selectedLanguage
        );
        isAi = true;
      } catch (geminiError) {
        console.error("Gemini Error, falling back to heuristic:", geminiError.message);
      }
    }

    // Fallback or if no key
    if (!advice) {
      advice = advisorEngine({
        question,
        expenses,
        income: totalIncome,
        portfolio,
      });
    }

    res.json({
      success: true,
      advice,
      isAi,
      stats: {
        expenses: expenses.length,
        income: totalIncome,
        portfolioCount: portfolio.length,
      },
    });
  } catch (err) {
    console.error("Advisor Controller Error:", err);
    res.status(500).json({
      success: false,
      advice: "Unable to analyze your data right now. Please try again later.",
      error: err.message
    });
  }
};
exports.categorizeExpense = async (req, res) => {
  try {
    const { text, lang, language } = req.body;
    const selectedLanguage = language || lang || "en";

    console.log("📝 Categorize request received:", { text: text?.substring(0, 50), language: selectedLanguage });

    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    let category = "Other";
    let source = "fallback";
    
    // Valid categories list
    const validCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Savings', 'Other'];
    
    // Try Gemini AI first
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const aiCategory = await geminiService.categorizeExpense(text, selectedLanguage);
        console.log("🤖 Gemini returned:", aiCategory);
        
        // Validate and clean the AI response
        const cleanedCategory = aiCategory?.trim().replace(/[^a-zA-Z]/g, '');
        if (validCategories.some(c => c.toLowerCase() === cleanedCategory.toLowerCase())) {
          category = validCategories.find(c => c.toLowerCase() === cleanedCategory.toLowerCase());
          source = "gemini";
        } else {
          console.log("⚠️ Invalid AI category, will use fallback");
        }
      } catch (geminiErr) {
        console.error("Gemini categorization failed, using fallback:", geminiErr.message);
      }
    } else {
      console.log("⚠️ No Gemini API key configured, using keyword fallback");
    }
    
    // Fallback to keyword-based categorization if still "Other"
    if (category === "Other") {
      const lowerText = text.toLowerCase();
      const categoryKeywords = {
        'Food': ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'domino', 'mcdonald', 'kfc', 'zomato', 'swiggy'],
        'Transport': ['uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'ride', 'cab', 'auto', 'rickshaw'],
        'Shopping': ['bought', 'purchase', 'shopping', 'mall', 'amazon', 'flipkart', 'store', 'clothes', 'shoes', 'myntra'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'prime', 'hotstar', 'game', 'concert', 'party'],
        'Bills': ['bill', 'electricity', 'water', 'internet', 'phone', 'rent', 'wifi', 'subscription', 'recharge'],
        'Health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health', 'clinic', 'apollo'],
        'Education': ['book', 'course', 'class', 'tuition', 'education', 'school', 'college', 'udemy', 'coursera']
      };

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
          category = cat;
          source = "keywords";
          break;
        }
      }
    }

    console.log("✅ Category result:", { category, source });
    res.json({ success: true, category, source });
  } catch (err) {
    console.error("Categorize Error:", err);
    res.status(500).json({ success: false, category: "Other", error: err.message });
  }
};

exports.parseExpenseText = async (req, res) => {
  try {
    const { text, lang, language } = req.body;
    const selectedLanguage = language || lang || "en";

    console.log("📝 Parse expense request:", { text: text?.substring(0, 50) });

    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    let expenseData = null;
    let source = "fallback";

    // Try Gemini AI first
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        expenseData = await geminiService.parseExpenseText(text, selectedLanguage);
        source = "gemini";
        console.log("🤖 Gemini parsed:", expenseData);
      } catch (geminiErr) {
        console.error("Gemini parse failed, using fallback:", geminiErr.message);
      }
    }

    // Fallback to local parsing
    if (!expenseData) {
      const amountMatch = text.match(/₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      
      const lowerText = text.toLowerCase();
      let category = 'Other';
      const categoryKeywords = {
        'Food': ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'pizza', 'burger', 'domino', 'zomato', 'swiggy'],
        'Transport': ['uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'fuel', 'petrol', 'ride', 'cab'],
        'Shopping': ['bought', 'purchase', 'shopping', 'mall', 'amazon', 'flipkart', 'store'],
        'Entertainment': ['movie', 'netflix', 'spotify', 'prime', 'hotstar', 'game'],
        'Bills': ['bill', 'electricity', 'internet', 'phone', 'rent', 'wifi', 'subscription'],
        'Health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical'],
        'Education': ['book', 'course', 'tuition', 'education', 'school']
      };

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
          category = cat;
          break;
        }
      }

      expenseData = {
        title: text.substring(0, 50),
        amount,
        category,
        description: text,
        date: new Date().toISOString().split('T')[0]
      };
      source = "local";
    }

    console.log("✅ Parse result:", { ...expenseData, source });
    res.json({ success: true, data: expenseData, source });
  } catch (err) {
    console.error("Parse Expense Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
