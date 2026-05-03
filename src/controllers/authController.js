// Handles HTTP layer only and parses request, calls service, sends response.

import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { getRefreshTokenExpiryMaxAge } from '../utils/jwtUtils.js';
import dotenv from 'dotenv';
dotenv.config();


//login controller
export async function login(request, response) {
    try {
        const { username, password } = request.body;
        const result = await authService.login(username, password);

        // Set refresh token as httpOnly cookie (more secure than body)
        response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   getRefreshTokenExpiryMaxAge(),
        });

        return sendSuccess(response, 200, 'Login successful', {
        accessToken: result.accessToken,
        user:        result.user,
        });
    } catch (err) {
        if (err.statusCode) {
        return sendError(response, err.statusCode, err.message);
        }
        console.error('[AUTH] Login error:', err);
        return sendError(response, 500, 'Internal server error');
    }
}

//refresh token controller
export async function refresh(request, response) {
  try {
    // Accept refresh token from cookie or request body
    const refreshToken = request.cookies?.refreshToken || request.body?.refreshToken;

    if (!refreshToken) {
      return sendError(response, 401, 'Refresh token not provided');
    }

    const result = await authService.refresh(refreshToken);

    // Rotate cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   getRefreshTokenExpiryMaxAge(),
    });

    return sendSuccess(response, 200, 'Token refreshed', {
      accessToken: result.accessToken,
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(response, err.statusCode, err.message);
    }
    console.error('[AUTH] Refresh error:', err);
    return sendError(response, 500, 'Internal server error');
  }
}

//logout controller
export async function logout(request, response) {
  try {
    const refreshToken = request.cookies?.refreshToken || request.body?.refreshToken;
    const userId       = request.user?.sub; // set by auth middleware on protected routes

    await authService.logout(userId, refreshToken);

    // Clear the cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess(response, 200, 'Logged out successfully');
  } catch (err) {
    console.error('[AUTH] Logout error:', err);
    return sendError(response, 500, 'Internal server error');
  }
}