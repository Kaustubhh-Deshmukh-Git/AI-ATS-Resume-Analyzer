import dns from 'dns';
import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// Configure reliable DNS servers for MongoDB Atlas SRV lookup on local environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Gracefully fallback to system default if restricted
}

let server;

async function startServer() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    server = app.listen(env.PORT, () => {
      logger.info(`ResumeIQ server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

export const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // Force exit fallback if connections refuse to drain within 10 seconds
  const forceTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit.');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (err) {
        logger.error({ err }, 'Error closing MongoDB connection');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };

