// Authentication business logic.
// Handles credential validation, token lifecycle, security rules.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as authRepo   from '../repositories/authRepository.js';
import { signAccessToken, signRefreshToken, getRefreshTokenExpiryDate } from '../utils/jwtUtils.js';
import { decrypt, ENCRYPTED_FIELDS } from '../utils/encryption.js';
import { verifyRefreshToken } from '../utils/jwtUtils.js';

// Create the JWT payload which is embedded in every access token
function buildTokenPayload(user) {
    return {
        sub:                  user.user_id,
        username:             user.username,
        role:                 user.role_name,
        permissions:          user.permissions,
        office_id:            user.office_id,
        jurisdiction_type:    user.jurisdiction_type,
        jurisdiction_ref_id:  user.jurisdiction_ref_id,
        user_management_scope: user.user_management_scope,
    };
}

export async function login(username, password) {
    // 1. Find user — must exist
    const user = await authRepo.findUserByUsername(username);
    if (!user) {
        // Same error message whether user not found or password wrong
        // Prevents username enumeration attacks
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // 2. Check account status before verifying password
    if (user.status === 'INACTIVE') {
        throw { statusCode: 403, message: 'Account is inactive. Contact your administrator.' };
    }
    if (user.status === 'SUSPENDED') {
        throw { statusCode: 403, message: 'Account is suspended. Contact your administrator.' };
    }

    // 3. Verify password against bcrypt hash
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // 4. Generate tokens
    const payload = buildTokenPayload(user);
    const accessToken = signAccessToken(payload);
    const rawRefresh = crypto.randomBytes(64).toString('hex');
    const refreshToken = signRefreshToken({ sub: user.user_id, token: rawRefresh });

    // 5. Calculate expiry and store hashed refresh token
    const expiresAt = getRefreshTokenExpiryDate();
    await authRepo.saveRefreshToken(user.user_id, rawRefresh, expiresAt);

    // 6. Update last login
    await authRepo.updateLastLogin(user.user_id);

    console.log('DEBUG contact_no raw value:', JSON.stringify(user.contact_no));
    console.log('DEBUG contact_no type:', typeof user.contact_no);
    console.log('DEBUG contact_no truthy:', !!user.contact_no);

    // 7. Return — decrypt contact_no before returning user profile
    return {
        accessToken,
        refreshToken,
        user: {
        user_id:           user.user_id,
        username:          user.username,
        fullname:          user.fullname,
        email_address:     user.email_address,
        badge_id:          user.badge_id,
        contact_no:        user.contact_no ? decrypt(user.contact_no) : null,
        status:            user.status,
        office_id:         user.office_id,
        office_name:       user.office_name,
        jurisdiction_type: user.jurisdiction_type,
        role_name:         user.role_name,
        permissions:       user.permissions,
        },
    };
}

export async function refresh(incomingRefreshToken) {
  // 1. Verify JWT signature and expiry
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw { statusCode: 401, message: 'Refresh token has expired. Please log in again.' };
    }
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }

  // 2. Check token exists in DB and is not revoked
  const storedToken = await authRepo.findRefreshToken(decoded.token);
  if (!storedToken) {
    throw { statusCode: 401, message: 'Refresh token has been revoked or does not exist' };
  }

  // 3. Get fresh user data using findUserById — no Knex in service layer
  const user = await authRepo.findUserById(decoded.sub);
  if (!user) {
    throw { statusCode: 401, message: 'User no longer exists' };
  }
  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Account is no longer active' };
  }

  // 4. Revoke old token AFTER confirming user is valid (token rotation)
  await authRepo.revokeRefreshToken(decoded.token);

  // 5. Issue new tokens
  const payload      = buildTokenPayload(user);
  const accessToken  = signAccessToken(payload);
  const rawRefresh   = crypto.randomBytes(64).toString('hex');
  const refreshToken = signRefreshToken({ sub: user.user_id, token: rawRefresh });

  await authRepo.saveRefreshToken(user.user_id, rawRefresh, getRefreshTokenExpiryDate());

  return { accessToken, refreshToken };
}

export async function logout(userId, refreshToken) {
    if (refreshToken) {
        // Revoke specific token if provided
        const { verifyRefreshToken } = await import('../utils/jwtUtils.js');
        try {
        const decoded = verifyRefreshToken(refreshToken);
        await authRepo.revokeRefreshToken(decoded.token);
        } catch {
        // Token already expired, logout succeeds anyway
        }
    } else {
        // No token provided so revoke all sessions for this user
        await authRepo.revokeAllUserTokens(userId);
    }
}