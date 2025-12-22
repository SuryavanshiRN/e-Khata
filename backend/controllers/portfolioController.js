const Portfolio = require('../models/Portfolio');
const axios = require('axios');

exports.getPortfolio = async (req, res) => {
  const stocks = await Portfolio.find({ user: req.user._id });

  let invested = 0;
  let current = 0;

  const enriched = await Promise.all(
    stocks.map(async (s) => {
      const r = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${process.env.STOCK_API_KEY}`
      );

      const currentPrice = r.data.c || s.buyPrice;
      const stockInvested = s.quantity * s.buyPrice;
      const stockCurrent = s.quantity * currentPrice;

      invested += stockInvested;
      current += stockCurrent;

      return {
        ...s.toObject(),
        currentPrice,
        invested: stockInvested,
        currentValue: stockCurrent,
        profitLoss: stockCurrent - stockInvested,
      };
    })
  );

  res.json({
    stocks: enriched,
    summary: {
      invested,
      current,
      profitLoss: current - invested,
      profitLossPercent:
        invested === 0 ? 0 : (((current - invested) / invested) * 100).toFixed(2),
    },
  });
};

exports.addStock = async (req, res) => {
  const { symbol, quantity, buyPrice } = req.body;

  const stock = await Portfolio.create({
    user: req.user._id,
    symbol,
    quantity,
    buyPrice,
    currentPrice: buyPrice,
  });

  res.status(201).json(stock);
};

exports.removeStock = async (req, res) => {
  await Portfolio.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Stock removed' });
};
