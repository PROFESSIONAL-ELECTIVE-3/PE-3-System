const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, institution, role, password } = req.body;

    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const user = await User.create({ fullName, email, institution, role, password });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Explicitly select password since the schema excludes it by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Same message for both cases so we don't reveal which part was wrong
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
};

// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with 200 even if no account exists — this avoids
    // leaking which emails are registered (same pattern the frontend expects).
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for that email, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // TODO: send this via a real email provider (e.g. SendGrid, SES, Nodemailer + SMTP).
    // The raw token must only ever go out over email — never log or return it in production.
    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] Password reset link for ${user.email}: ${resetUrl}`);
    }

    res.status(200).json({
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'That reset link is invalid or has expired.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.status(200).json({
      message: 'Password has been reset successfully.',
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };