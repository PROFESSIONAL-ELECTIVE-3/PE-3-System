const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const StudentActivity = require('../models/StudentActivity');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/predict', protect, async (req, res, next) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, req.body, {
      timeout: 10000,
    });
    if (req.user.role === 'student') {
      await StudentActivity.create({
        student: req.user._id,
        type: 'forecast_run',
        record: req.body,
        forecast: data,
      });
    }
    res.status(200).json(data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
});

module.exports = router;
