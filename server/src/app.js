import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration (allowlist from CLIENT_ORIGIN with credentials)
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// HTTP logging via Pino (disabled in test to keep test runs clean)
if (env.NODE_ENV !== 'test') {
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
    })
  );
}

// JSON body parser with 100kb limit
app.use(express.json({ limit: '100kb' }));

// Cookie parser
app.use(cookieParser());

// Health check endpoint
const healthCheck = (_req, res) => {
  res.status(200).json({ status: 'ok' });
};

app.get('/health', healthCheck);
app.get('/api/v1/health', healthCheck);

// Authentication routes
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

// Catch-all route handler for unknown endpoints
app.use((_req, _res, next) => {
  next(new AppError('Endpoint not found', 404, 'NOT_FOUND'));
});

// Central error handler
app.use(errorHandler);

export default app;
