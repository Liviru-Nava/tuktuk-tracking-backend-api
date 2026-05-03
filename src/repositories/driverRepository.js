//Repo to handle database operations for drivers

import db from '../config/knex.js';

const allDriverColumns = [
    'driver_id',
    'driver_fullname',
    'driver_identity_no',
    'driver_id_type',
    'date_of_birth',
    'driver_gender',
    'driver_contact_no',
    'address',
    'driver_license_no',
    'license_expiry_date',
    'status',
    'created_time',
    'updated_time',
];

// only non-sensitive fields returned for cross-jurisdiction access
const restrictedDriverColumns = [
    'driver_id',
    'driver_fullname',
    'driver_gender',
    'license_expiry_date',
    'status',
    'created_time',
];

export async function findAllDriversInJurisdiction({ limit, offset, homeDistrictIds, allAccessibleDistrictIds, searchTerm, status }) {
    // we fetch all drivers that have assignments in accessible districts
    // then the service layer marks which ones are home vs cross-jurisdiction

    const driversQuery = db('drivers')
        .select(allDriverColumns)
        .orderBy('driver_fullname', 'asc');

    const countQuery = db('drivers');

    if (allAccessibleDistrictIds !== null && allAccessibleDistrictIds !== undefined) {
        if (allAccessibleDistrictIds.length === 0) {
            return { listOfDrivers: [], totalDriverCount: 0 };
        }

        const driverIdsInAccessibleDistricts = await db('vehicle_driver_assignments')
            .join('vehicles', 'vehicle_driver_assignments.vehicle_id', 'vehicles.vehicle_id')
            .whereIn('vehicles.district_id', allAccessibleDistrictIds)
            .distinct('vehicle_driver_assignments.driver_id')
            .select('vehicle_driver_assignments.driver_id')
            .then(rows => rows.map(r => r.driver_id));

        if (driverIdsInAccessibleDistricts.length === 0) {
            return { listOfDrivers: [], totalDriverCount: 0 };
        }

        driversQuery.whereIn('driver_id', driverIdsInAccessibleDistricts);
        countQuery.whereIn('driver_id', driverIdsInAccessibleDistricts);
    }

    if (status) {
        driversQuery.where('status', status);
        countQuery.where('status', status);
    }

    if (searchTerm) {
        driversQuery.whereILike('driver_fullname', `%${searchTerm}%`);
        countQuery.whereILike('driver_fullname', `%${searchTerm}%`);
    }

    const listOfDrivers = await driversQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('driver_id as count').first();
    const totalDriverCount = parseInt(totalCountResult.count);

    return { listOfDrivers, totalDriverCount };
}

export async function findDriverById(driverId) {
    return db('drivers')
        .where({ driver_license_no_hmac: driverId })
        .select(allDriverColumns)
        .first();
}

export async function findDriverByIdentityNo(identityNo) {
    return db('drivers').where({ driver_identity_no: identityNo }).first();
}

export async function findDriverByLicenseNo(licenseNo) {
    return db('drivers').where({ driver_license_no: licenseNo }).first();
}

export async function createDriver(newDriverData) {
    const [createdDriver] = await db('drivers')
        .insert(newDriverData)
        .returning(allDriverColumns);
    return createdDriver;
}

export async function updateDriver(driverId, fieldsToUpdate) {
    const [updatedDriver] = await db('drivers')
        .where({ driver_license_no_hmac: driverId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning(allDriverColumns);
    return updatedDriver;
}

export async function changeDriverStatus(driverId, newStatus) {
    const [updatedDriver] = await db('drivers')
        .where({ driver_license_no_hmac: driverId })
        .update({ status: newStatus, updated_time: db.fn.now() })
        .returning(allDriverColumns);
    return updatedDriver;
}

export async function countActiveAssignmentsByDriverId(driverId) {
    const result = await db('vehicle_driver_assignments')
        .where({ driver_id: driverId, is_current_driver: true })
        .count('assignment_id as count')
        .first();
    return parseInt(result.count);
}

// find which district a driver is primarily associated with
// based on their current or most recent vehicle assignment
export async function findPrimaryDistrictForDriver(driverId) {
    const currentAssignment = await db('vehicle_driver_assignments')
        .join('vehicles', 'vehicle_driver_assignments.vehicle_id', 'vehicles.vehicle_id')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where({
            'vehicle_driver_assignments.driver_id': driverId,
            'vehicle_driver_assignments.is_current_driver': true,
        })
        .select(
            'vehicles.district_id',
            'districts.district_name',
            'provinces.province_name',
        )
        .first();

    if (currentAssignment) return currentAssignment;

    // fall back to most recent past assignment
    return db('vehicle_driver_assignments')
        .join('vehicles', 'vehicle_driver_assignments.vehicle_id', 'vehicles.vehicle_id')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where('vehicle_driver_assignments.driver_id', driverId)
        .select(
            'vehicles.district_id',
            'districts.district_name',
            'provinces.province_name',
        )
        .orderBy('vehicle_driver_assignments.assigned_time', 'desc')
        .first();
}

// find the contact station for a given district
export async function findContactStationForDistrict(districtId) {
    return db('offices')
        .where({
            jurisdiction_ref_id: districtId,
            jurisdiction_type:   'DISTRICT',
            status:              'ACTIVE',
        })
        .select('office_id', 'office_name', 'office_contact', 'office_code')
        .first();
}

export async function getDriverIdsByDistrictIds(districtIds) {
    if (!districtIds || districtIds.length === 0) return [];

    const results = await db('vehicle_driver_assignments')
        .join('vehicles', 'vehicle_driver_assignments.vehicle_id', 'vehicles.vehicle_id')
        .whereIn('vehicles.district_id', districtIds)
        .distinct('vehicle_driver_assignments.driver_id')
        .select('vehicle_driver_assignments.driver_id');

    return results.map(row => row.driver_id);
}

export async function getDistrictIdsByProvinceId(provinceId) {
    const results = await db('districts')
        .where({ province_id: provinceId })
        .select('district_id');
    return results.map(row => row.district_id);
}
