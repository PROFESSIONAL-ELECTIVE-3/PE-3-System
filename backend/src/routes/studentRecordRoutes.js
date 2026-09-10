const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyRecord, upsertMyRecord, getMyHistory, deleteMyHistoryEntry } = require('../controllers/studentRecordController');

const router = express.Router();

router.get('/me', protect, getMyRecord);
router.get('/me/history', protect, getMyHistory);
router.delete('/me/history/:activityId', protect, deleteMyHistoryEntry);
router.put('/me', protect, upsertMyRecord);

module.exports = router;
