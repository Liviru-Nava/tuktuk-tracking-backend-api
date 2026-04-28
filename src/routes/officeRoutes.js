//All the routes for the office

import { Router } from 'express';
import * as officeController from '../controllers/officeControllers.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Apply authentication to all office routes
router.use(authenticate);

// GET /api/v1/offices
// List all offices — scoped by jurisdiction
router.get(
  '/',
  requirePermission('office:view'),
  officeController.getAllOffices,
);

// POST /api/v1/offices
// Create a new office
router.post(
  '/',
  requirePermission('office:create'),
  officeController.createOffice,
);

// GET /api/v1/offices/:officeId
// Get a specific office by ID
router.get(
  '/:officeId',
  requirePermission('office:view'),
  officeController.getOfficeById,
);

// PUT /api/v1/offices/:officeId
// Update an office (office_name, office_address, office_contact only)
router.put(
  '/:officeId',
  requirePermission('office:edit'),
  officeController.updateOffice,
);

// DELETE /api/v1/offices/:officeId
// Soft close — transitions status to CLOSED
router.delete(
  '/:officeId',
  requirePermission('office:delete'),
  officeController.deleteOffice,
);

// GET /api/v1/offices/:officeId/users
// List users assigned to this office
router.get(
  '/:officeId/users',
  requirePermission('user:view'),
  officeController.getOfficeUsers,
);

export default router;