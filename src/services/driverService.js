//Services to handle business logic related to drivers

import { v4 as uuidv4 } from 'uuid';
import * as driverRepository from '../repositories/driverRepository.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';

// decrypts all sensitive PII fields — only used for home jurisdiction access
function decryptAllDriverFields(driverRecord) {
    if (!driverRecord) return driverRecord;
    return {
        ...driverRecord,
        driver_identity_no: driverRecord.driver_identity_no ? decrypt(driverRecord.driver_identity_no) : null,
        driver_contact_no:  driverRecord.driver_contact_no  ? decrypt(driverRecord.driver_contact_no)  : null,
        address:            driverRecord.address             ? decrypt(driverRecord.address)             : null,
        driver_license_no:  driverRecord.driver_license_no  ? decrypt(driverRecord.driver_license_no)  : null,
    };
}

// returns only non-sensitive fields for cross-jurisdiction access
// this is enough for an officer to know the driver exists and if they are valid
function buildRestrictedDriverSummary(driverRecord) {
    return {
        driver_id:          driverRecord.driver_id,
        driver_fullname:    driverRecord.driver_fullname,
        driver_gender:      driverRecord.driver_gender,
        license_expiry_date: driverRecord.license_expiry_date,
        status:             driverRecord.status,
        created_time:       driverRecord.created_time,
        access_level:       'NON_JURISDICTION_SUMMARY',
    };
}

// resolves what district IDs the user can see at full access (home jurisdiction)
async function resolveHomeDistrictIds(requestingUser) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') return null;

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        return driverRepository.getDistrictIdsByProvinceId(requestingUser.jurisdiction_ref_id);
    }

    if (
        requestingUser.jurisdiction_type === 'DISTRICT' ||
        requestingUser.jurisdiction_type === 'STATION'
    ) {
        return [requestingUser.jurisdiction_ref_id];
    }

    return [];
}

// checks if a driver's primary district is within the user's home jurisdiction
async function isDriverInHomeJurisdiction(driverId, homeDistrictIds) {
    if (homeDistrictIds === null) return true; // NATIONAL sees everything as home

    const driverDistrictInfo = await driverRepository.findPrimaryDistrictForDriver(driverId);
    if (!driverDistrictInfo) return false;

    return homeDistrictIds.includes(driverDistrictInfo.district_id);
}

export async function getAllDrivers(queryParams, requestingUser) {
    const { limit, offset } = getPaginationParams(queryParams);

    const homeDistrictIds = await resolveHomeDistrictIds(requestingUser);

    // for NATIONAL users, pass null so no district filter is applied
    // allAccessibleDistrictIds equals homeDistrictIds for now
    const allAccessibleDistrictIds = homeDistrictIds;

    const { listOfDrivers, totalDriverCount } = await driverRepository.findAllDriversInJurisdiction({
        limit,
        offset,
        homeDistrictIds,
        allAccessibleDistrictIds,
        searchTerm: queryParams.search || null,
        status:     queryParams.status || null,
    });

    // apply tiered access — full PII for home jurisdiction, restricted for others
    const tieredListOfDrivers = await Promise.all(
        listOfDrivers.map(async driverRecord => {
            const driverIsInHomeJurisdiction = await isDriverInHomeJurisdiction(
                driverRecord.driver_id,
                homeDistrictIds,
            );

            if (driverIsInHomeJurisdiction) {
                return {
                    ...decryptAllDriverFields(driverRecord),
                    access_level: 'FULL',
                };
            }

            return buildRestrictedDriverSummary(driverRecord);
        })
    );

    return buildCollection(
        '/api/v1/drivers',
        offset,
        limit,
        totalDriverCount,
        tieredListOfDrivers,
    );
}

export async function getDriverById(driverId, requestingUser) {
    if (!driverId) {
        throw { statusCode: 400, message: 'Driver ID is required' };
    }

    const foundDriver = await driverRepository.findDriverById(driverId);
    if (!foundDriver) {
        throw { statusCode: 404, message: 'Driver not found' };
    }

    const homeDistrictIds = await resolveHomeDistrictIds(requestingUser);
    const driverIsInHomeJurisdiction = await isDriverInHomeJurisdiction(
        foundDriver.driver_id,
        homeDistrictIds,
    );

    if (driverIsInHomeJurisdiction) {
        return {
            ...decryptAllDriverFields(foundDriver),
            access_level: 'FULL',
        };
    }

    // cross-jurisdiction — return restricted summary with contact station
    const driverDistrictInfo = await driverRepository.findPrimaryDistrictForDriver(driverId);
    const contactStation = driverDistrictInfo
        ? await driverRepository.findContactStationForDistrict(driverDistrictInfo.district_id)
        : null;

    return {
        ...buildRestrictedDriverSummary(foundDriver),
        registered_district: driverDistrictInfo?.district_name   || null,
        registered_province: driverDistrictInfo?.province_name   || null,
        contact_station: contactStation
            ? {
                office_name:    contactStation.office_name,
                office_contact: contactStation.office_contact,
                office_code:    contactStation.office_code,
            }
            : null,
        note: 'Full driver details are available through the registered district station',
    };
}

