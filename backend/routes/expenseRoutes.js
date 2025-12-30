const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getExpenses)
  .post(
    protect,
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('amount').isNumeric().withMessage('Amount must be a number'),
      body('category').notEmpty().withMessage('Category is required'),
    ],
    createExpense
  );

router
  .route('/:id')
  .get(protect, getExpense)
  .put(
    protect,
    [
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('amount').optional().isNumeric().withMessage('Amount must be a number'),
      body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    ],
    updateExpense
  )
  .delete(protect, deleteExpense);

module.exports = router;
