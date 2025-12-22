const { validationResult } = require('express-validator');
const RecurringExpense = require('../models/RecurringExpense');

// @desc    Get all recurring expenses
// @route   GET /api/recurring-expenses
// @access  Private
const getRecurringExpenses = async (req, res) => {
  try {
    const { category, frequency, isActive } = req.query;
    
    let filter = { user: req.user._id };
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Frequency filter
    if (frequency) {
      filter.frequency = frequency;
    }
    
    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const recurringExpenses = await RecurringExpense.find(filter).sort({ nextDate: 1 });
    
    res.json(recurringExpenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single recurring expense
// @route   GET /api/recurring-expenses/:id
// @access  Private
const getRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findById(req.params.id);
    
    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }
    
    // Check if user owns the recurring expense
    if (recurringExpense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(recurringExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new recurring expense
// @route   POST /api/recurring-expenses
// @access  Private
const createRecurringExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount, category, frequency, nextDate, notes } = req.body;

    const recurringExpense = await RecurringExpense.create({
      user: req.user._id,
      title,
      amount,
      category,
      frequency,
      nextDate,
      notes,
    });

    res.status(201).json(recurringExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update recurring expense
// @route   PUT /api/recurring-expenses/:id
// @access  Private
const updateRecurringExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recurringExpense = await RecurringExpense.findById(req.params.id);

    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    // Check if user owns the recurring expense
    if (recurringExpense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, amount, category, frequency, nextDate, notes, isActive } = req.body;

    recurringExpense.title = title || recurringExpense.title;
    recurringExpense.amount = amount !== undefined ? amount : recurringExpense.amount;
    recurringExpense.category = category || recurringExpense.category;
    recurringExpense.frequency = frequency || recurringExpense.frequency;
    recurringExpense.nextDate = nextDate || recurringExpense.nextDate;
    recurringExpense.notes = notes !== undefined ? notes : recurringExpense.notes;
    recurringExpense.isActive = isActive !== undefined ? isActive : recurringExpense.isActive;

    const updatedRecurringExpense = await recurringExpense.save();

    res.json(updatedRecurringExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete recurring expense
// @route   DELETE /api/recurring-expenses/:id
// @access  Private
const deleteRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findById(req.params.id);

    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    // Check if user owns the recurring expense
    if (recurringExpense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await recurringExpense.deleteOne();

    res.json({ message: 'Recurring expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle recurring expense active status
// @route   PATCH /api/recurring-expenses/:id/toggle
// @access  Private
const toggleRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findById(req.params.id);

    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    // Check if user owns the recurring expense
    if (recurringExpense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    recurringExpense.isActive = !recurringExpense.isActive;
    const updatedRecurringExpense = await recurringExpense.save();

    res.json(updatedRecurringExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecurringExpenses,
  getRecurringExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
};
