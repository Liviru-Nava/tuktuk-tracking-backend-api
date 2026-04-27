// JWT token creation and verification utilities.
// Access tokens: short-lived (15m), used for API authorization.
// Refresh tokens: long-lived (24h), used to obtain new access tokens.

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

export function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

//Parse for different time ranges for expiry
export function getRefreshTokenExpiryMaxAge() {
    const rawExpiryValue = process.env.REFRESH_TOKEN_EXPIRES_IN;
    const match = rawExpiryValue.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
        console.warn(`[JWT] Invalid REFRESH_TOKEN_EXPIRES_IN: "${rawExpiryValue}" — falling back to 24h`);
        return 24 * 60 * 60 * 1000;
    }

    const numericAmount = parseInt(match[1], 10);
    const timeUnit      = match[2];

    const millisecondsPerUnit = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return numericAmount * millisecondsPerUnit[timeUnit];
}

//get the expiry date
export function getRefreshTokenExpiryDate() {
  return new Date(Date.now() + getRefreshTokenExpiryMaxAge());
}