//User Repository for database calls

import db from '../config/knex.js';

export async function getAllUsers({ limit, offset, filters }) {
    const usersQuery = db('users')
        .join('roles', 'users.role_id', 'roles.role_id')
        .join('offices', 'users.office_id', 'offices.office_id')
        .select(
            'users.user_id',
            'users.username',
            'users.fullname',
            'users.email_address',
            'users.badge_id',
            'users.contact_no',
            'users.status',
            'users.last_login_time',
            'users.created_time',
            'users.updated_time',
            'roles.role_name',
            'roles.user_management_scope',
            'offices.office_id',
            'offices.office_name',
            'offices.jurisdiction_type',
            'offices.jurisdiction_ref_id',
        )
        .orderBy('users.fullname', 'asc');

    const countQuery = db('users')
        .join('offices', 'users.office_id', 'offices.office_id');

    if (filters.status) {
        usersQuery.where('users.status', filters.status);
        countQuery.where('users.status', filters.status);
    }

    if (filters.role_id) {
        usersQuery.where('users.role_id', filters.role_id);
        countQuery.where('users.role_id', filters.role_id);
    }

    if (filters.office_id) {
        usersQuery.where('users.office_id', filters.office_id);
        countQuery.where('users.office_id', filters.office_id);
    }

    if (filters.jurisdiction_type) {
        usersQuery.where('offices.jurisdiction_type', filters.jurisdiction_type);
        countQuery.where('offices.jurisdiction_type', filters.jurisdiction_type);
    }

    if (filters.jurisdiction_ref_id) {
        usersQuery.where('offices.jurisdiction_ref_id', filters.jurisdiction_ref_id);
        countQuery.where('offices.jurisdiction_ref_id', filters.jurisdiction_ref_id);
    }

    const listOfUsers = await usersQuery.limit(limit).offset(offset);
    const totalCountResult = await countQuery.count('users.user_id as count').first();
    const totalUserCount = parseInt(totalCountResult.count);

    return { listOfUsers, totalUserCount };
}

export async function getUserById(userId) {
    return db('users')
        .join('roles', 'users.role_id', 'roles.role_id')
        .join('offices', 'users.office_id', 'offices.office_id')
        .where('users.user_id', userId)
        .select(
            'users.user_id',
            'users.username',
            'users.fullname',
            'users.email_address',
            'users.badge_id',
            'users.contact_no',
            'users.status',
            'users.last_login_time',
            'users.created_time',
            'users.updated_time',
            'roles.role_id',
            'roles.role_name',
            'roles.permissions',
            'roles.user_management_scope',
            'offices.office_id',
            'offices.office_name',
            'offices.jurisdiction_type',
            'offices.jurisdiction_ref_id',
        )
        .first();
}

export async function getUserByUsername(username) {
    return db('users').where({ username }).first();
}

export async function getUserByEmail(emailAddress) {
    return db('users').where({ email_address: emailAddress }).first();
}

export async function getUserByBadgeId(badgeId) {
    return db('users').where({ badge_id: badgeId }).first();
}

export async function createUser(newUserData) {
    const [createdUser] = await db('users')
        .insert(newUserData)
        .returning([
            'user_id',
            'username',
            'fullname',
            'email_address',
            'badge_id',
            'contact_no',
            'office_id',
            'role_id',
            'status',
            'created_time',
            'updated_time',
        ]);
    return createdUser;
}

export async function updateUser(userId, fieldsToUpdate) {
    const [updatedUser] = await db('users')
        .where({ user_id: userId })
        .update({ ...fieldsToUpdate, updated_time: db.fn.now() })
        .returning([
            'user_id',
            'username',
            'fullname',
            'email_address',
            'badge_id',
            'contact_no',
            'office_id',
            'role_id',
            'status',
            'created_time',
            'updated_time',
        ]);
    return updatedUser;
}

export async function deactivateUser(userId) {
    const [deactivatedUser] = await db('users')
        .where({ user_id: userId })
        .update({ status: 'INACTIVE', updated_time: db.fn.now() })
        .returning([
            'user_id',
            'username',
            'fullname',
            'status',
            'updated_time',
        ]);
    return deactivatedUser;
}

export async function updateUserPassword(userId, newHashedPassword) {
    await db('users')
        .where({ user_id: userId })
        .update({ password: newHashedPassword, updated_time: db.fn.now() });
}
