// JWT token creation and verification utilities.
// Access tokens: short-lived (15m), used for API authorization.
// Refresh tokens: long-lived (24h), used to obtain new access tokens.

import jwt from 'jsonwebtoken';

export function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1m',
    });
}

export function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '1m',
    });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}