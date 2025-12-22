const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

const router = express.Router();
const API_KEY = process.env.STOCK_API_KEY;

router.get("/quote/:symbol", protect, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const { data } = await axios.get(
      "https://finnhub.io/api/v1/quote",
      { params: { symbol, token: API_KEY } }
    );

    if (!data || data.c === 0) {
      return res.status(404).json({ message: "Invalid symbol" });
    }

    res.json({
      symbol,
      price: data.c,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      change: (data.c - data.pc).toFixed(2),
      percent: (((data.c - data.pc) / data.pc) * 100).toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Quote fetch failed" });
  }
});

router.get("/profile/:symbol", protect, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const { data } = await axios.get(
      "https://finnhub.io/api/v1/stock/profile2",
      { params: { symbol, token: API_KEY } }
    );

    res.json(data);
  } catch {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

module.exports = router;
