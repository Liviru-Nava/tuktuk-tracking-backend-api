//Repository for vehicles to handle database interactions

import db from '../config/knex.js';

const basicVehicleColumns = [
    'vehicles.vehicle_id',
    'vehicles.license_plate_no',
    'vehicles.vehicle_reg_no',
    'vehicles.chassis_number',
    'vehicles.engine_number',
    'vehicles.make_of_vehicle',
    'vehicles.model_of_vehicle',
    'vehicles.manufacture_year',
    'vehicles.vehicle_colour',
    'vehicles.fuel_type',
    'vehicles.is_diplomatic',
    'vehicles.vehicle_reg_date',
    'vehicles.status',
    'vehicles.owner_id',
    'vehicles.district_id',
    'vehicles.device_id',
    'vehicles.created_time',
    'vehicles.updated_time',
];

function applyVehicleFilters(vehiclesQuery, filters) {
    if (filters.status) {
        vehiclesQuery.where('vehicles.status', filters.status);
    }
    if (filters.district_id) {
        vehiclesQuery.where('vehicles.district_id', filters.district_id);
    }
    if (filters.fuel_type) {
        vehiclesQuery.where('vehicles.fuel_type', filters.fuel_type);
    }
    if (filters.make_of_vehicle) {
        vehiclesQuery.whereILike('vehicles.make_of_vehicle', `%${filters.make_of_vehicle}%`);
    }
    if (filters.is_diplomatic !== undefined) {
        vehiclesQuery.where('vehicles.is_diplomatic', filters.is_diplomatic);
    }
    if (filters.owner_id) {
        vehiclesQuery.where('vehicles.owner_id', filters.owner_id);
    }
    if (filters.districtIdsToFilterBy && filters.districtIdsToFilterBy.length > 0) {
        vehiclesQuery.whereIn('vehicles.district_id', filters.districtIdsToFilterBy);
    }
}

export async function findAllVehicles({ limit, offset, filters = {} }) {
    const vehiclesQuery = db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .select(
            ...basicVehicleColumns,
            'districts.district_name',
            'provinces.province_name',
        )
        .orderBy('vehicles.license_plate_no', 'asc');

    const countQuery = db('vehicles');

    applyVehicleFilters(vehiclesQuery, filters);
    applyVehicleFilters(countQuery, filters);

    if (filters.districtIdsToFilterBy && filters.districtIdsToFilterBy.length === 0) {
        return { listOfVehicles: [], totalVehicleCount: 0 };
    }

    const listOfVehicles = await vehiclesQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('vehicles.vehicle_id as count').first();
    const totalVehicleCount = parseInt(totalCountResult.count);

    return { listOfVehicles, totalVehicleCount };
}

export async function findVehicleById(vehicleId) {
    return db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where('vehicles.vehicle_id', vehicleId)
        .select(
            ...basicVehicleColumns,
            'districts.district_name',
            'provinces.province_name',
        )
        .first();
}

// this builds the full composite profile: vehicle + owner + current driver + device
export async function findVehicleFullProfile(vehicleId) {
    const vehicleRecord = await db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .join('owners', 'vehicles.owner_id', 'owners.owner_id')
        .leftJoin('tracking_devices', 'vehicles.device_id', 'tracking_devices.device_id')
        .where('vehicles.vehicle_id', vehicleId)
        .select(
            ...basicVehicleColumns,
            'districts.district_name',
            'provinces.province_name',
            'owners.owner_fullname',
            'owners.owner_identity_no',
            'owners.owner_id_type',
            'owners.owner_gender',
            'owners.owner_contact',
            'owners.owner_address',
            'owners.status as owner_status',
            'tracking_devices.device_serial_no',
            'tracking_devices.device_status',
        )
        .first();

    if (!vehicleRecord) return null;

    // get the current active driver assignment if one exists
    const currentDriverAssignment = await db('vehicle_driver_assignments')
        .join('drivers', 'vehicle_driver_assignments.driver_id', 'drivers.driver_id')
        .where({
            'vehicle_driver_assignments.vehicle_id': vehicleId,
            'vehicle_driver_assignments.is_current_driver': true,
        })
        .select(
            'vehicle_driver_assignments.assignment_id',
            'vehicle_driver_assignments.assigned_time',
            'vehicle_driver_assignments.is_driver_owner',
            'drivers.driver_id',
            'drivers.driver_fullname',
            'drivers.driver_identity_no',
            'drivers.driver_id_type',
            'drivers.driver_license_no',
            'drivers.driver_contact_no',
            'drivers.status as driver_status',
        )
        .first();

    return { vehicleRecord, currentDriverAssignment };
}

export async function findVehicleByLicensePlate(licensePlateNo) {
    return db('vehicles').where({ license_plate_no: licensePlateNo }).first();
}

export async function findVehicleByRegNo(vehicleRegNo) {
    return db('vehicles').where({ vehicle_reg_no: vehicleRegNo }).first();
}

