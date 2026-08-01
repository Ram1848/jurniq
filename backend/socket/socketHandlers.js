const logger = require('../utils/logger');
const { updateDriverStatus } = require('../services/driverService');

const registerHandlers = (io, socket) => {
  // --- Room joining ---
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on('join_ride_room', (rideId) => {
    socket.join(`ride_${rideId}`);
    logger.info(`Socket ${socket.id} joined ride room ${rideId}`);
  });

  // --- Driver Status ---
  socket.on('driverOnline', async (driverId) => {
    try {
      await updateDriverStatus(driverId, 'online');
      logger.info(`Driver ${driverId} is online`);
      socket.broadcast.emit('driver_status_changed', { driverId, status: 'online' });
    } catch (err) {
      logger.error(`Error setting driver online: ${err.message}`);
    }
  });

  socket.on('driverOffline', async (driverId) => {
    try {
      await updateDriverStatus(driverId, 'offline');
      logger.info(`Driver ${driverId} is offline`);
      socket.broadcast.emit('driver_status_changed', { driverId, status: 'offline' });
    } catch (err) {
      logger.error(`Error setting driver offline: ${err.message}`);
    }
  });

  // --- Driver Location Updates ---
  socket.on('locationUpdated', (data) => {
    // data: { driverId, rideId, lat, lng }
    if (data.rideId) {
      io.to(`ride_${data.rideId}`).emit('locationUpdated', data);
    }
  });

  // --- Ride Events ---
  socket.on('newRideRequest', (data) => {
    socket.broadcast.emit('newRideRequest', data);
    logger.info(`New ride requested: ${data.rideId}`);
  });

  socket.on('rideAccepted', (data) => {
    const { rideId, riderId, driverId } = data;
    io.to(`user_${riderId}`).emit('rideAccepted', data);
    logger.info(`Ride ${rideId} accepted by driver ${driverId}`);
  });

  socket.on('rideStarted', (data) => {
    const { rideId, riderId } = data;
    io.to(`user_${riderId}`).emit('rideStarted', data);
    logger.info(`Ride ${rideId} started`);
  });

  socket.on('rideCompleted', (data) => {
    const { rideId, riderId } = data;
    io.to(`user_${riderId}`).emit('rideCompleted', data);
    logger.info(`Ride ${rideId} completed`);
  });

  socket.on('rideCancelled', (data) => {
    const { rideId, riderId, driverId } = data;
    if (riderId) io.to(`user_${riderId}`).emit('rideCancelled', data);
    if (driverId) io.to(`user_${driverId}`).emit('rideCancelled', data);
    logger.info(`Ride ${rideId} cancelled`);
  });

  // --- Notifications ---
  socket.on('send_notification', (data) => {
    const { userId, title, message } = data;
    io.to(`user_${userId}`).emit('notification', { title, message });
  });
};

module.exports = {
  registerHandlers,
};
