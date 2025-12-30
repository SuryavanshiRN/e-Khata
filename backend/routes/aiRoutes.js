const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getFinancialAdvice, categorizeExpense, parseExpenseText } = require("../controllers/aiAdvisorController");

router.post("/advisor", protect, getFinancialAdvice);
router.post("/categorize", categorizeExpense); // Public - no auth needed
router.post("/parse-expense", parseExpenseText); // Public - smart expense parsing

module.exports = router;
