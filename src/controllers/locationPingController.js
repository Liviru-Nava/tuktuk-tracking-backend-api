//Controller to handle requests for the location ping

import * as locationPingService from '../services/locationPingService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export async function submitLocationPing(request, response) {
    try {
        const insertedPing = await locationPingService.submitLocationPing(
            request.body,
            request.user,
        );
        return sendSuccess(response, 201, 'Location ping submitted successfully', insertedPing);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[LOCATION_PING] submitLocationPing error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}