//Service for vehicles to handle business logic

import { v4 as uuidv4 } from 'uuid';
import * as vehicleRepository from '../repositories/vehicleRepository.js';
import * as locationPingRepository from '../repositories/locationPingRepository.js';
import * as assignmentRepository from '../repositories/assignmentRepository.js';
import { decrypt } from '../utils/encryption.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';

// resolves which district IDs the requesting user is allowed to see
async function resolveAllowedDistrictIds(requestingUser) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') {
        return null; // null means no filter applied
    }

    if (requestingUser.jurisdiction_type === 'PROVINCIAL') {
        const districtIdsInProvince = await vehicleRepository.getDistrictIdsByProvinceId(
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

// checks if a specific vehicle is within the user's allowed jurisdiction
async function checkVehicleJurisdictionAccess(requestingUser, vehicleDistrictId) {
    if (requestingUser.jurisdiction_type === 'NATIONAL') return;

    const allowedDistrictIds = await resolveAllowedDistrictIds(requestingUser);

    if (allowedDistrictIds && !allowedDistrictIds.includes(vehicleDistrictId)) {
        throw { statusCode: 403, message: 'You do not have access to this vehicle' };
    }
}

export async function getAllVehicles(queryParams, requestingUser) {
    const { limit, offset } = getPaginationParams(queryParams);

    const allowedDistrictIds = await resolveAllowedDistrictIds(requestingUser);

    const filters = {};

    if (allowedDistrictIds !== null) {
        filters.districtIdsToFilterBy = allowedDistrictIds;
    }

    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.district_id) filters.district_id = queryParams.district_id;
    if (queryParams.fuel_type) filters.fuel_type = queryParams.fuel_type;
    if (queryParams.make_of_vehicle) filters.make_of_vehicle = queryParams.make_of_vehicle;
    if (queryParams.owner_id) filters.owner_id = queryParams.owner_id;

    if (queryParams.is_diplomatic !== undefined) {
        filters.is_diplomatic = queryParams.is_diplomatic === 'true';
    }

    const { listOfVehicles, totalVehicleCount } = await vehicleRepository.findAllVehicles({
        limit,
        offset,
        filters,
    });

    return buildCollection(
        '/tuktrack/v1/vehicles',
        offset,
        limit,
        totalVehicleCount,
        listOfVehicles,
    );
}

export async function getVehicleById(vehicleId, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const foundVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!foundVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, foundVehicle.district_id);

    return foundVehicle;
}

export async function getVehicleFullProfile(vehicleId, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const profileData = await vehicleRepository.findVehicleFullProfile(vehicleId);
    if (!profileData) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    const { vehicleRecord, currentDriverAssignment } = profileData;

    await checkVehicleJurisdictionAccess(requestingUser, vehicleRecord.district_id);

    // decrypt owner PII fields before returning
    const ownerDetails = {
        owner_id:          vehicleRecord.owner_id,
        owner_fullname:    vehicleRecord.owner_fullname,
        owner_identity_no: vehicleRecord.owner_identity_no ? decrypt(vehicleRecord.owner_identity_no) : null,
        owner_id_type:     vehicleRecord.owner_id_type,
        owner_gender:      vehicleRecord.owner_gender,
        owner_contact:     vehicleRecord.owner_contact ? decrypt(vehicleRecord.owner_contact) : null,
        owner_address:     vehicleRecord.owner_address ? decrypt(vehicleRecord.owner_address) : null,
        owner_status:      vehicleRecord.owner_status,
    };

    // decrypt driver PII fields if a driver is assigned
    let currentDriverDetails = null;
    if (currentDriverAssignment) {
        currentDriverDetails = {
            ...currentDriverAssignment,
            driver_identity_no: currentDriverAssignment.driver_identity_no
                ? decrypt(currentDriverAssignment.driver_identity_no)
                : null,
            driver_license_no: currentDriverAssignment.driver_license_no
                ? decrypt(currentDriverAssignment.driver_license_no)
                : null,
            driver_contact_no: currentDriverAssignment.driver_contact_no
                ? decrypt(currentDriverAssignment.driver_contact_no)
                : null,
        };
    }

    const deviceDetails = vehicleRecord.device_serial_no
        ? {
            device_id:         vehicleRecord.device_id,
            device_serial_no:  vehicleRecord.device_serial_no,
            device_status:     vehicleRecord.device_status,
        }
        : null;

    // build the composite profile response
    return {
        vehicle_id:         vehicleRecord.vehicle_id,
        license_plate_no:   vehicleRecord.license_plate_no,
        chassis_number:     vehicleRecord.chassis_number,
        engine_number:      vehicleRecord.engine_number,
        make_of_vehicle:    vehicleRecord.make_of_vehicle,
        model_of_vehicle:   vehicleRecord.model_of_vehicle,
        manufacture_year:   vehicleRecord.manufacture_year,
        vehicle_colour:     vehicleRecord.vehicle_colour,
        fuel_type:          vehicleRecord.fuel_type,
        is_diplomatic:      vehicleRecord.is_diplomatic,
        vehicle_reg_date:   vehicleRecord.vehicle_reg_date,
        status:             vehicleRecord.status,
        district_name:      vehicleRecord.district_name,
        province_name:      vehicleRecord.province_name,
        owner:              ownerDetails,
        current_driver:     currentDriverDetails,
        device:             deviceDetails,
    };
}

