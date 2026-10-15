/**
 * Standard application error with HTTP status and machine-readable code.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [code='INTERNAL'] - Machine-readable error code
   * @param {Array<object>} [details=[]] - Optional error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL', details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
