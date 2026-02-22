const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const receiptRoutes = require('./api/routes/receipts');
const userRoutes = require('./api/routes/users');
const subscriptionRoutes = require('./api/routes/subscriptions');
const insightsRoutes = require('./api/routes/insights');

// API Routes
app.use('/api/receipts', receiptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReceiptAI server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Apply rate limiting to static assets as well
  const staticLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Higher limit for static assets
  });
  
  app.use(express.static(path.join(__dirname, 'client/build')), staticLimiter);
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ReceiptAI server running on port ${PORT}`);
});
