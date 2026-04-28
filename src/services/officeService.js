//Business logic layer for the office

import { v4 as uuidv4 } from 'uuid';
import db from '../config/knex.js';
import * as officeRepo  from '../repositories/officeRepository.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';

//----------Functions to do jurisdiction filtering----------

async function resolveJurisdictionFilters(user) {

    // NATIONAL no filter
    if (user.jurisdiction_type === 'NATIONAL') {
        return {};
    }

    //PROVINCIAL only see the own province
    if (user.jurisdiction_type === 'PROVINCIAL') {
        const districts = await db('districts')
        .where({ province_id: user.jurisdiction_ref_id })
        .select('district_id');

        const districtIds = districts.map(d => d.district_id);

        // Return as a special marker — needs whereIn handling in repository
        return {
            _provincial_filter: true,
            province_ref_id:    user.jurisdiction_ref_id,
            district_ids:       districtIds,
        };
    }

    // DISTRICT or STATION only see their district and station
    return { jurisdiction_ref_id: user.jurisdiction_ref_id };
}

// Checks if user has access to a specific office
async function checkOfficeAccess(user, office) {
    if (user.jurisdiction_type === 'NATIONAL') return; // full access

    if (user.jurisdiction_type === 'PROVINCIAL') {
        // Provincial user can access:
        if (office.jurisdiction_type === 'NATIONAL') {
        throw { statusCode: 403, message: 'You do not have access to this office' };
        }

        if (office.jurisdiction_type === 'PROVINCIAL') {
        if (office.jurisdiction_ref_id !== user.jurisdiction_ref_id) {
            throw { statusCode: 403, message: 'You do not have access to this office' };
        }
        return;
        }

        if (office.jurisdiction_type === 'DISTRICT') {
        const district = await db('districts')
            .where({ district_id: office.jurisdiction_ref_id })
            .select('province_id')
            .first();

        if (!district || district.province_id !== user.jurisdiction_ref_id) {
            throw { statusCode: 403, message: 'You do not have access to this office' };
        }
        return;
        }
    }

    // DISTRICT or STATION can only access offices in their own district
    if (office.jurisdiction_ref_id !== user.jurisdiction_ref_id) {
        throw { statusCode: 403, message: 'You do not have access to this office' };
    }
}

// Validates that jurisdiction_ref_id matches to a real province id or district id
async function validateJurisdictionRef(jurisdictionType, jurisdictionRefId) {
    if (jurisdictionType === 'NATIONAL') {
        if (jurisdictionRefId) {
        throw {
            statusCode: 400,
            message: 'jurisdiction_ref_id must be null for NATIONAL jurisdiction',
        };
        }
        return;
    }

    if (!jurisdictionRefId) {
        throw {
        statusCode: 400,
        message: `jurisdiction_ref_id is required for ${jurisdictionType} jurisdiction`,
        };
    }

    if (jurisdictionType === 'PROVINCIAL') {
        const province = await db('provinces')
        .where({ province_id: jurisdictionRefId })
        .first();
        if (!province) {
        throw {
            statusCode: 400,
            message: 'jurisdiction_ref_id does not match a valid province',
        };
        }
    }

    if (jurisdictionType === 'DISTRICT') {
        const district = await db('districts')
        .where({ district_id: jurisdictionRefId })
        .first();
        if (!district) {
        throw {
            statusCode: 400,
            message: 'jurisdiction_ref_id does not match a valid district',
        };
        }
    }
}

