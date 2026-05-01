//Business logic for handling location pings

import * as locationPingRepository from '../repositories/locationPingRepository.js';
import db from '../config/knex.js';

// resolves what district IDs the user can access — same pattern used across all services
async function resolveAllowedDistrictIds(requestingUser) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') return null;

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        const districtRows = await db('districts')
            .where({ province_id: requestingUser.jurisdiction_ref_id })
            .select('district_id');
        return districtRows.map(row => row.district_id);
    }

    if (
        requestingUser.jurisdiction_type === 'DISTRICT' ||
        requestingUser.jurisdiction_type === 'STATION'
    ) {
        return [requestingUser.jurisdiction_ref_id];
    }

    return [];
}

// Submit a new location ping.
export async function submitLocationPing(requestBody, requestingUser) {
    const { device_id, latitude, longitude, speed_kmh, device_battery, ping_timestamp } = requestBody;

    // confirm the device exists and is not decommissioned
    const trackingDevice = await db('tracking_devices')
        .where({ device_id })
        .whereNot({ device_status: 'DECOMMISSIONED' })
        .first();

    if (!trackingDevice) {
        throw { statusCode: 404, message: 'Tracking device not found or has been decommissioned' };
    }

    // find the vehicle this device is currently assigned to
    const assignedVehicle = await db('vehicles')
        .where({ device_id })
        .select('vehicle_id', 'district_id', 'status')
        .first();

    if (!assignedVehicle) {
        throw { statusCode: 409, message: 'This tracking device is not currently assigned to any vehicle' };
    }

    // jurisdiction check to confirm the submitting user's office covers this vehicle's district
    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        const allowedDistrictIds = await resolveAllowedDistrictIds(requestingUser);

        if (allowedDistrictIds && !allowedDistrictIds.includes(assignedVehicle.district_id)) {
            throw { statusCode: 403, message: 'You do not have jurisdiction over the vehicle this device is assigned to' };
        }
    }

    // build the ping record
    const newPingRecord = {
        device_id,
        latitude,
        longitude,
        speed_kmh:      speed_kmh      ?? null,
        device_battery: device_battery ?? null,
        ping_timestamp: ping_timestamp ? new Date(ping_timestamp) : new Date(),
    };

    const insertedPing = await locationPingRepository.insertLocationPing(newPingRecord);
    return insertedPing;
}