export async function findVehicleByChassisNumber(chassisNumber) {
    return db('vehicles').where({ chassis_number: chassisNumber }).first();
}

export async function findVehicleByEngineNumber(engineNumber) {
    return db('vehicles').where({ engine_number: engineNumber }).first();
}

export async function createVehicle(newVehicleData) {
    const [createdVehicle] = await db('vehicles')
        .insert(newVehicleData)
        .returning(basicVehicleColumns);
    return createdVehicle;
}

export async function updateVehicle(vehicleId, fieldsToUpdate) {
    const [updatedVehicle] = await db('vehicles')
        .where({ vehicle_id: vehicleId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning(basicVehicleColumns);
    return updatedVehicle;
}

export async function changeVehicleStatus(vehicleId, newStatus) {
    const [updatedVehicle] = await db('vehicles')
        .where({ vehicle_id: vehicleId })
        .update({ status: newStatus, updated_time: db.fn.now() })
        .returning(basicVehicleColumns);
    return updatedVehicle;
}

// get all driver assignments for a vehicle including past ones
export async function findDriverAssignmentsByVehicleId(vehicleId, { limit, offset }) {
    const assignmentsQuery = db('vehicle_driver_assignments')
        .join('drivers', 'vehicle_driver_assignments.driver_id', 'drivers.driver_id')
        .where('vehicle_driver_assignments.vehicle_id', vehicleId)
        .select(
            'vehicle_driver_assignments.assignment_id',
            'vehicle_driver_assignments.vehicle_id',
            'vehicle_driver_assignments.driver_id',
            'vehicle_driver_assignments.assigned_time',
            'vehicle_driver_assignments.unassigned_time',
            'vehicle_driver_assignments.is_current_driver',
            'vehicle_driver_assignments.is_driver_owner',
            'drivers.driver_fullname',
            'drivers.driver_identity_no',
            'drivers.driver_id_type',
            'drivers.driver_license_no',
            'drivers.status as driver_status',
        )
        .orderBy('vehicle_driver_assignments.assigned_time', 'desc');

    const totalCountResult = await db('vehicle_driver_assignments')
        .where({ vehicle_id: vehicleId })
        .count('assignment_id as count')
        .first();

    const listOfAssignments = await assignmentsQuery.limit(limit).offset(offset);
    const totalAssignmentCount = parseInt(totalCountResult.count);

    return { listOfAssignments, totalAssignmentCount };
}

export async function findAssignmentByIdAndVehicleId(assignmentId, vehicleId) {
    return db('vehicle_driver_assignments')
        .join('drivers', 'vehicle_driver_assignments.driver_id', 'drivers.driver_id')
        .where({
            'vehicle_driver_assignments.assignment_id': assignmentId,
            'vehicle_driver_assignments.vehicle_id': vehicleId,
        })
        .select(
            'vehicle_driver_assignments.assignment_id',
            'vehicle_driver_assignments.vehicle_id',
            'vehicle_driver_assignments.driver_id',
            'vehicle_driver_assignments.assigned_time',
            'vehicle_driver_assignments.unassigned_time',
            'vehicle_driver_assignments.is_current_driver',
            'vehicle_driver_assignments.is_driver_owner',
            'drivers.driver_fullname',
            'drivers.driver_identity_no',
            'drivers.driver_license_no',
            'drivers.status as driver_status',
        )
        .first();
}

// get location pings for a vehicle by going through the vehicle's device
export async function findLocationPingsByVehicleId(vehicleId, { limit, offset, startTime, endTime }) {
    // first get the device assigned to this vehicle
    const vehicleWithDevice = await db('vehicles')
        .where({ vehicle_id: vehicleId })
        .select('device_id')
        .first();

    if (!vehicleWithDevice || !vehicleWithDevice.device_id) {
        return { listOfPings: [], totalPingCount: 0 };
    }

    const deviceId = vehicleWithDevice.device_id;

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

// get only the single most recent ping — used for live view
export async function findLastKnownLocationByVehicleId(vehicleId) {
    const vehicleWithDevice = await db('vehicles')
        .where({ vehicle_id: vehicleId })
        .select('device_id')
        .first();

    if (!vehicleWithDevice || !vehicleWithDevice.device_id) {
        return null;
    }

    return db('location_pings')
        .where({ device_id: vehicleWithDevice.device_id })
        .orderBy('ping_timestamp', 'desc')
        .select(
            'ping_id',
            'device_id',
            'latitude',
            'longitude',
            'ping_timestamp',
            'speed_kmh',
            'device_battery',
        )
        .first();
}

export async function countActiveAssignmentsByVehicleId(vehicleId) {
    const result = await db('vehicle_driver_assignments')
        .where({ vehicle_id: vehicleId, is_current_driver: true })
        .count('assignment_id as count')
        .first();
    return parseInt(result.count);
}

export async function getDistrictIdsByProvinceId(provinceId) {
    const results = await db('districts')
        .where({ province_id: provinceId })
        .select('district_id');
    return results.map(row => row.district_id);
}
