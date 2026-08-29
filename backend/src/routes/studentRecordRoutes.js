const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyRecord, upsertMyRecord, getMyHistory } = require('../controllers/studentRecordController');

const router = express.Router();

router.get('/me', protect, getMyRecord);
router.get('/me/history', protect, getMyHistory);
router.put('/me', protect, upsertMyRecord);

module.exports = router;
