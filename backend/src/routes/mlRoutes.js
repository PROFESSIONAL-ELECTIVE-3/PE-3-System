const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const StudentActivity = require('../models/StudentActivity');
const { isRiskAlertLevel, sendRiskAlertEmail } = require('../utils/riskAlertEmail');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ALERT_COOLDOWN_HOURS = Math.max(1, Number(process.env.RISK_ALERT_COOLDOWN_HOURS) || 168);

const sendStudentRiskAlert = async (student, forecast) => {
  const riskLevel = String(forecast.riskLevel || '').toLowerCase();
  if (!student.emailVerified || !isRiskAlertLevel(riskLevel)) return { sent: false, reason: 'not_eligible' };

  const sentSince = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000);
  const recentAlert = await StudentActivity.exists({
    student: student._id,
    type: 'risk_alert_sent',
    'alert.riskLevel': riskLevel,
    createdAt: { $gte: sentSince },
  });
  if (recentAlert) return { sent: false, reason: 'cooldown' };

  await sendRiskAlertEmail({ student, forecast });
  await StudentActivity.create({
    student: student._id,
    type: 'risk_alert_sent',
    alert: { riskLevel, dropoutProbability: forecast.dropoutProbability, delivery: 'email' },
  });
  return { sent: true };
};

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
      try {
        await sendStudentRiskAlert(req.user, data);
      } catch (emailError) {
        // Forecasting must remain available when an external mail provider fails.
        console.error('Unable to send student risk alert email:', emailError.response?.data || emailError.message);
      }
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
