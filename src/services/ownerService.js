//Owner service to handle business logic

import { v4 as uuidv4 } from 'uuid';
import * as ownerRepository from '../repositories/ownerRepository.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';
import { encrypt, decrypt, hmac } from '../utils/encryption.js';

function decryptOwnerFields(ownerRecord) {
    if (!ownerRecord) return ownerRecord;
    return {
        ...ownerRecord,
        owner_identity_no: ownerRecord.owner_identity_no ? decrypt(ownerRecord.owner_identity_no) : null,
        owner_contact:     ownerRecord.owner_contact     ? decrypt(ownerRecord.owner_contact)     : null,
        owner_address:     ownerRecord.owner_address     ? decrypt(ownerRecord.owner_address)     : null,
    };
}

async function resolveDistrictIdsForJurisdiction(requestingUser) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') {
        return null;
    }

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        const districtIdsInProvince = await ownerRepository.getDistrictIdsByProvinceId(
            requestingUser.jurisdiction_ref_id
        );
        return districtIdsInProvince;
    }

    if (
        requestingUser.jurisdiction_type === 'DISTRICT' ||
        requestingUser.jurisdiction_type === 'STATION'
    ) {
        return [requestingUser.jurisdiction_ref_id];
    }

    return null;
}

export async function getAllOwners(queryParams, requestingUser) {
    const { limit, offset } = getPaginationParams(queryParams);

    const districtIdsForJurisdiction = await resolveDistrictIdsForJurisdiction(requestingUser);

    let ownerIdsToFilterBy = null;

    if (districtIdsForJurisdiction !== null) {
        ownerIdsToFilterBy = await ownerRepository.getOwnerIdsByDistrictIds(
            districtIdsForJurisdiction
        );
    }

    const { listOfOwners, totalOwnerCount } = await ownerRepository.findAllOwners({
        limit,
        offset,
        ownerIdsToFilterBy,
        searchTerm: queryParams.search || null,
        status:     queryParams.status || null,
    });

    const decryptedListOfOwners = listOfOwners.map(decryptOwnerFields);

    return buildCollection(
        '/tuktrack/v1/owners',
        offset,
        limit,
        totalOwnerCount,
        decryptedListOfOwners,
    );
}

export async function getOwnerById(ownerId, requestingUser) {
    if (!ownerId) {
        throw { statusCode: 400, message: 'Owner ID is required' };
    }

    const encryptedOwnerId = hmac(ownerId.trim().toUpperCase());
    const foundOwner = await ownerRepository.findOwnerById(encryptedOwnerId);
    if (!foundOwner) {
        throw { statusCode: 404, message: 'Owner not found' };
    }

    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        const districtIdsForJurisdiction = await resolveDistrictIdsForJurisdiction(requestingUser);
        const ownerIdsInJurisdiction = await ownerRepository.getOwnerIdsByDistrictIds(
            districtIdsForJurisdiction
        );
        const ownerIsInJurisdiction = ownerIdsInJurisdiction.includes(foundOwner.owner_id);

        if (!ownerIsInJurisdiction) {
            throw { statusCode: 403, message: 'You do not have access to this owner' };
        }
    }

    return decryptOwnerFields(foundOwner);
}

export async function createOwner(requestBody, requestingUser) {
    const {
        owner_fullname,
        owner_identity_no,
        owner_id_type,
        owner_gender,
        owner_contact  = null,
        owner_address  = null,
    } = requestBody;

    if (!owner_fullname || !owner_identity_no || !owner_id_type || !owner_gender) {
        throw {
            statusCode: 400,
            message: 'owner_fullname, owner_identity_no, owner_id_type and owner_gender are required',
        };
    }

    const validIdTypes = ['NIC', 'PASSPORT', 'BUSINESS'];
    if (!validIdTypes.includes(owner_id_type)) {
        throw {
            statusCode: 400,
            message: `owner_id_type must be one of: ${validIdTypes.join(', ')}`,
        };
    }

    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(owner_gender)) {
        throw {
            statusCode: 400,
            message: `owner_gender must be one of: ${validGenders.join(', ')}`,
        };
    }

    const encryptedIdentityNo = encrypt(owner_identity_no.trim().toUpperCase());

    const existingOwnerWithSameId = await ownerRepository.findOwnerByIdentityNo(encryptedIdentityNo);
    if (existingOwnerWithSameId) {
        throw {
            statusCode: 409,
            message: `An owner with identity number '${owner_identity_no}' already exists`,
        };
    }

    const newOwner = await ownerRepository.createOwner({
        owner_id:          uuidv4(),
        owner_fullname:    owner_fullname.trim(),
        owner_identity_no: encryptedIdentityNo,
        owner_id_type,
        owner_gender,
        owner_contact:     owner_contact ? encrypt(owner_contact.trim()) : null,
        owner_address:     owner_address ? encrypt(owner_address.trim()) : null,
        status:            'ACTIVE',
    });

    return {
        ...newOwner,
        owner_identity_no: owner_identity_no.trim().toUpperCase(),
        owner_contact:     owner_contact || null,
        owner_address:     owner_address || null,
    };
}

