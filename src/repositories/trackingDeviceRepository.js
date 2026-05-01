//Repository for tracking devices to handle database interactions

import db from '../config/knex.js';

const deviceColumns = [
    'device_id',
    'device_serial_no',
    'device_status',
    'created_time',
    'updated_time',
];

export async function findAllDevices({ limit, offset, deviceIdsToFilterBy, searchTerm, deviceStatus }) {
    const devicesQuery = db('tracking_devices')
        .select(deviceColumns)
        .orderBy('device_serial_no', 'asc');

    const countQuery = db('tracking_devices');

    if (deviceIdsToFilterBy !== null && deviceIdsToFilterBy !== undefined) {
        if (deviceIdsToFilterBy.length === 0) {
            return { listOfDevices: [], totalDeviceCount: 0 };
        }
        devicesQuery.whereIn('device_id', deviceIdsToFilterBy);
        countQuery.whereIn('device_id', deviceIdsToFilterBy);
    }

    if (deviceStatus) {
        devicesQuery.where('device_status', deviceStatus);
        countQuery.where('device_status', deviceStatus);
    }

    if (searchTerm) {
        devicesQuery.whereILike('device_serial_no', `%${searchTerm}%`);
        countQuery.whereILike('device_serial_no', `%${searchTerm}%`);
    }

    const listOfDevices = await devicesQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('device_id as count').first();
    const totalDeviceCount = parseInt(totalCountResult.count);

    return { listOfDevices, totalDeviceCount };
}

export async function findDeviceById(deviceId) {
    return db('tracking_devices')
        .where({ device_id: deviceId })
        .select(deviceColumns)
        .first();
}

export async function findDeviceBySerialNo(deviceSerialNo) {
    return db('tracking_devices')
        .where({ device_serial_no: deviceSerialNo })
        .first();
}

export async function createDevice(newDeviceData) {
    const [createdDevice] = await db('tracking_devices')
        .insert(newDeviceData)
        .returning(deviceColumns);
    return createdDevice;
}

export async function updateDevice(deviceId, fieldsToUpdate) {
    const [updatedDevice] = await db('tracking_devices')
        .where({ device_id: deviceId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning(deviceColumns);
    return updatedDevice;
}

export async function changeDeviceStatus(deviceId, newStatus) {
    const [updatedDevice] = await db('tracking_devices')
        .where({ device_id: deviceId })
        .update({ device_status: newStatus, updated_time: db.fn.now() })
        .returning(deviceColumns);
    return updatedDevice;
}

// find which vehicle this device is currently assigned to
export async function findVehicleAssignedToDevice(deviceId) {
    return db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where('vehicles.device_id', deviceId)
        .select(
            'vehicles.vehicle_id',
            'vehicles.license_plate_no',
            'vehicles.vehicle_reg_no',
            'vehicles.make_of_vehicle',
            'vehicles.model_of_vehicle',
            'vehicles.status as vehicle_status',
            'districts.district_name',
            'provinces.province_name',
        )
        .first();
}

// get the latest single ping for this device — used for status composite endpoint
export async function findLatestPingByDeviceId(deviceId) {
    return db('location_pings')
        .where({ device_id: deviceId })
        .orderBy('ping_timestamp', 'desc')
        .select(
            'ping_id',
            'latitude',
            'longitude',
            'ping_timestamp',
            'speed_kmh',
            'device_battery',
        )
        .first();
}

// get paginated ping history for a device
export async function findPingsByDeviceId(deviceId, { limit, offset, startTime, endTime }) {
    const pingsQuery = db('location_pings')
        .where({ device_id: deviceId })
        .select(
            'ping_id',
            'device_id',
            'latitude',
            'longitude',
            'ping_timestamp',
            'speed_kmh',
            'device_battery',
        )
        .orderBy('ping_timestamp', 'desc');

    const countQuery = db('location_pings').where({ device_id: deviceId });

    if (startTime) {
        pingsQuery.where('ping_timestamp', '>=', startTime);
        countQuery.where('ping_timestamp', '>=', startTime);
    }

    if (endTime) {
        pingsQuery.where('ping_timestamp', '<=', endTime);
        countQuery.where('ping_timestamp', '<=', endTime);
    }

    const listOfPings = await pingsQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('ping_id as count').first();
    const totalPingCount = parseInt(totalCountResult.count);

    return { listOfPings, totalPingCount };
}

// get device IDs that are assigned to vehicles in the given districts
export async function getDeviceIdsByDistrictIds(districtIds) {
    if (!districtIds || districtIds.length === 0) return [];

    const results = await db('vehicles')
        .whereIn('district_id', districtIds)
        .whereNotNull('device_id')
        .distinct('device_id')
        .select('device_id');

    return results.map(row => row.device_id);
}

export async function getDistrictIdsByProvinceId(provinceId) {
    const results = await db('districts')
        .where({ province_id: provinceId })
        .select('district_id');
    return results.map(row => row.district_id);
}