export async function createVehicle(requestBody, requestingUser) {
    const {
        owner_id,
        district_id,
        license_plate_no,
        chassis_number,
        engine_number,
        make_of_vehicle,
        model_of_vehicle,
        manufacture_year,
        vehicle_colour   = null,
        fuel_type,
        is_diplomatic    = false,
        vehicle_reg_date,
    } = requestBody;

    if (
        !owner_id || !district_id || !license_plate_no ||
        !chassis_number || !engine_number || !make_of_vehicle ||
        !model_of_vehicle || !manufacture_year || !fuel_type || !vehicle_reg_date
    ) {
        throw {
            statusCode: 400,
            message: 'owner_id, district_id, license_plate_no, chassis_number, engine_number, make_of_vehicle, model_of_vehicle, manufacture_year, fuel_type and vehicle_reg_date are all required',
        };
    }

    const validFuelTypes = ['PETROL', 'CNG', 'ELECTRIC'];
    if (!validFuelTypes.includes(fuel_type)) {
        throw {
            statusCode: 400,
            message: `fuel_type must be one of: ${validFuelTypes.join(', ')}`,
        };
    }

    const manufactureYearAsNumber = parseInt(manufacture_year);
    if (isNaN(manufactureYearAsNumber) || manufactureYearAsNumber < 1990 || manufactureYearAsNumber > new Date().getFullYear()) {
        throw {
            statusCode: 400,
            message: `manufacture_year must be a valid year between 1990 and ${new Date().getFullYear()}`,
        };
    }

    // jurisdiction check — officer can only register vehicles in their district
    await checkVehicleJurisdictionAccess(requestingUser, district_id);

    // uniqueness checks
    const existingVehicleWithSamePlate = await vehicleRepository.findVehicleByLicensePlate(license_plate_no);
    if (existingVehicleWithSamePlate) {
        throw { statusCode: 409, message: `License plate '${license_plate_no}' is already registered` };
    }

    const existingVehicleWithSameChassis = await vehicleRepository.findVehicleByChassisNumber(chassis_number);
    if (existingVehicleWithSameChassis) {
        throw { statusCode: 409, message: `Chassis number '${chassis_number}' is already registered` };
    }

    const existingVehicleWithSameEngine = await vehicleRepository.findVehicleByEngineNumber(engine_number);
    if (existingVehicleWithSameEngine) {
        throw { statusCode: 409, message: `Engine number '${engine_number}' is already registered` };
    }

    return vehicleRepository.createVehicle({
        vehicle_id:       uuidv4(),
        owner_id,
        district_id,
        device_id:        null, // device is assigned separately via assign-device controller
        license_plate_no: license_plate_no.trim().toUpperCase(),
        chassis_number:   chassis_number.trim().toUpperCase(),
        engine_number:    engine_number.trim().toUpperCase(),
        make_of_vehicle:  make_of_vehicle.trim(),
        model_of_vehicle: model_of_vehicle.trim(),
        manufacture_year: manufactureYearAsNumber,
        vehicle_colour:   vehicle_colour ? vehicle_colour.trim() : null,
        fuel_type,
        is_diplomatic:    Boolean(is_diplomatic),
        vehicle_reg_date,
        status:           'ACTIVE',
    });
}