//Service functions to match the controller functions
export async function getAllOffices(query, user) {
    const { limit, offset } = getPaginationParams(query);
    const jurisdictionFilters = await resolveJurisdictionFilters(user);

    //Creating the final filters
    const filters = {};

    //query param filters
    if (query.status)            filters.status            = query.status;
    if (query.office_type)       filters.office_type       = query.office_type;
    if (query.jurisdiction_type) filters.jurisdiction_type = query.jurisdiction_type;

    // Handle provincial filter
    if (jurisdictionFilters._provincial_filter) {
        const { province_ref_id, district_ids } = jurisdictionFilters;

        // Use raw query to handle the OR condition properly
        const baseQuery = db('offices')
        .select(
            'office_id', 'office_code', 'office_name', 'office_type',
            'jurisdiction_type', 'jurisdiction_ref_id', 'office_address',
            'office_contact', 'status', 'created_time', 'updated_time',
        )
        .where(function () {
            this.where({ jurisdiction_ref_id: province_ref_id })
            .orWhereIn('jurisdiction_ref_id', district_ids);
        })
        .orderBy('office_name', 'asc');

        // Apply optional query filters on top
        if (filters.status)            baseQuery.where('status', filters.status);
        if (filters.office_type)       baseQuery.where('office_type', filters.office_type);
        if (filters.jurisdiction_type) baseQuery.where('jurisdiction_type', filters.jurisdiction_type);

        const countQuery = baseQuery.clone().clearSelect().count('office_id as count').first();

        const [offices, countResult] = await Promise.all([
        baseQuery.limit(limit).offset(offset),
        countQuery,
        ]);

        const total = parseInt(countResult.count);

        return buildCollection('/api/v1/offices', offset, limit, total, offices, filters);
    }

    // Distrcit/station and national filers
    if (jurisdictionFilters.jurisdiction_ref_id) {
        filters.jurisdiction_ref_id = jurisdictionFilters.jurisdiction_ref_id;
    }

    const [offices, total] = await Promise.all([
        officeRepo.findAllOffices({ limit, offset, ...filters }),
        officeRepo.countOffices(filters),
    ]);

    return buildCollection('/api/v1/offices', offset, limit, total, offices, filters);
}

//function to get office by id
export async function getOfficeById(officeId, user) {
    if (!officeId) {
        throw { statusCode: 400, message: 'Office ID is required' };
    }

    //call repo
    const office = await officeRepo.findOfficeById(officeId);
    if (!office) {
        throw { statusCode: 404, message: 'Office not found' };
    }

    //verify the access of the office with the user accessing it
    await checkOfficeAccess(user, office);
    return office;
}

//function to create a new office
export async function createOffice(body, user) {
    //create a new office object skeleton
    const {
        office_code,
        office_name,
        office_type,
        jurisdiction_type,
        jurisdiction_ref_id = null,
        office_address      = null,
        office_contact      = null,
    } = body;

    // Required field validation
    if (!office_code || !office_name || !office_type || !jurisdiction_type) {
        throw {
        statusCode: 400,
        message: 'office_code, office_name, office_type and jurisdiction_type are required',
        };
    }

    // Enum validation
    const validOfficeTypes = [
        'HEADQUARTERS', 'PROVINCIAL_HQ', 'DISTRICT_HQ', 'DIVISIONAL_STATION',
    ];
    if (!validOfficeTypes.includes(office_type)) {
        throw {
        statusCode: 400,
        message: `office_type must be one of: ${validOfficeTypes.join(', ')}`,
        };
    }

    const validJurisdictionTypes = ['NATIONAL', 'PROVINCIAL', 'DISTRICT'];
    if (!validJurisdictionTypes.includes(jurisdiction_type)) {
        throw {
        statusCode: 400,
        message: `jurisdiction_type must be one of: ${validJurisdictionTypes.join(', ')}`,
        };
    }

    // Validate jurisdiction_ref_id points to a real province or district
    await validateJurisdictionRef(jurisdiction_type, jurisdiction_ref_id);

    //Check if the office code already exists
    const existing = await officeRepo.findOfficeByCode(office_code);
    if (existing) {
        throw {
        statusCode: 409,
        message: `Office code '${office_code}' is already in use`,
        };
    }

    return officeRepo.createOffice({
        office_id:           uuidv4(),
        office_code:         office_code.trim().toUpperCase(),
        office_name:         office_name.trim(),
        office_type,
        jurisdiction_type,
        jurisdiction_ref_id: jurisdiction_ref_id || null,
        office_address:      office_address  ? office_address.trim()  : null,
        office_contact:      office_contact  ? office_contact.trim()  : null,
        status:              'ACTIVE',
    });
}

