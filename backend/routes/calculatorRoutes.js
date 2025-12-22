const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  calculateSIP,
  calculateEMI,
  getCalculatorHistory,
  deleteCalculatorResult
} = require('../controllers/calculatorController');

// Public routes (no auth required for calculations)
router.post('/sip-calc', calculateSIP);
router.post('/emi-calc', calculateEMI);

// Protected routes (require authentication)
router.get('/history', protect, getCalculatorHistory);
router.delete('/:id', protect, deleteCalculatorResult);

module.exports = router;