export async function updateVehicle(vehicleId, requestBody, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    if (existingVehicle.status === 'DEREGISTERED') {
        throw { statusCode: 409, message: 'Cannot update a deregistered vehicle' };
    }

    // these fields are immutable — they identify the physical vehicle
    const immutableFieldNames = [
        'license_plate_no',
        'chassis_number', 'engine_number',
        'status', 'device_id',
    ];
    const attemptedImmutableFields = immutableFieldNames.filter(fieldName => requestBody[fieldName] !== undefined);
    if (attemptedImmutableFields.length > 0) {
        throw {
            statusCode: 400,
            message: `These fields cannot be changed: ${attemptedImmutableFields.join(', ')}. Use change-status for status changes and assign-device for device assignment.`,
        };
    }

    const fieldsToUpdate = {};

    if (requestBody.make_of_vehicle !== undefined) fieldsToUpdate.make_of_vehicle = requestBody.make_of_vehicle.trim();
    if (requestBody.model_of_vehicle !== undefined) fieldsToUpdate.model_of_vehicle = requestBody.model_of_vehicle.trim();
    if (requestBody.vehicle_colour !== undefined) fieldsToUpdate.vehicle_colour = requestBody.vehicle_colour ? requestBody.vehicle_colour.trim() : null;
    if (requestBody.is_diplomatic !== undefined) fieldsToUpdate.is_diplomatic = Boolean(requestBody.is_diplomatic);
    if (requestBody.vehicle_reg_date !== undefined) fieldsToUpdate.vehicle_reg_date = requestBody.vehicle_reg_date;

    if (requestBody.fuel_type !== undefined) {
        const validFuelTypes = ['PETROL', 'CNG', 'ELECTRIC'];
        if (!validFuelTypes.includes(requestBody.fuel_type)) {
            throw { statusCode: 400, message: `fuel_type must be one of: ${validFuelTypes.join(', ')}` };
        }
        fieldsToUpdate.fuel_type = requestBody.fuel_type;
    }

    if (requestBody.owner_id !== undefined) fieldsToUpdate.owner_id = requestBody.owner_id;

    if (requestBody.district_id !== undefined) {
        await checkVehicleJurisdictionAccess(requestingUser, requestBody.district_id);
        fieldsToUpdate.district_id = requestBody.district_id;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        throw {
            statusCode: 400,
            message: 'No valid fields to update. Editable fields: make_of_vehicle, model_of_vehicle, vehicle_colour, fuel_type, is_diplomatic, vehicle_reg_date, owner_id, district_id',
        };
    }

    return vehicleRepository.updateVehicle(vehicleId, fieldsToUpdate);
}

export async function deregisterVehicle(vehicleId, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    if (existingVehicle.status === 'DEREGISTERED') {
        throw { statusCode: 409, message: 'Vehicle is already deregistered' };
    }

    // cannot deregister a vehicle that still has an active driver assignment
    const numberOfActiveAssignments = await vehicleRepository.countActiveAssignmentsByVehicleId(existingVehicle.vehicle_id);
    if (numberOfActiveAssignments > 0) {
        throw {
            statusCode: 409,
            message: 'Cannot deregister a vehicle with an active driver assignment. Unassign the driver first.',
        };
    }

    return vehicleRepository.changeVehicleStatus(vehicleId, 'DEREGISTERED');
}

