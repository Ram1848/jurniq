require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const { initSocket } = require('./socket/socketServer');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mapRoutes = require('./routes/mapRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sosRoutes = require('./routes/sosRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Root endpoint
// ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Ride Sharing API Running Successfully' });
});

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommend-driver', require('./routes/driverRecommendationRoutes'));
app.use('/api/sos', sosRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ──────────────────────────────────────────────
// Error handler (must be last middleware)
// ──────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
const startServer = async () => {
  await testConnection();
  server.listen(PORT, () => {
    require('./utils/logger').info(`Server running on port ${PORT}`);
  });
};

startServer();
