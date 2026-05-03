// Authenticates hardware tracking devices on device-facing endpoints.

import { hmac } from '../utils/encryption.js';
import * as trackingDeviceRepository from '../repositories/trackingDeviceRepository.js';
import { sendError } from '../utils/responseUtils.js';

export async function authenticateDevice(request, response, next) {
    try {
        const deviceToken = request.headers['x-device-token'];

        if (!deviceToken) {
            return sendError(response, 401, 'X-Device-Token header is required');
        }

        const tokenHash = hmac(deviceToken);
        const device = await trackingDeviceRepository.findDeviceByTokenHash(tokenHash);

        // Return 401 for any failure — do not distinguish between unknown token and decomissioned state
        if (!device) {
            return sendError(response, 401, 'Invalid device token');
        }

        if (device.device_status === 'DECOMMISSIONED') {
            return sendError(response, 403, 'This device has been decommissioned');
        }

        // Attach verified device record — available in controller and service
        request.device = device;
        next();
    } catch (err) {
        console.error('[DEVICE_AUTH] authenticateDevice error:', err);
        return sendError(response, 500, 'Internal server error');
    }
}