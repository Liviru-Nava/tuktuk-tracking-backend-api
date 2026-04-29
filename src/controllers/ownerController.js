//Controller for owner related endpoints. 

import * as ownerService from '../services/ownerService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function getAllOwners(request, response) {
    try {
        const collectionOfOwners = await ownerService.getAllOwners(request.query, request.user);
        return sendCollection(response, 200, 'Owners retrieved successfully', collectionOfOwners);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] getAllOwners error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getOwnerById(request, response) {
    try {
        const foundOwner = await ownerService.getOwnerById(request.params.ownerId, request.user);
        return sendSuccess(response, 200, 'Owner retrieved successfully', foundOwner);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] getOwnerById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function createOwner(request, response) {
    try {
        const newlyCreatedOwner = await ownerService.createOwner(request.body, request.user);
        return sendSuccess(response, 201, 'Owner created successfully', newlyCreatedOwner);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] createOwner error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function updateOwner(request, response) {
    try {
        const updatedOwner = await ownerService.updateOwner(
            request.params.ownerId,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Owner updated successfully', updatedOwner);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] updateOwner error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function deactivateOwner(request, response) {
    try {
        const deactivatedOwner = await ownerService.deactivateOwner(
            request.params.ownerId,
            request.user,
        );
        return sendSuccess(response, 200, 'Owner deactivated successfully', deactivatedOwner);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] deactivateOwner error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getOwnerVehicles(request, response) {
    try {
        const result = await ownerService.getOwnerVehicles(
            request.params.ownerId,
            request.query,
            request.user,
        );
        return sendCollection(
            response,
            200,
            `Vehicles for owner ${result.owner.owner_fullname} retrieved successfully`,
            result.collection,
        );
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[OWNER] getOwnerVehicles error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}