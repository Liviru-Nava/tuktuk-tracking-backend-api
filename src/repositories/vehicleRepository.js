//Repository for vehicles to handle database interactions

import db from '../config/knex.js';

const basicVehicleColumns = [
    'vehicles.vehicle_id',
    'vehicles.license_plate_no',
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
        .where('vehicles.license_plate_no', vehicleId)
        .select(
            ...basicVehicleColumns,
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
        .where('vehicles.license_plate_no', vehicleId)
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
            'vehicle_driver_assignments.vehicle_id': vehicleRecord.vehicle_id,
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
    return db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where('vehicles.license_plate_no', licensePlateNo)
        .select(
            ...basicVehicleColumns,
            'districts.district_name',
            'provinces.province_name',
        )
        .first();
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
        .where({ license_plate_no: vehicleId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning(basicVehicleColumns);
    return updatedVehicle;
}

export async function changeVehicleStatus(vehicleId, newStatus) {
    const [updatedVehicle] = await db('vehicles')
        .where({ license_plate_no: vehicleId })
        .update({ status: newStatus, updated_time: db.fn.now() })
        .returning(basicVehicleColumns);
    return updatedVehicle;
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
