// Controller for the three assignment controller resources and they are verbs because they are actions, not resources. (WSO2 guideline section 5.1)

import * as assignmentService from '../services/assignmentService.js';
import * as vehicleService from '../services/vehicleService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function assignDriver(request, response) {
    try {
        const createdAssignment = await assignmentService.assignDriver(request.body, request.user);
        return sendSuccess(response, 201, 'Driver assigned to vehicle successfully', createdAssignment);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[ASSIGNMENT] assignDriver error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function unassignDriver(request, response) {
    try {
        const closedAssignment = await assignmentService.unassignDriver(request.body);
        return sendSuccess(response, 200, 'Driver unassigned from vehicle successfully', closedAssignment);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[ASSIGNMENT] unassignDriver error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function assignDevice(request, response) {
    try {
        const updatedVehicle = await assignmentService.assignDevice(request.body);
        return sendSuccess(response, 201, 'Tracking device assigned to vehicle successfully', updatedVehicle);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[ASSIGNMENT] assignDevice error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getVehicleDriverHistory(request, response) {
    try {
        const result = await vehicleService.getVehicleDriverHistory(
            request.params.licensePlateNo, request.query, request.user,
        );
        return sendCollection(response, 200,
            `Driver history for vehicle ${result.vehicle.license_plate_no} retrieved successfully`,
            result.collection,
        );
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[ASSIGNMENT] getVehicleDriverHistory error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getSpecificAssignment(request, response) {
    try {
        const foundAssignment = await vehicleService.getSpecificAssignment(
            request.params.licensePlateNo, request.params.assignmentId, request.user,
        );
        return sendSuccess(response, 200, 'Assignment retrieved successfully', foundAssignment);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[ASSIGNMENT] getSpecificAssignment error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}