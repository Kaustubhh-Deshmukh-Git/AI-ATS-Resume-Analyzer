import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';

/**
 * Standard security options for the authentication JWT cookie.
 */
export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  path: '/',
});

/**
 * Set the auth cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getAuthCookieOptions());
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
