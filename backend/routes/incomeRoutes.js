const express = require('express');
const { body } = require('express-validator');
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getIncomes)
  .post(
    protect,
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('amount').isNumeric().withMessage('Amount must be a number'),
      body('source').notEmpty().withMessage('Source is required'),
    ],
    createIncome
  );

router
  .route('/:id')
  .get(protect, getIncome)
  .put(
    protect,
    [
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('amount').optional().isNumeric().withMessage('Amount must be a number'),
      body('source').optional().notEmpty().withMessage('Source cannot be empty'),
    ],
    updateIncome
  )
  .delete(protect, deleteIncome);

module.exports = router;
