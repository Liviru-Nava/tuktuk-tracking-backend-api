//Routes for handling routing for vehicle endpoints

import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
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
    '/:vehicleId',
    requirePermission('vehicle:view'),
    vehicleController.getVehicleById,
);

vehicleRouter.put(
    '/:vehicleId',
    requirePermission('vehicle:edit'),
    vehicleController.updateVehicle,
);

vehicleRouter.delete(
    '/:vehicleId',
    requirePermission('vehicle:delete'),
    vehicleController.deregisterVehicle,
);

// composite endpoint — returns vehicle + owner + current driver + device in one call
vehicleRouter.get(
    '/:vehicleId/profile',
    requirePermission('vehicle:view'),
    vehicleController.getVehicleFullProfile,
);

// driver assignment history for this vehicle
vehicleRouter.get(
    '/:vehicleId/drivers',
    requirePermission('assignment:view'),
    vehicleController.getVehicleDriverHistory,
);

// specific single assignment record
vehicleRouter.get(
    '/:vehicleId/assignments/:assignmentId',
    requirePermission('assignment:view'),
    vehicleController.getSpecificAssignment,
);

// historical movement log — core brief deliverable
vehicleRouter.get(
    '/:vehicleId/location-pings',
    requirePermission('location:view_history'),
    vehicleController.getVehicleLocationHistory,
);

// live view — most recent ping — core brief deliverable
vehicleRouter.get(
    '/:vehicleId/last-location',
    requirePermission('location:view_live'),
    vehicleController.getVehicleLastLocation,
);

// status change controller — ACTIVE, SUSPENDED, FLAGGED
vehicleRouter.post(
    '/:vehicleId/change-status',
    requirePermission('vehicle:change_status'),
    vehicleController.changeVehicleStatus,
);

export default vehicleRouter;
