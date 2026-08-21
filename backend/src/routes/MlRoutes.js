const express = require('express');
const { predictRisk, predictGpaForecast } = require('../controllers/mlController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Only professors and administrators can request predictions.
// Students see their own precomputed results elsewhere, not raw model calls.
router.post('/risk', protect, restrictTo('professor', 'administrator'), predictRisk);
router.post(
  '/gpa-forecast',
  protect,
  restrictTo('professor', 'administrator'),
  predictGpaForecast
);

module.exports = router;