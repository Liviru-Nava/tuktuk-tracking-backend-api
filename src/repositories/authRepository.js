// Database queries for authentication.

import db from '../config/knex.js';
import crypto from 'crypto';

// Find user by username including their role and office
export async function findUserByUsername(username) {
    return db('users')
        .join('roles',   'users.role_id',   'roles.role_id')
        .join('offices', 'users.office_id', 'offices.office_id')
        .where('users.username', username)
        .select(
        'users.user_id',
        'users.username',
        'users.fullname',
        'users.email_address',
        'users.password',
        'users.contact_no',
        'users.badge_id',
        'users.status',
        'users.office_id',
        'offices.office_name',
        'offices.jurisdiction_type',
        'offices.jurisdiction_ref_id',
        'users.role_id',
        'roles.role_name',
        'roles.permissions',
        'roles.user_management_scope',
        )
        .first();
}

// Update last_login_time on successful login
export async function updateLastLogin(userId) {
    return db('users')
        .where({ user_id: userId })
        .update({ last_login_time: db.fn.now() });
}

// Store hashed refresh token
export async function saveRefreshToken(userId, rawToken, expiresAt) {
    const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    return db('refresh_tokens').insert({
        user_id:    userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        revoked:    false,
    });
}

// Find refresh token by hash
export async function findRefreshToken(rawToken) {
    const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    return db('refresh_tokens')
        .where({ token_hash: tokenHash, revoked: false })
        .where('expires_at', '>', db.fn.now())
        .first();
}

// Revoke a specific refresh token
export async function revokeRefreshToken(rawToken) {
    const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    return db('refresh_tokens')
        .where({ token_hash: tokenHash })
        .update({ revoked: true });
}

// Revoke ALL refresh tokens for a user (logout all devices)
export async function revokeAllUserTokens(userId) {
    return db('refresh_tokens')
        .where({ user_id: userId, revoked: false })
        .update({ revoked: true });
}