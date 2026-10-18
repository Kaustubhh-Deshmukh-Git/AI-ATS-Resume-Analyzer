import mongoose from 'mongoose';
import { verifyToken } from '../services/authService.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { COOKIE_NAME } from '../utils/cookie.js';

/**
 * Middleware to protect routes and verify JWT from cookie or Bearer header.
 */
export const requireAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      if (!req.complete && req.readable) {
        req.on('data', () => {});
        await new Promise((resolve) => {
          req.on('end', resolve);
          req.on('error', resolve);
          setTimeout(resolve, 300);
        });
      }
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);

    if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
      throw new AppError('Invalid authentication token', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found or session invalid', 401, 'UNAUTHORIZED');
    }

    req.user = user.toJSON();
    next();
  } catch (err) {
    next(err);
  }
};
