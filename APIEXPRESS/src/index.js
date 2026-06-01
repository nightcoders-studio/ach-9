require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const buterRoutes = require('./routes/buters');
const taskRoutes = require('./routes/tasks');
const walletRoutes = require('./routes/wallets');
const withdrawalRoutes = require('./routes/withdrawals');
const disputeRoutes = require('./routes/disputes');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buters', buterRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mitabut API running on http://localhost:${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}/api/v1`);
});

module.exports = app;