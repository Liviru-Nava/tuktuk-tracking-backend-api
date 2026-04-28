//Dtabase access layer for office resource

import db from '../config/knex.js';

//filter functions
function applyFilters(query, filters = {}) {

    if (filters.status) {
        query.where('offices.status', filters.status);
    }
    if (filters.office_type) {
        query.where('offices.office_type', filters.office_type);
    }
    if (filters.jurisdiction_type) {
        query.where('offices.jurisdiction_type', filters.jurisdiction_type);
    }
    if (filters.jurisdiction_ref_id) {
        query.where('offices.jurisdiction_ref_id', filters.jurisdiction_ref_id);
    }
}

const OFFICE_COLUMNS = [

    'office_id',
    'office_code',
    'office_name',
    'office_type',
    'jurisdiction_type',
    'jurisdiction_ref_id',
    'office_address',
    'office_contact',
    'status',
    'created_time',
    'updated_time',

];

//get count of offices
export async function countOffices(filters = {}) {
    
    const query = db('offices');
    applyFilters(query, filters);
    const result = await query.count('office_id as count').first();
    return parseInt(result.count);
}

//get all offices
export async function findAllOffices({ limit, offset, ...filters } = {}) {
    const query = db('offices')
        .select(OFFICE_COLUMNS)
        .orderBy('office_name', 'asc');

    applyFilters(query, filters);
    return query.limit(limit).offset(offset);
}

//get an office from the id
export async function findOfficeById(officeId) {

    return db('offices')
        .where({ office_id: officeId })
        .select(OFFICE_COLUMNS)
        .first();
}

//get an office from the office code
export async function findOfficeByCode(officeCode, excludeId = null) {
    const query = db('offices').where({ office_code: officeCode });
    if (excludeId) query.andWhereNot({ office_id: excludeId });
    return query.first();
}


//create a new office
export async function createOffice(data) {
    const [created] = await db('offices')
        .insert(data)
        .returning(OFFICE_COLUMNS);
    return created;
}

//update office details
export async function updateOffice(officeId, updates) {
    const [updated] = await db('offices')
        .where({ office_id: officeId })
        .update({ ...updates, updated_time: db.fn.now() })
        .returning(OFFICE_COLUMNS);
    return updated;
}

//delete where we make the status closed
export async function closeOffice(officeId) {
    const [closed] = await db('offices')
        .where({ office_id: officeId })
        .update({ status: 'CLOSED', updated_time: db.fn.now() })
        .returning(OFFICE_COLUMNS);
    return closed;
}

//find the users in an office
export async function findUsersByOfficeId(officeId, { limit, offset } = {}) {
  return db('users')
    .join('roles', 'users.role_id', 'roles.role_id')
    .where('users.office_id', officeId)
    .select(
      'users.user_id',
      'users.username',
      'users.fullname',
      'users.email_address',
      'users.badge_id',
      'users.status',
      'users.last_login_time',
      'users.created_time',
      'roles.role_name',
    )
    .orderBy('users.fullname', 'asc')
    .limit(limit)
    .offset(offset);
}

//find how many users are there in an office
export async function countUsersByOfficeId(officeId) {
    const result = await db('users')
        .where({ office_id: officeId })
        .count('user_id as count')
        .first();
    return parseInt(result.count);
}

//find active users in an office
export async function countActiveUsersByOfficeId(officeId) {
    const result = await db('users')
        .where({ office_id: officeId, status: 'ACTIVE' })
        .count('user_id as count')
        .first();
    return parseInt(result.count);
}