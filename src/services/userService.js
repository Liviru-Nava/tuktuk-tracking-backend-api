//User service to handle user related business logic

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/knex.js';
import * as userRepository from '../repositories/userRepository.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';
import { encrypt, decrypt } from '../utils/encryption.js';

async function getProvinceIdFromDistrictId(districtId) {
    const foundDistrict = await db('districts')
        .where({ district_id: districtId })
        .select('province_id')
        .first();
    return foundDistrict?.province_id;
}

async function getProvinceIdFromOfficeId(officeId) {
    const foundOffice = await db('offices')
        .where({ office_id: officeId })
        .select('jurisdiction_type', 'jurisdiction_ref_id')
        .first();

    if (!foundOffice) return null;

    if (foundOffice.jurisdiction_type === 'PROVINCIAL') {
        return foundOffice.jurisdiction_ref_id;
    }

    if (foundOffice.jurisdiction_type === 'DISTRICT') {
        return getProvinceIdFromDistrictId(foundOffice.jurisdiction_ref_id);
    }

    return null;
}

async function checkUserManagementScope(requestingUser, targetOfficeId) {
    const managementScope = requestingUser.user_management_scope;

    if (managementScope === 'NONE') {
        throw { statusCode: 403, message: 'You do not have user management rights' };
    }

    if (managementScope === 'NATIONAL') {
        return;
    }

    const targetOffice = await db('offices')
        .where({ office_id: targetOfficeId })
        .select('office_id', 'jurisdiction_type', 'jurisdiction_ref_id')
        .first();

    if (!targetOffice) {
        throw { statusCode: 400, message: 'Target office does not exist' };
    }

    if (managementScope === 'PROVINCIAL') {
        const requestingUserProvinceId = requestingUser.jurisdiction_ref_id;

        if (targetOffice.jurisdiction_type === 'PROVINCIAL') {
            if (targetOffice.jurisdiction_ref_id !== requestingUserProvinceId) {
                throw { statusCode: 403, message: 'You can only manage users within your province' };
            }
            return;
        }

        if (targetOffice.jurisdiction_type === 'DISTRICT') {
            const targetProvinceId = await getProvinceIdFromDistrictId(targetOffice.jurisdiction_ref_id);
            if (targetProvinceId !== requestingUserProvinceId) {
                throw { statusCode: 403, message: 'You can only manage users within your province' };
            }
            return;
        }

        throw { statusCode: 403, message: 'You can only manage users within your province' };
    }

    if (managementScope === 'DISTRICT') {
        const requestingUserDistrictId = requestingUser.jurisdiction_ref_id;

        if (targetOffice.jurisdiction_type === 'DISTRICT') {
            if (targetOffice.jurisdiction_ref_id !== requestingUserDistrictId) {
                throw { statusCode: 403, message: 'You can only manage users within your district' };
            }
            return;
        }

        throw { statusCode: 403, message: 'You can only manage users within your district' };
    }

    if (managementScope === 'STATION') {
        const requestingUserOfficeId = requestingUser.office_id;
        if (targetOfficeId !== requestingUserOfficeId) {
            throw { statusCode: 403, message: 'You can only manage users within your station' };
        }
        return;
    }
}

async function buildJurisdictionFilters(requestingUser) {
    const jurisdictionFiltersToApply = {};

    if (requestingUser.jurisdiction_type === 'NATIONAL') {
        return jurisdictionFiltersToApply;
    }

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        jurisdictionFiltersToApply.jurisdiction_ref_id = requestingUser.jurisdiction_ref_id;
        return jurisdictionFiltersToApply;
    }

    if (
        requestingUser.jurisdiction_type === 'DISTRICT' ||
        requestingUser.jurisdiction_type === 'STATION'
    ) {
        jurisdictionFiltersToApply.jurisdiction_ref_id = requestingUser.jurisdiction_ref_id;
        return jurisdictionFiltersToApply;
    }

    return jurisdictionFiltersToApply;
}

