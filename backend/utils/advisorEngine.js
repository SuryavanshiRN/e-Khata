function analyzeExpenses(expenses) {
  const categories = {};
  let total = 0;

  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
    total += e.amount;
  });

  const sorted = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]);

  return { categories, sorted, total };
}

function analyzePortfolio(portfolio) {
  if (!portfolio || portfolio.length === 0) {
    return {
      exists: false,
      risk: "NONE",
      topHolding: null,
      concentration: 0,
    };
  }

  // Normalize value safely
  const normalized = portfolio.map(p => {
    const value =
      p.value ??
      (p.quantity && p.currentPrice
        ? p.quantity * p.currentPrice
        : p.amount ?? 0);

    return {
      name: p.stockName || p.symbol || p.ticker || "Unknown Stock",
      value,
    };
  });

  const totalValue = normalized.reduce((sum, p) => sum + p.value, 0);

  if (totalValue === 0) {
    return {
      exists: true,
      risk: "LOW",
      topHolding: "No priced holdings",
      concentration: 0,
    };
  }

  const top = normalized.reduce((max, p) =>
    p.value > max.value ? p : max
  );

  const concentration = ((top.value / totalValue) * 100).toFixed(1);

  let risk = "LOW";
  if (concentration >= 60) risk = "HIGH";
  else if (concentration >= 40) risk = "MODERATE";

  return {
    exists: true,
    risk,
    topHolding: top.name,
    concentration,
  };
}


function calculateSavingsRate(income, expenses) {
  if (income === 0) return 0;
  return (((income - expenses) / income) * 100).toFixed(1);
}

function advisorEngine({ question, expenses, income, portfolio }) {
  const q = question.toLowerCase();

  const expenseData = analyzeExpenses(expenses);
  const portfolioData = analyzePortfolio(portfolio);
  const savingsRate = calculateSavingsRate(income, expenseData.total);

  // 🔹 PORTFOLIO CONCENTRATION / RISK
  if (
    q.includes("portfolio") ||
    q.includes("risk") ||
    q.includes("concentrated") ||
    q.includes("stock")
  ) {
    if (!portfolioData.exists) {
      return `
📉 Portfolio Analysis

You currently have no investments recorded.

Advice:
• Start with diversified instruments (index funds / ETFs)
• Avoid putting all money in one stock
• Begin with long-term goals
`;
    }

    return `
📊 Portfolio Risk Analysis

Risk Level: ${portfolioData.risk}

Top Holding:
• ${portfolioData.topHolding} (${portfolioData.concentration}% of portfolio)

Insights:
• Anything above 40% in one stock increases risk
• Your current exposure suggests ${portfolioData.risk === "HIGH" ? "over-concentration" : "reasonable diversification"}

Actionable Advice:
• Diversify across sectors
• Add mutual funds or ETFs
• Review allocation quarterly
`;
  }

  // 🔹 SPENDING REDUCTION
  if (
    q.includes("reduce") ||
    q.includes("cut") ||
    q.includes("spending") ||
    q.includes("expenses")
  ) {
    if (expenseData.sorted.length === 0) {
      return "No expense data found for analysis.";
    }

    const [topCategory, topAmount] = expenseData.sorted[0];

    return `
💸 Spending Optimization

Your highest expense category:
• ${topCategory}: ₹${topAmount}

What you can do:
• Reduce this category by 10–20%
• Set a monthly cap for ${topCategory}
• Track daily expenses for awareness

Impact:
• Even a 15% cut here improves savings significantly
`;
  }

  // 🔹 SAVINGS HEALTH
  if (q.includes("saving")) {
    let health = "NEEDS IMPROVEMENT";
    if (savingsRate >= 30) health = "EXCELLENT";
    else if (savingsRate >= 20) health = "GOOD";

    return `
💰 Savings Health Check

Your savings rate: ${savingsRate}%

Status: ${health}

Guidelines:
• Ideal savings: 20–30%
• Emergency fund: 6 months of expenses

Advice:
• Continue disciplined saving
• Invest surplus wisely
`;
  }

  // 🔹 MISTAKES
  if (
    q.includes("mistake") ||
    q.includes("avoid") ||
    q.includes("wrong")
  ) {
    return `
⚠️ Common Financial Mistakes to Avoid

• Over-concentration in a single stock
• Ignoring emergency fund
• Lifestyle inflation
• Not reviewing expenses monthly
• Emotional investing during market swings
`;
  }

  // 🔹 BIGGEST CATEGORIES
  if (
    q.includes("category") ||
    q.includes("categories") ||
    q.includes("where") ||
    q.includes("spent")
  ) {
    if (expenseData.sorted.length === 0) {
      return "No expense categories available.";
    }

    const topCategories = expenseData.sorted
      .slice(0, 3)
      .map(([cat, amt]) => `• ${cat}: ₹${amt}`)
      .join("\n");

    return `
📂 Top Spending Categories

${topCategories}

Tip:
• Focus on reducing the top category first
• Category-wise budgeting works best
`;
  }

  // 🔹 FALLBACK (SMART)
  return `
🤔 Financial Insight

Based on your data:
• Expenses: ₹${expenseData.total}
• Income: ₹${income}
• Savings Rate: ${savingsRate}%

Try asking:
• "How can I improve my portfolio?"
• "Where should I cut expenses?"
• "Is my financial health good?"
`;
}

module.exports = advisorEngine;
