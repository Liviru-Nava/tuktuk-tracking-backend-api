//tracking device service to handle business logic

import { v4 as uuidv4 } from 'uuid';
import * as trackingDeviceRepository from '../repositories/trackingDeviceRepository.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';

// resolves the district IDs the requesting user is allowed to see
async function resolveAllowedDistrictIds(requestingUser) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') {
        return null;
    }

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        return trackingDeviceRepository.getDistrictIdsByProvinceId(
            requestingUser.jurisdiction_ref_id
        );
    }

    if (
        requestingUser.jurisdiction_type === 'DISTRICT' ||
        requestingUser.jurisdiction_type === 'STATION'
    ) {
        return [requestingUser.jurisdiction_ref_id];
    }

    return null;
}

// checks if a device is accessible to the requesting user
// devices not assigned to any vehicle are only visible to NATIONAL users
async function checkDeviceAccess(requestingUser, deviceId) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') return;

    const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(deviceId);

    if (!assignedVehicle) {
        throw {
            statusCode: 403,
            message: 'This device is not assigned to any vehicle in your jurisdiction',
        };
    }

    const allowedDistrictIds = await resolveAllowedDistrictIds(requestingUser);

    const vehicleDistrictId = await getDistrictIdForVehicle(assignedVehicle.vehicle_id);

    if (allowedDistrictIds && !allowedDistrictIds.includes(vehicleDistrictId)) {
        throw { statusCode: 403, message: 'You do not have access to this device' };
    }
}

async function getDistrictIdForVehicle(vehicleId) {
    const { default: db } = await import('../config/knex.js');
    const vehicle = await db('vehicles')
        .where({ vehicle_id: vehicleId })
        .select('district_id')
        .first();
    return vehicle?.district_id;
}

export async function getAllDevices(queryParams, requestingUser) {
    const { limit, offset } = getPaginationParams(queryParams);

    const allowedDistrictIds = await resolveAllowedDistrictIds(requestingUser);

    let deviceIdsToFilterBy = null;

    if (allowedDistrictIds !== null) {
        deviceIdsToFilterBy = await trackingDeviceRepository.getDeviceIdsByDistrictIds(
            allowedDistrictIds
        );
    }

    const { listOfDevices, totalDeviceCount } = await trackingDeviceRepository.findAllDevices({
        limit,
        offset,
        deviceIdsToFilterBy,
        searchTerm:   queryParams.search       || null,
        deviceStatus: queryParams.device_status || null,
    });

    return buildCollection(
        '/api/v1/tracking-devices',
        offset,
        limit,
        totalDeviceCount,
        listOfDevices,
    );
}

export async function getDeviceById(deviceId, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const foundDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!foundDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    await checkDeviceAccess(requestingUser, deviceId);

    // include which vehicle this device is assigned to
    const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(deviceId);

    return {
        ...foundDevice,
        assigned_vehicle: assignedVehicle || null,
    };
}

export async function createDevice(requestBody, requestingUser) {
    const { device_serial_no } = requestBody;

    if (!device_serial_no || !device_serial_no.trim()) {
        throw { statusCode: 400, message: 'device_serial_no is required' };
    }

    const existingDeviceWithSameSerial = await trackingDeviceRepository.findDeviceBySerialNo(
        device_serial_no.trim().toUpperCase()
    );

    if (existingDeviceWithSameSerial) {
        throw {
            statusCode: 409,
            message: `A device with serial number '${device_serial_no}' already exists`,
        };
    }

    return trackingDeviceRepository.createDevice({
        device_id:        uuidv4(),
        device_serial_no: device_serial_no.trim().toUpperCase(),
        device_status:    'ACTIVE',
    });
}

export async function updateDevice(deviceId, requestBody, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const existingDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!existingDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    await checkDeviceAccess(requestingUser, deviceId);

    if (existingDevice.device_status === 'DECOMMISSIONED') {
        throw { statusCode: 409, message: 'Cannot update a decommissioned device' };
    }

    // only device_serial_no is editable — covers data entry mistakes
    const { device_serial_no } = requestBody;

    if (!device_serial_no || !device_serial_no.trim()) {
        throw {
            statusCode: 400,
            message: 'device_serial_no is the only editable field and it cannot be empty',
        };
    }

    // make sure the new serial number is not already taken by another device
    const duplicateDevice = await trackingDeviceRepository.findDeviceBySerialNo(
        device_serial_no.trim().toUpperCase()
    );

    if (duplicateDevice && duplicateDevice.device_id !== deviceId) {
        throw {
            statusCode: 409,
            message: `Serial number '${device_serial_no}' is already in use by another device`,
        };
    }

    return trackingDeviceRepository.updateDevice(deviceId, {
        device_serial_no: device_serial_no.trim().toUpperCase(),
    });
}