function decryptUserContactNo(userRecord) {
    if (!userRecord) return userRecord;
    return {
        ...userRecord,
        contact_no: userRecord.contact_no ? decrypt(userRecord.contact_no) : null,
    };
}

export async function getAllUsers(queryParams, requestingUser) {
    const { limit, offset } = getPaginationParams(queryParams);

    const jurisdictionFilters = await buildJurisdictionFilters(requestingUser);

    const filtersToApply = { ...jurisdictionFilters };

    if (queryParams.status) filtersToApply.status = queryParams.status;
    if (queryParams.role_id) filtersToApply.role_id = queryParams.role_id;
    if (queryParams.office_id) filtersToApply.office_id = queryParams.office_id;

    const { listOfUsers, totalUserCount } = await userRepository.getAllUsers({
        limit,
        offset,
        filters: filtersToApply,
    });

    const decryptedListOfUsers = listOfUsers.map(decryptUserContactNo);

    return buildCollection(
        '/api/v1/users',
        offset,
        limit,
        totalUserCount,
        decryptedListOfUsers,
        filtersToApply,
    );
}

export async function getUserById(userId, requestingUser) {
    if (!userId) {
        throw { statusCode: 400, message: 'User ID is required' };
    }

    const foundUser = await userRepository.getUserById(userId);

    if (!foundUser) {
        throw { statusCode: 404, message: 'User not found' };
    }

    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        if (foundUser.jurisdiction_ref_id !== requestingUser.jurisdiction_ref_id) {
            if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
                const targetUserProvinceId = await getProvinceIdFromOfficeId(foundUser.office_id);
                if (targetUserProvinceId !== requestingUser.jurisdiction_ref_id) {
                    throw { statusCode: 403, message: 'You do not have access to this user' };
                }
            } else {
                throw { statusCode: 403, message: 'You do not have access to this user' };
            }
        }
    }

    return decryptUserContactNo(foundUser);
}

