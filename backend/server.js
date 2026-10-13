const express = require('express');
const cors = require('cors');
const path = require('path');

const donationRoutes = require('./routes/donationRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for API endpoints
app.use('/api', (req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/donations', donationRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'ServeX FoodShare REST API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Serve static frontend assets from parent root folder
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Fallback to index.html for any unhandled non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 ServeX FoodShare Backend Server running!`);
  console.log(`📍 Web App & API URL : http://localhost:${PORT}`);
  console.log(`📍 Health Check      : http://localhost:${PORT}/api/health`);
  console.log(`📍 Donations API     : http://localhost:${PORT}/api/donations`);
  console.log(`📍 Platform Stats    : http://localhost:${PORT}/api/stats`);
  console.log('====================================================');
});
