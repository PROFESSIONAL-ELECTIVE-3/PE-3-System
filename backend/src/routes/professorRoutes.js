const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listConnectedStudentWorkspace } = require('../controllers/professorController');

const router = express.Router();
router.use(protect);
router.get('/students', listConnectedStudentWorkspace);

module.exports = router;
