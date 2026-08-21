const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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

// @desc    Request a password reset (stub — wire up real email sending)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // TODO: generate a reset token, store its hash + expiry on the user,
      // and email a reset link containing the raw token.
    }

    // Always respond identically whether or not the account exists.
    res.status(200).json({
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};
