//Services for the controller resources which is created based on the WSO2 guidelines

import { v4 as uuidv4 } from 'uuid';
import db from '../config/knex.js';

// find an active vehicle that is not deregistered
async function findActiveVehicle(vehicleId) {
    return db('vehicles')
        .where({ vehicle_id: vehicleId })
        .whereNot({ status: 'DEREGISTERED' })
        .first();
}

//look up a driver that is not suspended or blacklisted
async function findActiveDriver(driverId) {
    return db('drivers')
        .where({ driver_id: driverId })
        .where('status', 'ACTIVE')
        .first();
}

// get the currently active assignment for a vehicle
async function findCurrentAssignmentForVehicle(vehicleId) {
    return db('vehicle_driver_assignments')
        .where({ vehicle_id: vehicleId, is_current_driver: true })
        .first();
}

//check if a driver is currently assigned to any vehicle
async function findCurrentAssignmentForDriver(driverId) {
    return db('vehicle_driver_assignments')
        .where({ driver_id: driverId, is_current_driver: true })
        .first();
}


// Business rules:
//   1. vehicle must exist and not be DEREGISTERED
//   2. driver must exist and be ACTIVE
//   3. vehicle must not already have an active assignment (partial unique index also enforces this)
//   4. driver must not already be assigned to another vehicle
//   5. is_driver_owner flag is optional — defaults to false
export async function assignDriver(requestBody, requestingUser) {
    const {
        vehicle_id,
        driver_id,
        is_driver_owner = false,
    } = requestBody;

    if (!vehicle_id || !driver_id) {
        throw { statusCode: 400, message: 'vehicle_id and driver_id are both required' };
    }

    // rule 1
    const targetVehicle = await findActiveVehicle(vehicle_id);
    if (!targetVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found or has been deregistered' };
    }

    // rule 2
    const targetDriver = await findActiveDriver(driver_id);
    if (!targetDriver) {
        throw { statusCode: 404, message: 'Driver not found or is not currently active' };
    }

    // rule 3 — check before insert to give a clear error message
    // the partial unique index will also block duplicates at DB level as a safety net
    const existingVehicleAssignment = await findCurrentAssignmentForVehicle(vehicle_id);
    if (existingVehicleAssignment) {
        throw {
            statusCode: 409,
            message: `Vehicle already has an active driver assignment (assignment_id: ${existingVehicleAssignment.assignment_id}). Use POST /api/v1/unassign-driver first.`,
        };
    }

    // rule 4
    const existingDriverAssignment = await findCurrentAssignmentForDriver(driver_id);
    if (existingDriverAssignment) {
        throw {
            statusCode: 409,
            message: `Driver is already assigned to another vehicle (vehicle_id: ${existingDriverAssignment.vehicle_id}). Unassign them first.`,
        };
    }

    // all checks passed — create the assignment record
    const newAssignmentRecord = {
        assignment_id:   uuidv4(),
        vehicle_id,
        driver_id,
        assigned_time:   db.fn.now(),
        unassigned_time: null,
        is_current_driver: true,
        is_driver_owner: Boolean(is_driver_owner),
    };

    const [createdAssignment] = await db('vehicle_driver_assignments')
        .insert(newAssignmentRecord)
        .returning('*');

    return createdAssignment;
}


// Closes the active assignment by setting unassigned_time and is_current_driver = false.
// The record is never deleted — it forms the audit trail.
// Business rules:
//   1. vehicle must exist
//   2. vehicle must have an active assignment to close
export async function unassignDriver(requestBody) {
    const { vehicle_id } = requestBody;

    if (!vehicle_id) {
        throw { statusCode: 400, message: 'vehicle_id is required' };
    }

    // rule 1
    const targetVehicle = await findActiveVehicle(vehicle_id);
    if (!targetVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found or has been deregistered' };
    }

    // rule 2
    const activeAssignment = await findCurrentAssignmentForVehicle(vehicle_id);
    if (!activeAssignment) {
        throw {
            statusCode: 404,
            message: `Vehicle does not have an active driver assignment to close`,
        };
    }

    // close the assignment — set the end time and flip is_current_driver to false
    const [closedAssignment] = await db('vehicle_driver_assignments')
        .where({ assignment_id: activeAssignment.assignment_id })
        .update({
            unassigned_time:   db.fn.now(),
            is_current_driver: false,
        })
        .returning('*');

    return closedAssignment;
}

// Links a tracking device to a vehicle by setting vehicles.device_id.
// Business rules:
//   1. vehicle must exist and not be DEREGISTERED
//   2. device must exist and not be DECOMMISSIONED
//   3. vehicle must not already have a device assigned (vehicles.device_id IS NULL)
//   4. device must not already be assigned to another vehicle
export async function assignDevice(requestBody) {
    const { vehicle_id, device_id } = requestBody;

    if (!vehicle_id || !device_id) {
        throw { statusCode: 400, message: 'vehicle_id and device_id are both required' };
    }

    // rule 1
    const targetVehicle = await findActiveVehicle(vehicle_id);
    if (!targetVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found or has been deregistered' };
    }

    // rule 2
    const targetDevice = await db('tracking_devices')
        .where({ device_id })
        .first();
    if (!targetDevice) {
        throw { statusCode: 404, message: 'Tracking device not found' };
    }
    if (targetDevice.device_status === 'DECOMMISSIONED') {
        throw { statusCode: 409, message: 'Cannot assign a decommissioned device to a vehicle' };
    }

    // rule 3 — vehicle already has a device
    if (targetVehicle.device_id !== null) {
        throw {
            statusCode: 409,
            message: `Vehicle already has a tracking device assigned (device_id: ${targetVehicle.device_id}). Decommission or unassign the existing device first.`,
        };
    }

    // rule 4 — device is already on another vehicle
    const vehicleAlreadyUsingThisDevice = await db('vehicles')
        .where({ device_id })
        .first();
    if (vehicleAlreadyUsingThisDevice) {
        throw {
            statusCode: 409,
            message: `Device is already assigned to another vehicle (vehicle_id: ${vehicleAlreadyUsingThisDevice.vehicle_id})`,
        };
    }

    // all clear — update the vehicle row to point to this device
    const [updatedVehicle] = await db('vehicles')
        .where({ vehicle_id })
        .update({
            device_id,
            updated_time: db.fn.now(),
        })
        .returning([
            'vehicle_id',
            'license_plate_no',
            'vehicle_reg_no',
            'status',
            'device_id',
            'district_id',
        ]);

    return updatedVehicle;
}