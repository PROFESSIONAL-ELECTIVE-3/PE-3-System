const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyRecord, upsertMyRecord } = require('../controllers/studentRecordController');

const router = express.Router();

router.get('/me', protect, getMyRecord);
router.put('/me', protect, upsertMyRecord);

module.exports = router;