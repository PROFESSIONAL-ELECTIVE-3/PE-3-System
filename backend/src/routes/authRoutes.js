const express = require('express');
const { register, checkNameAvailability, login, forgotPassword, resetPassword, getCurrentUser, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/check-name', checkNameAvailability);
router.post('/login', login);
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
