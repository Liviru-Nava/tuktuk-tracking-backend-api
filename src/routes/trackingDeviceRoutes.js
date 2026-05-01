//Tracking device routes to define the endpoints

import { Router } from 'express';
import * as trackingDeviceController from '../controllers/trackingDeviceController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const trackingDeviceRouter = Router();

trackingDeviceRouter.use(authenticate);

trackingDeviceRouter.get(
    '/',
    requirePermission('device:view'),
    trackingDeviceController.getAllDevices,
);

trackingDeviceRouter.post(
    '/',
    requirePermission('device:create'),
    trackingDeviceController.createDevice,
);

trackingDeviceRouter.get(
    '/:deviceId',
    requirePermission('device:view'),
    trackingDeviceController.getDeviceById,
);

trackingDeviceRouter.put(
    '/:deviceId',
    requirePermission('device:edit'),
    trackingDeviceController.updateDevice,
);

// soft decommission
trackingDeviceRouter.delete(
    '/:deviceId',
    requirePermission('device:delete'),
    trackingDeviceController.decommissionDevice,
);

// composite endpoint — device details + latest ping health check
trackingDeviceRouter.get(
    '/:deviceId/status',
    requirePermission('device:view'),
    trackingDeviceController.getDeviceStatusComposite,
);

// full ping history for this device with optional time window
trackingDeviceRouter.get(
    '/:deviceId/location-pings',
    requirePermission('location:view_history'),
    trackingDeviceController.getDeviceLocationPings,
);

// explicit status transitions — ACTIVE, INACTIVE, FAULTY, DECOMMISSIONED
trackingDeviceRouter.post(
    '/:deviceId/change-status',
    requirePermission('device:assign_to_vehicle'),
    trackingDeviceController.changeDeviceStatus,
);

export default trackingDeviceRouter;
