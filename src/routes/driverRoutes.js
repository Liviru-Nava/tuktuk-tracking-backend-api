//Routes for handling routing for driver endpoints

import { Router } from 'express';
import * as driverController from '../controllers/driverController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const driverRouter = Router();

driverRouter.use(authenticate);

driverRouter.get(
    '/',
    requirePermission('driver:view'),
    driverController.getAllDrivers,
);

driverRouter.post(
    '/',
    requirePermission('driver:create'),
    driverController.createDriver,
);

driverRouter.get(
    '/:driverId',
    requirePermission('driver:view'),
    driverController.getDriverById,
);

driverRouter.put(
    '/:driverId',
    requirePermission('driver:edit'),
    driverController.updateDriver,
);

// soft suspend — home jurisdiction only
driverRouter.delete(
    '/:driverId',
    requirePermission('driver:delete'),
    driverController.suspendDriver,
);

// explicit status transition — ACTIVE, SUSPENDED, BLACKLISTED
driverRouter.post(
    '/:driverId/change-status',
    requirePermission('driver:change_status'),
    driverController.changeDriverStatus,
);

export default driverRouter;
