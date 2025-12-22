const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPortfolio,
  addStock,
  removeStock,
} = require('../controllers/portfolioController');

router.route('/')
  .get(protect, getPortfolio)
  .post(protect, addStock);

router.route('/:id')
  .delete(protect, removeStock);

module.exports = router;
