const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: String,
    quantity: Number,
    buyPrice: Number,
    currentPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