export async function createUser(requestBody, requestingUser) {
    const {
        username,
        fullname,
        email_address,
        password,
        badge_id,
        contact_no,
        office_id,
        role_id,
    } = requestBody;

    if (!username || !fullname || !email_address || !password || !badge_id || !office_id || !role_id) {
        throw {
            statusCode: 400,
            message: 'username, fullname, email_address, password, badge_id, office_id and role_id are all required',
        };
    }

    await checkUserManagementScope(requestingUser, office_id);

    const existingUserWithSameUsername = await userRepository.getUserByUsername(username);
    if (existingUserWithSameUsername) {
        throw { statusCode: 409, message: `Username '${username}' is already taken` };
    }

    const existingUserWithSameEmail = await userRepository.getUserByEmail(email_address);
    if (existingUserWithSameEmail) {
        throw { statusCode: 409, message: `Email address '${email_address}' is already registered` };
    }

    const existingUserWithSameBadge = await userRepository.getUserByBadgeId(badge_id);
    if (existingUserWithSameBadge) {
        throw { statusCode: 409, message: `Badge ID '${badge_id}' is already in use` };
    }

    const officeExists = await db('offices').where({ office_id }).first();
    if (!officeExists) {
        throw { statusCode: 400, message: 'The specified office does not exist' };
    }

    const roleExists = await db('roles').where({ role_id }).first();
    if (!roleExists) {
        throw { statusCode: 400, message: 'The specified role does not exist' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedContactNo = contact_no ? encrypt(contact_no) : null;

    const newUser = await userRepository.createUser({
        user_id:       uuidv4(),
        username:      username.trim().toLowerCase(),
        fullname:      fullname.trim(),
        email_address: email_address.trim().toLowerCase(),
        password:      hashedPassword,
        badge_id:      badge_id.trim().toUpperCase(),
        contact_no:    encryptedContactNo,
        office_id,
        role_id,
        status:        'ACTIVE',
    });

    return {
        ...newUser,
        contact_no: contact_no || null,
    };
}

export async function updateUser(userId, requestBody, requestingUser) {
    if (!userId) {
        throw { statusCode: 400, message: 'User ID is required' };
    }

    const existingUser = await userRepository.getUserById(userId);
    if (!existingUser) {
        throw { statusCode: 404, message: 'User not found' };
    }

    await checkUserManagementScope(requestingUser, existingUser.office_id);

    const immutableFieldNames = ['username', 'badge_id', 'password', 'status'];
    const attemptedImmutableFields = immutableFieldNames.filter(fieldName => requestBody[fieldName] !== undefined);
    if (attemptedImmutableFields.length > 0) {
        throw {
            statusCode: 400,
            message: `These fields cannot be changed via this endpoint: ${attemptedImmutableFields.join(', ')}. Use the reset-password endpoint for password changes.`,
        };
    }

    const fieldsToUpdate = {};

    if (requestBody.fullname !== undefined) {
        if (!requestBody.fullname.trim()) {
            throw { statusCode: 400, message: 'fullname cannot be empty' };
        }
        fieldsToUpdate.fullname = requestBody.fullname.trim();
    }

    if (requestBody.email_address !== undefined) {
        const duplicateEmailUser = await userRepository.getUserByEmail(requestBody.email_address);
        if (duplicateEmailUser && duplicateEmailUser.user_id !== userId) {
            throw { statusCode: 409, message: 'Email address is already in use by another user' };
        }
        fieldsToUpdate.email_address = requestBody.email_address.trim().toLowerCase();
    }

    if (requestBody.contact_no !== undefined) {
        fieldsToUpdate.contact_no = requestBody.contact_no
            ? encrypt(requestBody.contact_no)
            : null;
    }

    if (requestBody.office_id !== undefined) {
        const newOfficeExists = await db('offices').where({ office_id: requestBody.office_id }).first();
        if (!newOfficeExists) {
            throw { statusCode: 400, message: 'The specified office does not exist' };
        }
        await checkUserManagementScope(requestingUser, requestBody.office_id);
        fieldsToUpdate.office_id = requestBody.office_id;
    }

    if (requestBody.role_id !== undefined) {
        const newRoleExists = await db('roles').where({ role_id: requestBody.role_id }).first();
        if (!newRoleExists) {
            throw { statusCode: 400, message: 'The specified role does not exist' };
        }
        fieldsToUpdate.role_id = requestBody.role_id;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        throw {
            statusCode: 400,
            message: 'No valid fields to update. Editable fields: fullname, email_address, contact_no, office_id, role_id',
        };
    }

    const updatedUser = await userRepository.updateUser(userId, fieldsToUpdate);

    return {
        ...updatedUser,
        contact_no: requestBody.contact_no !== undefined
            ? requestBody.contact_no
            : decryptUserContactNo(existingUser).contact_no,
    };
}

export async function deactivateUser(userId, requestingUser) {
    if (!userId) {
        throw { statusCode: 400, message: 'User ID is required' };
    }

    const existingUser = await userRepository.getUserById(userId);
    if (!existingUser) {
        throw { statusCode: 404, message: 'User not found' };
    }

    if (existingUser.user_id === requestingUser.sub) {
        throw { statusCode: 400, message: 'You cannot deactivate your own account' };
    }

    if (existingUser.status === 'INACTIVE') {
        throw { statusCode: 409, message: 'User is already inactive' };
    }

    await checkUserManagementScope(requestingUser, existingUser.office_id);

    return userRepository.deactivateUser(userId);
}

export async function resetUserPassword(userId, requestBody, requestingUser) {
    if (!userId) {
        throw { statusCode: 400, message: 'User ID is required' };
    }

    const { new_password } = requestBody;

    if (!new_password || new_password.length < 8) {
        throw { statusCode: 400, message: 'new_password is required and must be at least 8 characters' };
    }

    const existingUser = await userRepository.getUserById(userId);
    if (!existingUser) {
        throw { statusCode: 404, message: 'User not found' };
    }

    await checkUserManagementScope(requestingUser, existingUser.office_id);

    const newHashedPassword = await bcrypt.hash(new_password, 10);
    await userRepository.updateUserPassword(userId, newHashedPassword);

    return { user_id: userId, message: 'Password reset successfully' };
}
