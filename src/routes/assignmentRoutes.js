// Routes for the controller resources

import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const assignmentRoutes = Router();

assignmentRoutes.use(authenticate);

// POST /tuktrack/v1/assign-driver
assignmentRoutes.post(
    '/assign-driver',
    requirePermission('assignment:create'),
    assignmentController.assignDriver,
);

// POST /tuktrack/v1/assignments/unassign-driver
assignmentRoutes.post(
    '/unassign-driver',
    requirePermission('assignment:close'),
    assignmentController.unassignDriver,
);

// POST /tuktrack/v1/assignments/assign-device
assignmentRoutes.post(
    '/assign-device',
    requirePermission('device:assign_to_vehicle'),
    assignmentController.assignDevice,
);

export default assignmentRoutes;