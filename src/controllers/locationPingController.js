//Controller to handle requests for the location ping

import * as locationPingService from '../services/locationPingService.js';
import * as vehicleService from '../services/vehicleService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

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

export async function getVehicleLocationHistory(request, response) {
    try {
        const collectionOfPings = await vehicleService.getVehicleLocationHistory(
            request.params.licensePlateNo, request.query, request.user,
        );
        return sendCollection(response, 200, 'Location history retrieved successfully', collectionOfPings);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[LOCATION_PING] getVehicleLocationHistory error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleLastLocation(request, response) {
    try {
        const lastLocationData = await vehicleService.getVehicleLastLocation(
            request.params.licensePlateNo, request.user,
        );
        return sendSuccess(response, 200, 'Last known location retrieved successfully', lastLocationData);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[LOCATION_PING] getVehicleLastLocation error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}