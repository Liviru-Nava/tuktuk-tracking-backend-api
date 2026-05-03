//Owner repository for database interactions 

import db from '../config/knex.js';

const ownerColumns = [
    'owner_id',
    'owner_fullname',
    'owner_identity_no',
    'owner_id_type',
    'owner_gender',
    'owner_contact',
    'owner_address',
    'status',
    'created_time',
    'updated_time',
];

export async function findAllOwners({ limit, offset, ownerIdsToFilterBy, searchTerm, status }) {
    const ownersQuery = db('owners')
        .select(ownerColumns)
        .orderBy('owner_fullname', 'asc');

    const countQuery = db('owners');

    if (ownerIdsToFilterBy && ownerIdsToFilterBy.length > 0) {
        ownersQuery.whereIn('owner_id', ownerIdsToFilterBy);
        countQuery.whereIn('owner_id', ownerIdsToFilterBy);
    }

    if (ownerIdsToFilterBy && ownerIdsToFilterBy.length === 0) {
        return { listOfOwners: [], totalOwnerCount: 0 };
    }

    if (status) {
        ownersQuery.where('status', status);
        countQuery.where('status', status);
    }

    if (searchTerm) {
        ownersQuery.whereILike('owner_fullname', `%${searchTerm}%`);
        countQuery.whereILike('owner_fullname', `%${searchTerm}%`);
    }

    const listOfOwners = await ownersQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('owner_id as count').first();
    const totalOwnerCount = parseInt(totalCountResult.count);

    return { listOfOwners, totalOwnerCount };
}

export async function findOwnerById(ownerId) {
    return db('owners')
        .where({ owner_identity_no_hmac: ownerId })
        .select(ownerColumns)
        .first();
}

export async function findOwnerByIdentityNo(identityNo) {
    return db('owners')
        .where({ owner_identity_no: identityNo })
        .first();
}

export async function createOwner(newOwnerData) {
    const [createdOwner] = await db('owners')
        .insert(newOwnerData)
        .returning(ownerColumns);
    return createdOwner;
}

export async function updateOwner(ownerId, fieldsToUpdate) {
    const [updatedOwner] = await db('owners')
        .where({ owner_identity_no: ownerId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning(ownerColumns);
    return updatedOwner;
}

export async function deactivateOwner(ownerId) {
    const [deactivatedOwner] = await db('owners')
        .where({ owner_identity_no: ownerId })
        .update({ status: 'INACTIVE', updated_time: db.fn.now() })
        .returning(ownerColumns);
    return deactivatedOwner;
}

export async function countActiveVehiclesByOwnerId(ownerId) {
    const result = await db('vehicles')
        .where({ owner_id: ownerId })
        .whereNot({ status: 'DEREGISTERED' })
        .count('vehicle_id as count')
        .first();
    return parseInt(result.count);
}

export async function findVehiclesByOwnerId(ownerId, { limit, offset, districtIdsToFilterBy }) {
    const vehiclesQuery = db('vehicles')
        .join('districts', 'vehicles.district_id', 'districts.district_id')
        .join('provinces', 'districts.province_id', 'provinces.province_id')
        .where('vehicles.owner_id', ownerId)
        .select(
            'vehicles.vehicle_id',
            'vehicles.license_plate_no',
            'vehicles.make_of_vehicle',
            'vehicles.model_of_vehicle',
            'vehicles.manufacture_year',
            'vehicles.vehicle_colour',
            'vehicles.fuel_type',
            'vehicles.status',
            'vehicles.vehicle_reg_date',
            'districts.district_id',
            'districts.district_name',
            'provinces.province_name',
        )
        .orderBy('vehicles.license_plate_no', 'asc');

    const countQuery = db('vehicles')
        .where('vehicles.owner_id', ownerId);

    if (districtIdsToFilterBy && districtIdsToFilterBy.length > 0) {
        vehiclesQuery.whereIn('vehicles.district_id', districtIdsToFilterBy);
        countQuery.whereIn('vehicles.district_id', districtIdsToFilterBy);
    }

    if (districtIdsToFilterBy && districtIdsToFilterBy.length === 0) {
        return { vehiclesOfOwner: [], totalVehicleCount: 0 };
    }

    const vehiclesOfOwner = await vehiclesQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('vehicle_id as count').first();
    const totalVehicleCount = parseInt(totalCountResult.count);

    return { vehiclesOfOwner, totalVehicleCount };
}

export async function getOwnerIdsByDistrictIds(districtIds) {
    if (!districtIds || districtIds.length === 0) return [];
    const results = await db('vehicles')
        .whereIn('district_id', districtIds)
        .distinct('owner_id')
        .select('owner_id');
    return results.map(row => row.owner_id);
}

export async function getDistrictIdsByProvinceId(provinceId) {
    const results = await db('districts')
        .where({ province_id: provinceId })
        .select('district_id');
    return results.map(row => row.district_id);
}
