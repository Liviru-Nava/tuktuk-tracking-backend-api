//Business logic for handling location pings

import * as locationPingRepository from '../repositories/locationPingRepository.js';
import * as trackingDeviceRepository from '../repositories/trackingDeviceRepository.js';

// Submit a new location ping.
// Device identity has already been verified by authenticateDevice middleware —
// request.device is the confirmed tracking_devices row.
export async function submitLocationPing(requestBody, device) {
    const { latitude, longitude, speed_kmh, device_battery, ping_timestamp } = requestBody;

    // confirm the device is currently assigned to a vehicle
    const assignedVehicle = await trackingDeviceRepository.findVehicleAssignedToDevice(device.device_id);

    if (!assignedVehicle) {
        throw { statusCode: 409, message: 'This tracking device is not currently assigned to any vehicle' };
    }

    const newPingRecord = {
        device_id:      device.device_id,
        latitude,
        longitude,
        speed_kmh:      speed_kmh      ?? null,
        device_battery: device_battery ?? null,
        ping_timestamp: ping_timestamp ? new Date(ping_timestamp) : new Date(),
    };

    const insertedPing = await locationPingRepository.insertLocationPing(newPingRecord);
    return insertedPing;
}