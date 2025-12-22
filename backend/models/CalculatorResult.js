const mongoose = require('mongoose');

const CalculatorResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['SIP', 'EMI'],
    required: true
  },
  monthlyInvestment: Number,
  principal: Number,
  annualRate: {
    type: Number,
    required: true
  },
  months: Number,
  years: Number,
  futureValue: Number,
  totalInvested: Number,
  emi: Number,
  totalPayment: Number,
  totalInterest: Number,
  cagr: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CalculatorResult', CalculatorResultSchema);
