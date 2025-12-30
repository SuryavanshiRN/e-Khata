const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags) {
          return tags.every(tag => tag.trim().length > 0);
        },
        message: 'Tags cannot be empty'
      }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
