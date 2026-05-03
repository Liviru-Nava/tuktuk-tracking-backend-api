//Controller to handle requests and responses related to drivers

import * as driverService from '../services/driverService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function getAllDrivers(request, response) {
    try {
        const collectionOfDrivers = await driverService.getAllDrivers(request.query, request.user);
        return sendCollection(response, 200, 'Drivers retrieved successfully', collectionOfDrivers);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] getAllDrivers error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getDriverById(request, response) {
    try {
        console.log('Fetching driver with license no:', request.params.driverLicenseNo);
        const foundDriver = await driverService.getDriverById(request.params.driverLicenseNo, request.user);
        return sendSuccess(response, 200, 'Driver retrieved successfully', foundDriver);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] getDriverById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function createDriver(request, response) {
    try {
        const newlyCreatedDriver = await driverService.createDriver(request.body, request.user);
        return sendSuccess(response, 201, 'Driver registered successfully', newlyCreatedDriver);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] createDriver error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function updateDriver(request, response) {
    try {
        const updatedDriver = await driverService.updateDriver(
            request.params.driverLicenseNo,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Driver updated successfully', updatedDriver);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] updateDriver error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function suspendDriver(request, response) {
    try {
        const suspendedDriver = await driverService.suspendDriver(
            request.params.driverLicenseNo,
            request.user,
        );
        return sendSuccess(response, 200, 'Driver suspended successfully', suspendedDriver);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] suspendDriver error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function changeDriverStatus(request, response) {
    try {
        const updatedDriver = await driverService.changeDriverStatus(
            request.params.driverLicenseNo,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Driver status updated successfully', updatedDriver);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DRIVER] changeDriverStatus error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}
