import * as authService from '../services/authService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';

/**
 * Handle new user registration.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle user authentication and session creation.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear authentication cookie on user logout.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const logout = async (_req, res, next) => {
  try {
    clearAuthCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Return current authenticated user profile.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