export async function changeVehicleStatus(vehicleId, requestBody, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const { status: newStatus } = requestBody;

    const allowedStatusValues = ['ACTIVE', 'SUSPENDED', 'FLAGGED'];
    if (!newStatus || !allowedStatusValues.includes(newStatus)) {
        throw {
            statusCode: 400,
            message: `status must be one of: ${allowedStatusValues.join(', ')}`,
        };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    if (existingVehicle.status === 'DEREGISTERED') {
        throw { statusCode: 409, message: 'Cannot change status of a deregistered vehicle' };
    }

    if (existingVehicle.status === newStatus) {
        throw { statusCode: 409, message: `Vehicle status is already ${newStatus}` };
    }

    return vehicleRepository.changeVehicleStatus(vehicleId, newStatus);
}

export async function getVehicleDriverHistory(vehicleId, queryParams, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    const { limit, offset } = getPaginationParams(queryParams);

    const { listOfAssignments, totalAssignmentCount } = await assignmentRepository.findDriverAssignmentsByVehicleId(
        existingVehicle.vehicle_id,
        { limit, offset }
    );

    // decrypt driver identity fields in the assignment records
    const decryptedAssignments = listOfAssignments.map(assignmentRecord => ({
        ...assignmentRecord,
        driver_identity_no: assignmentRecord.driver_identity_no
            ? decrypt(assignmentRecord.driver_identity_no)
            : null,
        driver_license_no: assignmentRecord.driver_license_no
            ? decrypt(assignmentRecord.driver_license_no)
            : null,
    }));

    return {
        vehicle: existingVehicle,
        collection: buildCollection(
            `/tuktrack/v1/vehicles/${vehicleId}/drivers`,
            offset,
            limit,
            totalAssignmentCount,
            decryptedAssignments,
        ),
    };
}

export async function getSpecificAssignment(vehicleId, assignmentId, requestingUser) {
    if (!vehicleId || !assignmentId) {
        throw { statusCode: 400, message: 'Vehicle ID and Assignment ID are both required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    const foundAssignment = await assignmentRepository.findAssignmentByIdAndVehicleId(
        assignmentId,
        existingVehicle.vehicle_id
    );

    if (!foundAssignment) {
        throw { statusCode: 404, message: 'Assignment not found for this vehicle' };
    }

    return {
        ...foundAssignment,
        driver_identity_no: foundAssignment.driver_identity_no
            ? decrypt(foundAssignment.driver_identity_no)
            : null,
        driver_license_no: foundAssignment.driver_license_no
            ? decrypt(foundAssignment.driver_license_no)
            : null,
    };
}

export async function getVehicleLocationHistory(vehicleId, queryParams, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    if (!existingVehicle.device_id) {
        throw { statusCode: 404, message: 'This vehicle does not have a tracking device assigned' };
    }

    const { limit, offset } = getPaginationParams(queryParams);

    const startTime = queryParams.start_time || null;
    const endTime = queryParams.end_time || null;

    const { listOfPings, totalPingCount } = await locationPingRepository.findLocationPingsByVehicleId(
        existingVehicle.vehicle_id,
        { limit, offset, startTime, endTime }
    );

    return buildCollection(
        `/tuktrack/v1/vehicles/${vehicleId}/location-pings`,
        offset,
        limit,
        totalPingCount,
        listOfPings,
        startTime || endTime ? { start_time: startTime, end_time: endTime } : {},
    );
}

export async function getVehicleLastLocation(vehicleId, requestingUser) {
    if (!vehicleId) {
        throw { statusCode: 400, message: 'Vehicle ID is required' };
    }

    const existingVehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!existingVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found' };
    }

    await checkVehicleJurisdictionAccess(requestingUser, existingVehicle.district_id);

    if (!existingVehicle.device_id) {
        throw { statusCode: 404, message: 'This vehicle does not have a tracking device assigned' };
    }

    const lastKnownPing = await locationPingRepository.findLastKnownLocationByVehicleId(existingVehicle.vehicle_id);

    if (!lastKnownPing) {
        throw { statusCode: 404, message: 'No location data available for this vehicle yet' };
    }

    return {
        vehicle_id:       existingVehicle.vehicle_id,
        license_plate_no: existingVehicle.license_plate_no,
        device_id:        existingVehicle.device_id,
        last_location:    lastKnownPing,
    };
}
