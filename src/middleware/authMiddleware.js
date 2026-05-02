// Verifies JWT access token on every protected route.
// Attaches decoded payload to request.user for downstream use.

import { verifyAccessToken } from '../utils/jwtUtils.js';
import { sendError } from '../utils/responseUtils.js';

export function authenticate(request, response, next) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            response.set('WWW-Authenticate', 'Bearer realm="tuktrack"');
            return sendError(response, 401, 'Authorization header missing or malformed');
        }

        const token   = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Attach full payload to request — available in all controllers
        request.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
        return sendError(response, 401, 'Access token has expired');
        }
        if (err.name === 'JsonWebTokenError') {
            response.set('WWW-Authenticate', 'Bearer realm="tuktrack"');
            return sendError(response, 401, 'Invalid access token');
        }
        return sendError(response, 500, 'Internal server error');
    }
}

// Permission check middleware — used on individual routes
export function requirePermission(permission) {
    return (request, response, next) => {
        const permissions = request.user?.permissions || [];
        if (!permissions.includes(permission)) {
        return sendError(response, 403, 'You do not have permission to perform this action');
        }
        next();
    };
}