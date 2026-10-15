import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Central Express error handling middleware.
 * Formats errors according to the SDD 04 standard error shape.
 */
export const errorHandler = (err, req, res, _next) => {
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || [];

  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid JSON in request body';
    details = [{ message: err.message }];
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Resource already exists';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    details = [{ path: field, message: `An account with this ${field} already exists` }];
  }

  if (statusCode >= 500) {
    logger.error(
      {
        err,
        requestId,
        url: req.originalUrl,
        method: req.method,
      },
      'Unhandled internal server error'
    );
  } else {
    logger.warn(
      {
        code,
        message,
        requestId,
        url: req.originalUrl,
        method: req.method,
      },
      'Client operational error'
    );
  }

  const responseMessage =
    statusCode >= 500 && env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message;

  res.status(statusCode).json({
    error: {
      code,
      message: responseMessage,
      details,
      requestId,
    },
  });
};