export async function createDriver(requestBody, requestingUser) {
    const {
        driver_fullname,
        driver_identity_no,
        driver_id_type,
        date_of_birth,
        driver_gender,
        driver_contact_no  = null,
        address            = null,
        driver_license_no,
        license_expiry_date,
    } = requestBody;

    if (
        !driver_fullname || !driver_identity_no || !driver_id_type ||
        !date_of_birth || !driver_gender || !driver_license_no || !license_expiry_date
    ) {
        throw {
            statusCode: 400,
            message: 'driver_fullname, driver_identity_no, driver_id_type, date_of_birth, driver_gender, driver_license_no and license_expiry_date are all required',
        };
    }

    const validIdTypes = ['NIC', 'PASSPORT'];
    if (!validIdTypes.includes(driver_id_type)) {
        throw { statusCode: 400, message: `driver_id_type must be one of: ${validIdTypes.join(', ')}` };
    }

    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(driver_gender)) {
        throw { statusCode: 400, message: `driver_gender must be one of: ${validGenders.join(', ')}` };
    }

    const licenseExpiryDate = new Date(license_expiry_date);
    const todaysDate = new Date();
    if (licenseExpiryDate < todaysDate) {
        throw { statusCode: 400, message: 'Cannot register a driver with an already expired driving licence' };
    }

    const createdDriver = await driverRepository.createDriver({
        driver_id:          uuidv4(),
        driver_fullname:    driver_fullname.trim(),
        driver_identity_no: encrypt(driver_identity_no.trim().toUpperCase()),
        driver_id_type,
        date_of_birth,
        driver_gender,
        driver_contact_no:  driver_contact_no  ? encrypt(driver_contact_no.trim())  : null,
        address:            address            ? encrypt(address.trim())            : null,
        driver_license_no:  encrypt(driver_license_no.trim().toUpperCase()),
        license_expiry_date,
        status: 'ACTIVE',
    });

    // return plain text on creation so the registering officer can verify
    return {
        ...createdDriver,
        driver_identity_no: driver_identity_no.trim().toUpperCase(),
        driver_contact_no:  driver_contact_no  || null,
        address:            address            || null,
        driver_license_no:  driver_license_no.trim().toUpperCase(),
        access_level:       'FULL',
    };
}

export async function updateDriver(driverId, requestBody, requestingUser) {
    if (!driverId) {
        throw { statusCode: 400, message: 'Driver ID is required' };
    }

    const existingDriver = await driverRepository.findDriverById(driverId);
    if (!existingDriver) {
        throw { statusCode: 404, message: 'Driver not found' };
    }

    // updates are home jurisdiction only — no tiered access for writes
    const homeDistrictIds = await resolveHomeDistrictIds(requestingUser);
    const driverIsInHomeJurisdiction = await isDriverInHomeJurisdiction(
        existingDriver.driver_id,
        homeDistrictIds,
    );

    if (!driverIsInHomeJurisdiction) {
        throw {
            statusCode: 403,
            message: 'You can only update drivers within your jurisdiction. Contact the registered district station for changes.',
        };
    }

    const immutableFieldNames = ['driver_identity_no', 'driver_id_type', 'driver_license_no', 'status'];
    const attemptedImmutableFields = immutableFieldNames.filter(fieldName => requestBody[fieldName] !== undefined);
    if (attemptedImmutableFields.length > 0) {
        throw {
            statusCode: 400,
            message: `These fields cannot be changed: ${attemptedImmutableFields.join(', ')}`,
        };
    }

    const fieldsToUpdate = {};

    if (requestBody.driver_fullname !== undefined) {
        if (!requestBody.driver_fullname.trim()) {
            throw { statusCode: 400, message: 'driver_fullname cannot be empty' };
        }
        fieldsToUpdate.driver_fullname = requestBody.driver_fullname.trim();
    }

    if (requestBody.driver_gender !== undefined) {
        const validGenders = ['MALE', 'FEMALE', 'OTHER'];
        if (!validGenders.includes(requestBody.driver_gender)) {
            throw { statusCode: 400, message: `driver_gender must be one of: ${validGenders.join(', ')}` };
        }
        fieldsToUpdate.driver_gender = requestBody.driver_gender;
    }

    if (requestBody.driver_contact_no !== undefined) {
        fieldsToUpdate.driver_contact_no = requestBody.driver_contact_no
            ? encrypt(requestBody.driver_contact_no.trim())
            : null;
    }

    if (requestBody.address !== undefined) {
        fieldsToUpdate.address = requestBody.address
            ? encrypt(requestBody.address.trim())
            : null;
    }

    // license renewal is the most common update operation
    if (requestBody.license_expiry_date !== undefined) {
        fieldsToUpdate.license_expiry_date = requestBody.license_expiry_date;
    }

    if (requestBody.date_of_birth !== undefined) {
        fieldsToUpdate.date_of_birth = requestBody.date_of_birth;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        throw {
            statusCode: 400,
            message: 'No valid fields to update. Editable fields: driver_fullname, driver_gender, driver_contact_no, address, license_expiry_date, date_of_birth',
        };
    }

    const updatedDriver = await driverRepository.updateDriver(driverId, fieldsToUpdate);

    return {
        ...updatedDriver,
        driver_identity_no: decrypt(updatedDriver.driver_identity_no),
        driver_license_no:  decrypt(updatedDriver.driver_license_no),
        driver_contact_no: requestBody.driver_contact_no !== undefined
            ? requestBody.driver_contact_no || null
            : (existingDriver.driver_contact_no ? decrypt(existingDriver.driver_contact_no) : null),
        address: requestBody.address !== undefined
            ? requestBody.address || null
            : (existingDriver.address ? decrypt(existingDriver.address) : null),
        access_level: 'FULL',
    };
}