//function to update an office details
export async function updateOffice(officeId, body, user) {
    //validate if office id is not provided
    if (!officeId) {
        throw { statusCode: 400, message: 'Office ID is required' };
    }

    //get office details from the id and throw error if the office is not found
    const office = await officeRepo.findOfficeById(officeId);
    if (!office) {
        throw { statusCode: 404, message: 'Office not found' };
    }

    //verify the access user has to update
    await checkOfficeAccess(user, office);

    //cannot update a closed office
    if (office.status === 'CLOSED' && (body.office_address === '' || body.office_address === null)) {
        throw { statusCode: 409, message: 'Cannot update a closed office' };
    }

    // Reject attempts to update structural/immutable fields
    const immutableFields = ['office_code', 'office_type', 'jurisdiction_type', 'jurisdiction_ref_id'];
    const attemptedImmutable = immutableFields.filter(f => body[f] !== undefined);
    if (attemptedImmutable.length > 0) {
        throw {
        statusCode: 400,
        message: `These fields cannot be changed after creation: ${attemptedImmutable.join(', ')}`,
        };
    }

    const updates = {};

    if (body.office_name !== undefined) {
        if (!body.office_name || !body.office_name.trim()) {
        throw { statusCode: 400, message: 'office_name cannot be empty' };
        }
        updates.office_name = body.office_name.trim();
    }

    if (body.office_address !== undefined) {
        updates.office_address = body.office_address
        ? body.office_address.trim()
        : null;
    }

    if (body.office_contact !== undefined) {
        updates.office_contact = body.office_contact
        ? body.office_contact.trim()
        : null;
    }

    if (Object.keys(updates).length === 0) {
        throw {
        statusCode: 400,
        message: 'No valid fields to update. Editable fields: office_name, office_address, office_contact',
        };
    }

    //update the office details in the database
    return officeRepo.updateOffice(officeId, updates);
}

//function to delete the office
export async function deleteOffice(officeId, user) {
    if (!officeId) {
        throw { statusCode: 400, message: 'Office ID is required' };
    }

    const office = await officeRepo.findOfficeById(officeId);
    if (!office) {
        throw { statusCode: 404, message: 'Office not found' };
    }

    await checkOfficeAccess(user, office);

    if (office.status === 'CLOSED') {
        throw { statusCode: 409, message: 'Office is already closed' };
    }

    // Safety check refuse to close an office with active users
    const activeUserCount = await officeRepo.countActiveUsersByOfficeId(officeId);
    if (activeUserCount > 0) {
        throw {
        statusCode: 409,
        message: `Cannot close an office with ${activeUserCount} active user(s). Deactivate or reassign users first.`,
        };
    }

    return officeRepo.closeOffice(officeId);
}

//get users from the office
export async function getOfficeUsers(officeId, query, user) {
    if (!officeId) {
        throw { statusCode: 400, message: 'Office ID is required' };
    }

    const office = await officeRepo.findOfficeById(officeId);
    if (!office) {
        throw { statusCode: 404, message: 'Office not found' };
    }

    await checkOfficeAccess(user, office);

    const { limit, offset } = getPaginationParams(query);

    const [users, total] = await Promise.all([
        officeRepo.findUsersByOfficeId(officeId, { limit, offset }),
        officeRepo.countUsersByOfficeId(officeId),
    ]);

    return {
        office,
        collection: buildCollection(
        `/api/v1/offices/${officeId}/users`,
        offset, limit, total, users,
        ),
    };
}