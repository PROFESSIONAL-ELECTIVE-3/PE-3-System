require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mlRoutes = require('./routes/mlRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

connectDB();

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // small limit: this API doesn't accept file uploads
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate-limit auth endpoints specifically — they're the most likely target for abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'eduforecaster-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ml', mlRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EduForecaster backend running on http://localhost:${PORT}`);
});