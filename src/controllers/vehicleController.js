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
        const foundVehicle = await vehicleService.getVehicleById(request.params.licensePlateNo, request.user);
        return sendSuccess(response, 200, 'Vehicle retrieved successfully', foundVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[VEHICLE] getVehicleById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleFullProfile(request, response) {
    try {
        const vehicleProfile = await vehicleService.getVehicleFullProfile(request.params.licensePlateNo, request.user);
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
            request.params.licensePlateNo,
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
            request.params.licensePlateNo,
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
            request.params.licensePlateNo,
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
