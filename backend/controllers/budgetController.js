const MonthlyBudget = require('../models/MonthlyBudget');
const { validationResult } = require('express-validator');

// @desc    Set budget for a category and month
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { category, amount, month, year } = req.body;
    const userId = req.user.id;

    // Check if budget already exists for this category/month/year
    const existingBudget = await MonthlyBudget.findOne({
      userId,
      category,
      month,
      year
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `Budget for ${category} in ${month}/${year} already exists. Use update instead.`
      });
    }

    // Create new budget
    const budget = await MonthlyBudget.create({
      userId,
      category,
      amount,
      month,
      year
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });

  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating budget',
      error: error.message
    });
  }
};

// @desc    Update existing budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const budget = await MonthlyBudget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    const { category, amount, month, year } = req.body;

    // If category, month, or year is being changed, check for conflicts
    if (category || month || year) {
      const checkCategory = category || budget.category;
      const checkMonth = month || budget.month;
      const checkYear = year || budget.year;

      const existingBudget = await MonthlyBudget.findOne({
        userId: req.user.id,
        category: checkCategory,
        month: checkMonth,
        year: checkYear,
        _id: { $ne: req.params.id }
      });

      if (existingBudget) {
        return res.status(400).json({
          success: false,
          message: `Budget for ${checkCategory} in ${checkMonth}/${checkYear} already exists`
        });
      }
    }

    // Update budget
    const updatedBudget = await MonthlyBudget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating budget',
      error: error.message
    });
  }
};

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };

    if (month) {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (category) {
      query.category = category;
    }

    // Get budgets
    const budgets = await MonthlyBudget.find(query)
      .sort({ year: -1, month: -1, category: 1 });

    // Get current month/year if no filters
    let currentMonthBudgets = [];
    if (!month && !year) {
      const now = new Date();
      currentMonthBudgets = budgets.filter(
        b => b.month === now.getMonth() + 1 && b.year === now.getFullYear()
      );
    }

    res.status(200).json({
      success: true,
      count: budgets.length,
      currentMonthCount: currentMonthBudgets.length,
      data: budgets
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budgets',
      error: error.message
    });
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const budget = await MonthlyBudget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget',
      error: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await MonthlyBudget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.remove();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: {}
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting budget',
      error: error.message
    });
  }
};

// @desc    Get budget summary for a month
// @route   GET /api/budgets/summary/:month/:year
// @access  Private
exports.getBudgetSummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    const userId = req.user.id;

    const budgets = await MonthlyBudget.find({
      userId,
      month: parseInt(month),
      year: parseInt(year)
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        month: parseInt(month),
        year: parseInt(year),
        budgets,
        totalBudget,
        budgetCount: budgets.length
      }
    });

  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget summary',
      error: error.message
    });
  }
};
