const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getFinancialAdvice } = require("../controllers/aiAdvisorController");

router.post("/advisor", protect, getFinancialAdvice);

module.exports = router;
