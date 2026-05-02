//Added tracking device controller to handle requests related to tracking device

import * as trackingDeviceService from '../services/trackingDeviceService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function getAllDevices(request, response) {
    try {
        const collectionOfDevices = await trackingDeviceService.getAllDevices(request.query, request.user);
        return sendCollection(response, 200, 'Tracking devices retrieved successfully', collectionOfDevices);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] getAllDevices error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getDeviceById(request, response) {
    try {
        const foundDevice = await trackingDeviceService.getDeviceById(request.params.deviceSerialNo, request.user);
        return sendSuccess(response, 200, 'Tracking device retrieved successfully', foundDevice);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] getDeviceById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function createDevice(request, response) {
    try {
        const newlyCreatedDevice = await trackingDeviceService.createDevice(request.body, request.user);
        return sendSuccess(response, 201, 'Tracking device registered successfully', newlyCreatedDevice);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] createDevice error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function updateDevice(request, response) {
    try {
        const updatedDevice = await trackingDeviceService.updateDevice(
            request.params.deviceSerialNo,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Tracking device updated successfully', updatedDevice);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] updateDevice error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function decommissionDevice(request, response) {
    try {
        const decommissionedDevice = await trackingDeviceService.decommissionDevice(
            request.params.deviceSerialNo,
            request.user,
        );
        return sendSuccess(response, 200, 'Tracking device decommissioned successfully', decommissionedDevice);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] decommissionDevice error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getDeviceStatusComposite(request, response) {
    try {
        const deviceStatusData = await trackingDeviceService.getDeviceStatusComposite(
            request.params.deviceSerialNo,
            request.user,
        );
        return sendSuccess(response, 200, 'Device status retrieved successfully', deviceStatusData);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] getDeviceStatusComposite error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getDeviceLocationPings(request, response) {
    try {
        const collectionOfPings = await trackingDeviceService.getDeviceLocationPings(
            request.params.deviceSerialNo,
            request.query,
            request.user,
        );
        return sendCollection(response, 200, 'Device location pings retrieved successfully', collectionOfPings);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] getDeviceLocationPings error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function changeDeviceStatus(request, response) {
    try {
        const updatedDevice = await trackingDeviceService.changeDeviceStatus(
            request.params.deviceSerialNo,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Device status updated successfully', updatedDevice);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[DEVICE] changeDeviceStatus error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}
