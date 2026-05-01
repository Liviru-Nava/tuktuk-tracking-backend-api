// Routes for the controller resources

import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const assignmentRouter = Router();

assignmentRouter.use(authenticate);

// POST /api/v1/assignments/assign-driver
assignmentRouter.post(
    '/assign-driver',
    requirePermission('assignment:create'),
    assignmentController.assignDriver,
);

// POST /api/v1/assignments/unassign-driver
assignmentRouter.post(
    '/unassign-driver',
    requirePermission('assignment:close'),
    assignmentController.unassignDriver,
);

// POST /api/v1/assignments/assign-device
assignmentRouter.post(
    '/assign-device',
    requirePermission('device:assign_to_vehicle'),
    assignmentController.assignDevice,
);

export default assignmentRouter;