const { Server } = require('socket.io');
const socketConfig = require('../config/socket');
const { registerHandlers } = require('./socketHandlers');
const logger = require('../utils/logger');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, socketConfig);

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Register event handlers
    registerHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
};
