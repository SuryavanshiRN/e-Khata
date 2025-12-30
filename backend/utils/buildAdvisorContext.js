module.exports = function buildAdvisorContext({
  expenses,
  income,
  portfolio,
}) {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  let portfolioSummary = "No investments found.";
  let riskLevel = "LOW";
  let topHolding = null;

  if (portfolio.length > 0) {
    const totalValue = portfolio.reduce(
      (s, p) => s + p.quantity * p.currentPrice,
      0
    );

    const breakdown = portfolio.map((p) => {
      const value = p.quantity * p.currentPrice;
      const percent = ((value / totalValue) * 100).toFixed(1);
      return { symbol: p.symbol, percent };
    });

    breakdown.sort((a, b) => b.percent - a.percent);
    topHolding = breakdown[0];

    if (topHolding.percent > 60) riskLevel = "HIGH";
    else if (topHolding.percent > 40) riskLevel = "MODERATE";

    portfolioSummary = breakdown
      .map((b) => `${b.symbol}: ${b.percent}%`)
      .join(", ");
  }

  return {
    summaryText: `
FINANCIAL SNAPSHOT:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpenses}
- Savings Rate: ${savingsRate}%

PORTFOLIO:
- Risk Level: ${riskLevel}
- Top Holding: ${topHolding?.symbol || "None"} (${topHolding?.percent || 0}%)
- Allocation: ${portfolioSummary}
    `,
    trends: {
      totalExpenses,
      totalIncome,
      savingsRate,
    },
  };
};
