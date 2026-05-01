// Controller for the three assignment controller resources and they are verbs because they are actions, not resources. (WSO2 guideline section 5.1)

import * as assignmentService from '../services/assignmentService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

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