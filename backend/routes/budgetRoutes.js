const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  setBudget,
  updateBudget,
  getBudgets,
  getBudget,
  deleteBudget,
  getBudgetSummary
} = require('../controllers/budgetController');
const { protect: auth } = require('../middleware/auth');

// Validation rules
const budgetValidation = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Other'])
    .withMessage('Invalid category'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

const updateBudgetValidation = [
  body('category')
    .optional()
    .trim()
    .isIn(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Other'])
    .withMessage('Invalid category'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid budget ID')
];

const summaryValidation = [
  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  param('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

const queryValidation = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
  query('category')
    .optional()
    .isIn(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Other'])
    .withMessage('Invalid category')
];

// Routes
// @route   POST /api/budgets
// @desc    Set a new budget
// @access  Private
router.post('/', auth, budgetValidation, setBudget);

// @route   GET /api/budgets
// @desc    Get all budgets for user (with optional filters)
// @access  Private
router.get('/', auth, queryValidation, getBudgets);

// @route   GET /api/budgets/summary/:month/:year
// @desc    Get budget summary for a specific month
// @access  Private
router.get('/summary/:month/:year', auth, summaryValidation, getBudgetSummary);

// @route   GET /api/budgets/:id
// @desc    Get single budget by ID
// @access  Private
router.get('/:id', auth, idValidation, getBudget);

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, [...idValidation, ...updateBudgetValidation], updateBudget);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, idValidation, deleteBudget);

module.exports = router;
