const express = require('express');
const { body } = require('express-validator');
const {
  getRecurringExpenses,
  getRecurringExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
} = require('../controllers/recurringExpenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getRecurringExpenses)
  .post(
    protect,
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('amount').isNumeric().withMessage('Amount must be a number'),
      body('category').notEmpty().withMessage('Category is required'),
      body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
      body('nextDate').isISO8601().withMessage('Valid date is required'),
    ],
    createRecurringExpense
  );

router
  .route('/:id')
  .get(protect, getRecurringExpense)
  .put(
    protect,
    [
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('amount').optional().isNumeric().withMessage('Amount must be a number'),
      body('category').optional().notEmpty().withMessage('Category cannot be empty'),
      body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
      body('nextDate').optional().isISO8601().withMessage('Valid date is required'),
    ],
    updateRecurringExpense
  )
  .delete(protect, deleteRecurringExpense);

router.route('/:id/toggle').patch(protect, toggleRecurringExpense);

module.exports = router;
