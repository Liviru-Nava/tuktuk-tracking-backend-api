//Routes for handling routing for vehicle endpoints

import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
import * as assignmentController from '../controllers/assignmentController.js';
import * as locationPingController from '../controllers/locationPingController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const vehicleRouter = Router();

vehicleRouter.use(authenticate);

vehicleRouter.get(
    '/',
    requirePermission('vehicle:view'),
    vehicleController.getAllVehicles,
);

vehicleRouter.post(
    '/',
    requirePermission('vehicle:create'),
    vehicleController.createVehicle,
);

vehicleRouter.get(
    '/:licensePlateNo',
    requirePermission('vehicle:view'),
    vehicleController.getVehicleById,
);

vehicleRouter.put(
    '/:licensePlateNo',
    requirePermission('vehicle:edit'),
    vehicleController.updateVehicle,
);

vehicleRouter.delete(
    '/:licensePlateNo',
    requirePermission('vehicle:delete'),
    vehicleController.deregisterVehicle,
);

// composite endpoint — returns vehicle + owner + current driver + device in one call
vehicleRouter.get(
    '/:licensePlateNo/profile',
    requirePermission('vehicle:view'),
    vehicleController.getVehicleFullProfile,
);

// driver assignment history for this vehicle
vehicleRouter.get(
    '/:licensePlateNo/drivers',
    requirePermission('assignment:view'),
    assignmentController.getVehicleDriverHistory,
);

// specific single assignment record
vehicleRouter.get(
    '/:licensePlateNo/assignments/:assignmentId',
    requirePermission('assignment:view'),
    assignmentController.getSpecificAssignment,
);

// historical movement log — core brief deliverable
vehicleRouter.get(
    '/:licensePlateNo/location-pings',
    requirePermission('location:view_history'),
    locationPingController.getVehicleLocationHistory,
);

// live view — most recent ping — core brief deliverable
vehicleRouter.get(
    '/:licensePlateNo/last-location',
    requirePermission('location:view_live'),
    locationPingController.getVehicleLastLocation,
);

// status change controller — ACTIVE, SUSPENDED, FLAGGED
vehicleRouter.post(
    '/:licensePlateNo/change-status',
    requirePermission('vehicle:change_status'),
    vehicleController.changeVehicleStatus,
);

export default vehicleRouter;
