const express = require('express');
const { exportPDF, exportCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// PDF export route
router.get('/pdf', protect, exportPDF);

// CSV export route
router.get('/csv', protect, exportCSV);

module.exports = router;
