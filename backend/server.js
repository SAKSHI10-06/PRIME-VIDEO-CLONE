require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PrimePlay API is running 🎬', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/history', require('./routes/history'));
app.use('/api/users', require('./routes/users'));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 PrimePlay API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));

module.exports = app;
