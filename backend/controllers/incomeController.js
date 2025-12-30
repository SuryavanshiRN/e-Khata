const { validationResult } = require('express-validator');
const Income = require('../models/Income');

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res) => {
  try {
    const { source, startDate, endDate } = req.query;
    
    let filter = { user: req.user._id };
    
    // Source filter
    if (source) {
      filter.source = source;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    const incomes = await Income.find(filter).sort({ date: -1 });
    
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
const getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    // Check if user owns the income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new income
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount, source, date, description } = req.body;

    const income = await Income.create({
      user: req.user._id,
      title,
      amount,
      source,
      date,
      description,
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Check if user owns the income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, amount, source, date, description } = req.body;

    income.title = title || income.title;
    income.amount = amount !== undefined ? amount : income.amount;
    income.source = source || income.source;
    income.date = date || income.date;
    income.description = description !== undefined ? description : income.description;

    const updatedIncome = await income.save();

    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Check if user owns the income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await income.deleteOne();

    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};
