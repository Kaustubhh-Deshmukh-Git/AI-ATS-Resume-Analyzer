import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Pre-computed dummy hash to prevent user enumeration via timing attacks
const DUMMY_HASH = '$2a$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';

/**
 * Generate a signed JWT token.
 * @param {object} payload
 * @returns {string}
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user.
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{ user: object, token: string }>}
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'CONFLICT', [
      { path: 'email', message: 'An account with this email already exists' },
    ]);
  }

  const passwordHash = await User.hashPassword(password);

  // Strictly assign fields to avoid mass assignment
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
  });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate a user with email and password.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    // Constant-time execution to prevent timing-based user enumeration
    await bcrypt.compare(password, DUMMY_HASH).catch(() => {});
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
  });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Verify JWT token and return decoded payload.
 * @param {string} token
 * @returns {object}
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired, please login again', 401, 'UNAUTHORIZED');
    }
    throw new AppError('Invalid authentication token', 401, 'UNAUTHORIZED');
  }
};
