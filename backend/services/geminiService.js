const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  // Lazy initialization - called when first method is invoked
  _initializeIfNeeded() {
    if (!this.genAI && process.env.GOOGLE_AI_API_KEY) {
      console.log("✅ Gemini AI initialized with API key");
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
  }

  get apiKey() {
    return process.env.GOOGLE_AI_API_KEY;
  }

  async getFinancialAdvice(userData, question, language = "en") {
    this._initializeIfNeeded();
    
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const { expenses, income, portfolio, budget } = userData;

    // Analyze expense data for better context
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const categoryBreakdown = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (e.amount || 0);
    });
    
    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ₹${amt}`);

    const savingsRate = income > 0 ? Math.round(((income - totalExpenses) / income) * 100) : 0;

    // Portfolio summary
    const portfolioValue = portfolio.reduce((sum, p) => sum + (p.quantity * (p.currentPrice || p.buyPrice || 0)), 0);

    const langText = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const prompt = `You are a smart personal finance assistant. Answer the user's question directly based on their data.

USER'S FINANCIAL SNAPSHOT:
• Monthly Income: ₹${income || 'Not set'}
• Total Spending (last 90 days): ₹${totalExpenses}
• Savings Rate: ${savingsRate}%
• Top Spending: ${topCategories.join(', ') || 'No data'}
• Portfolio Value: ₹${portfolioValue || 0} (${portfolio.length} holdings)
• Budgets Set: ${budget.length}

USER QUESTION: "${question}"

INSTRUCTIONS:
1. DIRECTLY answer the question using the data above
2. If asking about spending - reference their actual categories and amounts
3. If asking about savings - use their savings rate
4. If asking about investments - mention their portfolio
5. If they have no data in a category, say so and give general advice
6. Keep response under 80 words
7. Be conversational but helpful
8. Respond in ${langText}

Format:
[Direct answer in 2-3 sentences]

💡 Tip: [One actionable suggestion based on their data]`;

    try {
      console.log("🤖 Sending to Gemini:", { question, income, totalExpenses, savingsRate });
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Advisor Error:", error);
      throw new Error("Failed to get response from AI");
    }
  }

  async parseReceipt(buffer, mimeType) {
    this._initializeIfNeeded();
    
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
    {
      "merchant": "Name of the store or service",
      "amount": number (total amount paid),
      "currency": "e.g., INR, USD",
      "category": "One of: Food, Transport, Shopping, Bills, Health, Entertainment, Other",
      "date": "YYYY-MM-DD",
      "items": [{"name": "item name", "price": number}],
      "confidence": number (0-100)
    }
    
    If you cannot find a specific field, return null for that field. 
    Only return the JSON object, nothing else.
    `;

    try {
      const imagePart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text (sometimes Gemini adds ```json ... ```)
      const jsonStr = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini OCR Error:", error);
      throw new Error("Failed to parse receipt with AI");
    }
  }

  async categorizeExpense(text, language = "en") {
    this._initializeIfNeeded();
    
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = `
    Categorize the following expense description into one of these categories: 
    Food, Transport, Shopping, Bills, Health, Entertainment, Education, Savings, Other.

    Description: "${text}"
    Language: ${language}

    Respond with ONLY the category name.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Gemini Categorization Error:", error);
      return "Other";
    }
  }

  async parseExpenseText(text, language = "en") {
    this._initializeIfNeeded();
    
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const today = new Date().toISOString().split('T')[0];

    const prompt = `
    You are an expense parser. Extract structured expense information from the following natural language text.

    Text: "${text}"

    Return a JSON object with these fields:
    {
      "title": "Short expense title (max 50 chars)",
      "amount": number (extract the amount, return 0 if not found),
      "category": "One of: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Savings, Other",
      "description": "Brief description of the expense",
      "date": "${today}" (use today's date unless a specific date is mentioned)
    }

    Examples:
    - "Spent ₹450 at Domino's with friends" → {"title": "Domino's pizza", "amount": 450, "category": "Food", "description": "Pizza with friends at Domino's", "date": "${today}"}
    - "Uber ride to office 250" → {"title": "Uber ride to office", "amount": 250, "category": "Transport", "description": "Cab ride to office", "date": "${today}"}
    - "Netflix subscription 199" → {"title": "Netflix subscription", "amount": 199, "category": "Entertainment", "description": "Monthly Netflix subscription", "date": "${today}"}

    IMPORTANT: Return ONLY the JSON object, no markdown formatting or extra text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      // Clean the response (remove potential markdown code blocks)
      const jsonStr = responseText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      
      // Validate and sanitize the response
      return {
        title: parsed.title || text.substring(0, 50),
        amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
        category: parsed.category || 'Other',
        description: parsed.description || text,
        date: parsed.date || today
      };
    } catch (error) {
      console.error("Gemini Parse Expense Error:", error);
      throw new Error("Failed to parse expense text");
    }
  }
}

module.exports = new GeminiService();
