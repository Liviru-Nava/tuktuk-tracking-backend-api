//Routes for the owner related endpoints

import { Router } from 'express';
import * as ownerController from '../controllers/ownerController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const ownerRouter = Router();

ownerRouter.use(authenticate);

ownerRouter.get(
    '/',
    requirePermission('owner:view'),
    ownerController.getAllOwners,
);

ownerRouter.post(
    '/',
    requirePermission('owner:create'),
    ownerController.createOwner,
);

ownerRouter.get(
    '/:ownerIdentityNo',
    requirePermission('owner:view'),
    ownerController.getOwnerById,
);

ownerRouter.put(
    '/:ownerIdentityNo',
    requirePermission('owner:edit'),
    ownerController.updateOwner,
);

ownerRouter.delete(
    '/:ownerIdentityNo',
    requirePermission('owner:delete'),
    ownerController.deactivateOwner,
);

ownerRouter.get(
    '/:ownerIdentityNo/vehicles',
    requirePermission('vehicle:view'),
    ownerController.getOwnerVehicles,
);

export default ownerRouter;
