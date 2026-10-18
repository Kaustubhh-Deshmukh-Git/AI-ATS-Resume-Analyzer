import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';

/**
 * Standard security options for the authentication JWT cookie.
 * @param {object} [overrides={}]
 */
export const getAuthCookieOptions = (overrides = {}) => ({
  httpOnly: true,
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  path: '/',
  ...overrides,
});

/**
 * Set the auth cookie on the response, deriving maxAge from token expiration.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAuthCookie = (res, token) => {
  let maxAge = 60 * 60 * 1000;
  try {
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      maxAge = Math.max(0, decoded.exp * 1000 - Date.now());
    }
  } catch {
    // Keep fallback maxAge
  }
  res.cookie(COOKIE_NAME, token, getAuthCookieOptions({ maxAge }));
};

/**
 * Clear the auth cookie on logout.
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
};
