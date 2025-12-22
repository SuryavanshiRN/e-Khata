const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Portfolio = require("../models/Portfolio");
const advisorEngine = require("../utils/advisorEngine");

exports.getFinancialAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question } = req.body;

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: since },
    });

    const incomes = await Income.find({ user: userId });
    const portfolio = await Portfolio.find({ user: userId });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const advice = advisorEngine({
      question,
      expenses,
      income: totalIncome,
      portfolio,
    });

    res.json({
      advice,
      stats: {
        expenses: expenses.length,
        income: totalIncome,
        portfolioCount: portfolio.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      advice: "Unable to analyze your data right now.",
    });
  }
};