export async function decommissionDevice(deviceId, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const existingDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!existingDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    if (existingDevice.device_status === 'DECOMMISSIONED') {
        throw { statusCode: 409, message: 'Device is already decommissioned' };
    }

    // cannot decommission a device that is still assigned to a vehicle
    const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(deviceId);
    if (assignedVehicle) {
        throw {
            statusCode: 409,
            message: `Cannot decommission a device that is assigned to vehicle ${assignedVehicle.license_plate_no}. Use assign-device to unassign it first.`,
        };
    }

    return trackingDeviceRepository.changeDeviceStatus(deviceId, 'DECOMMISSIONED');
}

export async function getDeviceStatusComposite(deviceId, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const foundDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!foundDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    await checkDeviceAccess(requestingUser, deviceId);

    const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(deviceId);
    const latestPing      = await trackingDeviceRepository.findLatestPingByDeviceId(deviceId);

    // calculate how long ago the last ping was received
    let minutesSinceLastPing = null;
    if (latestPing) {
        const lastPingTime = new Date(latestPing.ping_timestamp);
        const currentTime  = new Date();
        minutesSinceLastPing = Math.floor((currentTime - lastPingTime) / 60000);
    }

    return {
        device_id:          foundDevice.device_id,
        device_serial_no:   foundDevice.device_serial_no,
        device_status:      foundDevice.device_status,
        assigned_vehicle:   assignedVehicle || null,
        latest_ping:        latestPing || null,
        minutes_since_last_ping: minutesSinceLastPing,
        is_recently_active: minutesSinceLastPing !== null && minutesSinceLastPing <= 15,
    };
}

export async function getDeviceLocationPings(deviceId, queryParams, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const foundDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!foundDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    await checkDeviceAccess(requestingUser, deviceId);

    const { limit, offset } = getPaginationParams(queryParams);

    const startTime = queryParams.start_time || null;
    const endTime   = queryParams.end_time   || null;

    const { listOfPings, totalPingCount } = await trackingDeviceRepository.findPingsByDeviceId(
        deviceId,
        { limit, offset, startTime, endTime }
    );

    return buildCollection(
        `/api/v1/tracking-devices/${deviceId}/location-pings`,
        offset,
        limit,
        totalPingCount,
        listOfPings,
        startTime || endTime ? { start_time: startTime, end_time: endTime } : {},
    );
}

export async function changeDeviceStatus(deviceId, requestBody, requestingUser) {
    if (!deviceId) {
        throw { statusCode: 400, message: 'Device ID is required' };
    }

    const { status: newStatus } = requestBody;

    const allowedStatusValues = ['ACTIVE', 'INACTIVE', 'FAULTY', 'DECOMMISSIONED'];
    if (!newStatus || !allowedStatusValues.includes(newStatus)) {
        throw {
            statusCode: 400,
            message: `status must be one of: ${allowedStatusValues.join(', ')}`,
        };
    }

    const existingDevice = await trackingDeviceRepository.findDeviceById(deviceId);
    if (!existingDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }

    // DECOMMISSIONED is permanent — cannot be reversed
    if (existingDevice.device_status === 'DECOMMISSIONED') {
        throw { statusCode: 409, message: 'A decommissioned device cannot have its status changed' };
    }

    if (existingDevice.device_status === newStatus) {
        throw { statusCode: 409, message: `Device status is already ${newStatus}` };
    }

    // if setting to DECOMMISSIONED, make sure device is not assigned to a vehicle
    if (newStatus === 'DECOMMISSIONED') {
        const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(deviceId);
        if (assignedVehicle) {
            throw {
                statusCode: 409,
                message: `Cannot decommission a device assigned to vehicle ${assignedVehicle.license_plate_no}. Unassign it first.`,
            };
        }
    }

    return trackingDeviceRepository.changeDeviceStatus(deviceId, newStatus);
}
