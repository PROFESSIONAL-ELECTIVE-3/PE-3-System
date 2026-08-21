const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const axios = require('axios');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  institution: user.institution,
});

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, institution, role, password } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      fullName,
      email,
      institution,
      role,
      password,
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// @desc    Log in
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // Generic message on every failure path below, so we never reveal
    // whether an email is registered.
    const invalidMsg = { message: 'Invalid email or password.' };

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );
    if (!user) {
      return res.status(401).json(invalidMsg);
    }

    if (user.isLocked) {
      return res.status(423).json({
        message:
          'Account temporarily locked due to too many failed attempts. Please try again later.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME_MS;
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).json(invalidMsg);
    }

    // Successful login — reset lockout counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

const createResetEmail = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
    <h1 style="color: #0d47a1;">Reset your EduForecaster password</h1>
    <p>We received a request to reset your password.</p>
    <p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; background: #e74c3c; color: #ffffff; border-radius: 4px; text-decoration: none; font-weight: 600;">
        Reset password
      </a>
    </p>
    <p>This link expires in one hour. If you did not request a password reset, you can safely ignore this email.</p>
  </div>
`;

// @desc    Request a password reset
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      console.error('Password reset email is not configured.');
      return res.status(200).json({
        message: 'If an account exists for this email, a reset link has been sent.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);
      await user.save({ validateBeforeSave: false });

      const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
      const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;
      try {
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: {
              email: process.env.BREVO_SENDER_EMAIL,
              name: process.env.BREVO_SENDER_NAME || 'EduForecaster',
            },
            to: [{ email: user.email, name: user.fullName }],
            subject: 'Reset your EduForecaster password',
            htmlContent: createResetEmail(resetUrl),
          },
          {
            headers: {
              'api-key': process.env.BREVO_API_KEY,
              accept: 'application/json',
              'content-type': 'application/json',
            },
          }
        );
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error(
          'Unable to send password reset email:',
          error.response?.data || error.message
        );
      }
    }

    // Always respond identically whether or not the account exists.
    res.status(200).json({
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset a password using a valid reset token
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'This password reset link is invalid or has expired.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
