const axios = require('axios');

exports.getStock = async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const r = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.STOCK_API_KEY}`
    );

    res.json({
      symbol,
      currentPrice: r.data.c,
      open: r.data.o,
      high: r.data.h,
      low: r.data.l,
      previousClose: r.data.pc,
    });
  } catch {
    res.status(500).json({ message: 'Stock fetch failed' });
  }
};
