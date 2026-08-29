const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateMySupportInsight } = require('../controllers/insightController');

const router = express.Router();
router.post('/student-support', protect, generateMySupportInsight);

module.exports = router;