export async function updateOwner(ownerId, requestBody, requestingUser) {
    if (!ownerId) {
        throw { statusCode: 400, message: 'Owner ID is required' };
    }

    const encryptedOwnerId = encrypt(ownerId.trim().toUpperCase());
    const existingOwner = await ownerRepository.findOwnerById(encryptedOwnerId);
    if (!existingOwner) {
        throw { statusCode: 404, message: 'Owner not found' };
    }

    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        const districtIdsForJurisdiction = await resolveDistrictIdsForJurisdiction(requestingUser);
        const ownerIdsInJurisdiction = await ownerRepository.getOwnerIdsByDistrictIds(
            districtIdsForJurisdiction
        );
        if (!ownerIdsInJurisdiction.includes(existingOwner.owner_id)) {
            throw { statusCode: 403, message: 'You do not have access to this owner' };
        }
    }

    const immutableFields = ['owner_identity_no', 'owner_id_type', 'status'];
    const attemptedImmutableFields = immutableFields.filter(fieldName => requestBody[fieldName] !== undefined);
    if (attemptedImmutableFields.length > 0) {
        throw {
            statusCode: 400,
            message: `These fields cannot be changed: ${attemptedImmutableFields.join(', ')}`,
        };
    }

    const fieldsToUpdate = {};

    if (requestBody.owner_fullname !== undefined) {
        if (!requestBody.owner_fullname.trim()) {
            throw { statusCode: 400, message: 'owner_fullname cannot be empty' };
        }
        fieldsToUpdate.owner_fullname = requestBody.owner_fullname.trim();
    }

    if (requestBody.owner_gender !== undefined) {
        const validGenders = ['MALE', 'FEMALE', 'OTHER'];
        if (!validGenders.includes(requestBody.owner_gender)) {
            throw { statusCode: 400, message: `owner_gender must be one of: ${validGenders.join(', ')}` };
        }
        fieldsToUpdate.owner_gender = requestBody.owner_gender;
    }

    if (requestBody.owner_contact !== undefined) {
        fieldsToUpdate.owner_contact = requestBody.owner_contact
            ? encrypt(requestBody.owner_contact.trim())
            : null;
    }

    if (requestBody.owner_address !== undefined) {
        fieldsToUpdate.owner_address = requestBody.owner_address
            ? encrypt(requestBody.owner_address.trim())
            : null;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        throw {
            statusCode: 400,
            message: 'No valid fields to update. Editable fields: owner_fullname, owner_gender, owner_contact, owner_address',
        };
    }

    const updatedOwner = await ownerRepository.updateOwner(encryptedOwnerId, fieldsToUpdate);

    return {
        ...updatedOwner,
        owner_identity_no: decrypt(updatedOwner.owner_identity_no),
        owner_contact: requestBody.owner_contact !== undefined
            ? requestBody.owner_contact || null
            : (existingOwner.owner_contact ? decrypt(existingOwner.owner_contact) : null),
        owner_address: requestBody.owner_address !== undefined
            ? requestBody.owner_address || null
            : (existingOwner.owner_address ? decrypt(existingOwner.owner_address) : null),
    };
}

export async function deactivateOwner(ownerId, requestingUser) {
    if (!ownerId) {
        throw { statusCode: 400, message: 'Owner ID is required' };
    }

    const encryptedOwnerId = encrypt(ownerId.trim().toUpperCase());
    const existingOwner = await ownerRepository.findOwnerById(encryptedOwnerId);
    if (!existingOwner) {
        throw { statusCode: 404, message: 'Owner not found' };
    }

    if (existingOwner.status === 'INACTIVE') {
        throw { statusCode: 409, message: 'Owner is already inactive' };
    }

    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        const districtIdsForJurisdiction = await resolveDistrictIdsForJurisdiction(requestingUser);
        const ownerIdsInJurisdiction = await ownerRepository.getOwnerIdsByDistrictIds(
            districtIdsForJurisdiction
        );
        if (!ownerIdsInJurisdiction.includes(existingOwner.owner_id)) {
            throw { statusCode: 403, message: 'You do not have access to this owner' };
        }
    }

    const numberOfActiveVehicles = await ownerRepository.countActiveVehiclesByOwnerId(existingOwner.owner_id);
    if (numberOfActiveVehicles > 0) {
        throw {
            statusCode: 409,
            message: `Cannot deactivate an owner with ${numberOfActiveVehicles} active vehicle(s). Deregister all vehicles first.`,
        };
    }

    return ownerRepository.deactivateOwner(encryptedOwnerId);
}

export async function getOwnerVehicles(ownerId, queryParams, requestingUser) {
    if (!ownerId) {
        throw { statusCode: 400, message: 'Owner ID is required' };
    }

    const encryptedOwnerId = encrypt(ownerId.trim().toUpperCase());
    const existingOwner = await ownerRepository.findOwnerById(encryptedOwnerId);
    if (!existingOwner) {
        throw { statusCode: 404, message: 'Owner not found' };
    }

    const districtIdsForJurisdiction = await resolveDistrictIdsForJurisdiction(requestingUser);

    if (requestingUser.jurisdiction_type !== 'NATIONAL') {
        const ownerIdsInJurisdiction = await ownerRepository.getOwnerIdsByDistrictIds(
            districtIdsForJurisdiction
        );
        if (!ownerIdsInJurisdiction.includes(existingOwner.owner_id)) {
            throw { statusCode: 403, message: 'You do not have access to this owner' };
        }
    }

    const { limit, offset } = getPaginationParams(queryParams);

    const { vehiclesOfOwner, totalVehicleCount } = await ownerRepository.findVehiclesByOwnerId(
        existingOwner.owner_id,
        {
            limit,
            offset,
            districtIdsToFilterBy: districtIdsForJurisdiction,
        }
    );

    const decryptedOwner = decryptOwnerFields(existingOwner);

    return {
        owner: decryptedOwner,
        collection: buildCollection(
            `/tuktrack/v1/owners/${ownerId}/vehicles`,
            offset,
            limit,
            totalVehicleCount,
            vehiclesOfOwner,
        ),
    };
}