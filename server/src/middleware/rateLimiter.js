import rateLimit from 'express-rate-limit';

/**
 * Factory function to create an authentication rate limiter.
 * Default: 10 requests per 15-minute window per IP.
 * Skips in test environment unless TEST_RATE_LIMIT=true is explicitly set.
 *
 * @param {object} [overrides={}]
 * @returns {import('express').RequestHandler}
 */
export const createAuthRateLimiter = (overrides = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15-minute window per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      res.status(options.statusCode).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests from this IP, please try again after 15 minutes',
          details: [],
          requestId: req.id || req.headers['x-request-id'] || 'unknown',
        },
      });
    },
    skip: () => process.env.NODE_ENV === 'test' && process.env.TEST_RATE_LIMIT !== 'true',
    ...overrides,
  });

export const authRateLimiter = createAuthRateLimiter();
