// Input validation for request bodies.
// Returns 400 with a clear message before the request reaches the controller.

import { sendError } from '../utils/responseUtils.js';

export function validateLogin(req, res, next) {
  const { username, password } = req.body;

  const errors = [];

  if (!username || typeof username !== 'string' || username.trim() === '') {
    errors.push({ field: 'username', message: 'Username is required' });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  next();
}

export function validateRefresh(req, res, next) {
  // Refresh token can come from cookie OR body
  // If neither exists, fail early with a clean message
  const fromCookie = req.cookies?.refreshToken;
  const fromBody   = req.body?.refreshToken;

  if (!fromCookie && !fromBody) {
    return sendError(res, 401, 'Refresh token not provided');
  }

  next();
}