export async function suspendDriver(driverId, requestingUser) {
    if (!driverId) {
        throw { statusCode: 400, message: 'Driver ID is required' };
    }

    const existingDriver = await driverRepository.findDriverById(driverId);
    if (!existingDriver) {
        throw { statusCode: 404, message: 'Driver not found' };
    }

    // suspension is home jurisdiction only
    const homeDistrictIds = await resolveHomeDistrictIds(requestingUser);
    const driverIsInHomeJurisdiction = await isDriverInHomeJurisdiction(
        existingDriver.driver_id,
        homeDistrictIds,
    );

    if (!driverIsInHomeJurisdiction) {
        throw {
            statusCode: 403,
            message: 'You can only suspend drivers within your jurisdiction',
        };
    }

    if (existingDriver.status === 'SUSPENDED') {
        throw { statusCode: 409, message: 'Driver is already suspended' };
    }

    if (existingDriver.status === 'BLACKLISTED') {
        throw { statusCode: 409, message: 'Driver is blacklisted. Use change-status to manage blacklisted drivers.' };
    }

    const numberOfActiveAssignments = await driverRepository.countActiveAssignmentsByDriverId(driverId);
    if (numberOfActiveAssignments > 0) {
        throw {
            statusCode: 409,
            message: 'Cannot suspend a driver with an active vehicle assignment. Unassign the driver first.',
        };
    }

    return driverRepository.changeDriverStatus(driverId, 'SUSPENDED');
}

export async function changeDriverStatus(driverId, requestBody, requestingUser) {
    if (!driverId) {
        throw { statusCode: 400, message: 'Driver ID is required' };
    }

    const { status: newStatus } = requestBody;

    const allowedStatusValues = ['ACTIVE', 'SUSPENDED', 'BLACKLISTED'];
    if (!newStatus || !allowedStatusValues.includes(newStatus)) {
        throw {
            statusCode: 400,
            message: `status must be one of: ${allowedStatusValues.join(', ')}`,
        };
    }

    const existingDriver = await driverRepository.findDriverById(driverId);
    if (!existingDriver) {
        throw { statusCode: 404, message: 'Driver not found' };
    }

    // all status changes are home jurisdiction only
    const homeDistrictIds = await resolveHomeDistrictIds(requestingUser);
    const driverIsInHomeJurisdiction = await isDriverInHomeJurisdiction(
        existingDriver.driver_id,
        homeDistrictIds,
    );

    if (!driverIsInHomeJurisdiction) {
        throw {
            statusCode: 403,
            message: 'You can only change the status of drivers within your jurisdiction',
        };
    }

    // reversing BLACKLISTED requires HQ level access
    if (existingDriver.status === 'BLACKLISTED' && newStatus !== 'BLACKLISTED') {
        if (requestingUser.role !== 'HQ_SUPER_ADMIN' && requestingUser.role !== 'HQ_OFFICER') {
            throw {
                statusCode: 403,
                message: 'Only HQ officers can change the status of a blacklisted driver',
            };
        }
    }

    if (existingDriver.status === newStatus) {
        throw { statusCode: 409, message: `Driver status is already ${newStatus}` };
    }

    // cannot activate a driver with an expired licence
    if (newStatus === 'ACTIVE') {
        const licenseExpiryDate = new Date(existingDriver.license_expiry_date);
        const todaysDate = new Date();
        if (licenseExpiryDate < todaysDate) {
            throw {
                statusCode: 409,
                message: 'Cannot activate a driver with an expired driving licence. Update the license_expiry_date first.',
            };
        }
    }

    return driverRepository.changeDriverStatus(driverId, newStatus);
}
