const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'],
    },
    frequency: {
      type: String,
      required: [true, 'Please provide a frequency'],
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    nextDate: {
      type: Date,
      required: [true, 'Please provide a next date'],
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate next occurrence date
recurringExpenseSchema.methods.calculateNextDate = function() {
  const currentDate = new Date(this.nextDate);
  
  switch(this.frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
  }
  
  return currentDate;
};

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
