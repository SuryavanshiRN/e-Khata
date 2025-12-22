const mongoose = require('mongoose');

const sipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'SIP name is required'],
    trim: true
  },
  fundSymbol: {
    type: String,
    required: [true, 'Fund symbol is required'],
    uppercase: true,
    trim: true
  },
  fundName: {
    type: String,
    trim: true
  },
  monthlyAmount: {
    type: Number,
    required: [true, 'Monthly amount is required'],
    min: [100, 'Monthly amount must be at least ₹100']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  autoTopup: {
    type: Boolean,
    default: false
  },
  topupPercentage: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Cached data for performance
  lastNavDate: {
    type: Date
  },
  lastNav: {
    type: Number
  },
  currentValue: {
    type: Number,
    default: 0
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  returns: {
    type: Number,
    default: 0
  },
  xirr: {
    type: Number
  },
  cagr: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
sipSchema.index({ user: 1, isActive: 1 });
sipSchema.index({ fundSymbol: 1 });

module.exports = mongoose.model('SIP', sipSchema);
