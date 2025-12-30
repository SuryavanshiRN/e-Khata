const mongoose = require('mongoose');

const MonthlyBudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Other'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount cannot be negative']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year must be 2100 or earlier']
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per category per month/year per user
MonthlyBudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Virtual to get formatted month/year
MonthlyBudgetSchema.virtual('period').get(function() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[this.month - 1]} ${this.year}`;
});

// Method to check if budget is for current month
MonthlyBudgetSchema.methods.isCurrentMonth = function() {
  const now = new Date();
  return this.month === now.getMonth() + 1 && this.year === now.getFullYear();
};

module.exports = mongoose.model('MonthlyBudget', MonthlyBudgetSchema);
