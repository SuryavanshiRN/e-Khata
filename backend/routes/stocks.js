// backend/routes/stocks.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');


router.get('/quote/:ticker', stockController.quote);
router.get('/history/:ticker', stockController.history);


module.exports = router;