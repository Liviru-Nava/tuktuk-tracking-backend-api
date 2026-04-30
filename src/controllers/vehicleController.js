//Contorller for vehicles handling requests

import * as vehicleService from '../services/vehicleService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function getAllVehicles(request, response) {
    try {
        const collectionOfVehicles = await vehicleService.getAllVehicles(request.query, request.user);
        return sendCollection(response, 200, 'Vehicles retrieved successfully', collectionOfVehicles);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getAllVehicles error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleById(request, response) {
    try {
        const foundVehicle = await vehicleService.getVehicleById(request.params.vehicleId, request.user);
        return sendSuccess(response, 200, 'Vehicle retrieved successfully', foundVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleFullProfile(request, response) {
    try {
        const vehicleProfile = await vehicleService.getVehicleFullProfile(request.params.vehicleId, request.user);
        return sendSuccess(response, 200, 'Vehicle profile retrieved successfully', vehicleProfile);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleFullProfile error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function createVehicle(request, response) {
    try {
        const newlyCreatedVehicle = await vehicleService.createVehicle(request.body, request.user);
        return sendSuccess(response, 201, 'Vehicle registered successfully', newlyCreatedVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] createVehicle error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function updateVehicle(request, response) {
    try {
        const updatedVehicle = await vehicleService.updateVehicle(
            request.params.vehicleId,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Vehicle updated successfully', updatedVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] updateVehicle error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function deregisterVehicle(request, response) {
    try {
        const deregisteredVehicle = await vehicleService.deregisterVehicle(
            request.params.vehicleId,
            request.user,
        );
        return sendSuccess(response, 200, 'Vehicle deregistered successfully', deregisteredVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] deregisterVehicle error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function changeVehicleStatus(request, response) {
    try {
        const updatedVehicle = await vehicleService.changeVehicleStatus(
            request.params.vehicleId,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Vehicle status updated successfully', updatedVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] changeVehicleStatus error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleDriverHistory(request, response) {
    try {
        const result = await vehicleService.getVehicleDriverHistory(
            request.params.vehicleId,
            request.query,
            request.user,
        );
        return sendCollection(
            response,
            200,
            `Driver history for vehicle ${result.vehicle.license_plate_no} retrieved successfully`,
            result.collection,
        );
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleDriverHistory error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getSpecificAssignment(request, response) {
    try {
        const foundAssignment = await vehicleService.getSpecificAssignment(
            request.params.vehicleId,
            request.params.assignmentId,
            request.user,
        );
        return sendSuccess(response, 200, 'Assignment retrieved successfully', foundAssignment);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getSpecificAssignment error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleLocationHistory(request, response) {
    try {
        const collectionOfPings = await vehicleService.getVehicleLocationHistory(
            request.params.vehicleId,
            request.query,
            request.user,
        );
        return sendCollection(response, 200, 'Location history retrieved successfully', collectionOfPings);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleLocationHistory error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleLastLocation(request, response) {
    try {
        const lastLocationData = await vehicleService.getVehicleLastLocation(
            request.params.vehicleId,
            request.user,
        );
        return sendSuccess(response, 200, 'Last known location retrieved successfully', lastLocationData);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleLastLocation error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}
