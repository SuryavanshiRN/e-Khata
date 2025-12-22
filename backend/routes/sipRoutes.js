const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSIP,
  getSIPs,
  getSIP,
  updateSIP,
  deleteSIP,
  searchFunds,
  refreshSIP
} = require('../controllers/sipController');

// Fund search (must be before /:id routes)
router.get('/search-funds', protect, searchFunds);

// SIP CRUD operations
router.post('/', protect, createSIP);
router.get('/', protect, getSIPs);
router.get('/:id', protect, getSIP);
router.put('/:id', protect, updateSIP);
router.delete('/:id', protect, deleteSIP);

// Refresh valuation
router.post('/:id/refresh', protect, refreshSIP);

module.exports = router;
