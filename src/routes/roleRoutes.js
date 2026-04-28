//Routing managed for routes

import { Router } from 'express';
import * as roleController  from '../controllers/roleControllers.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// GET endpoints for any authenticated user with the permission
router.get('/', requirePermission('province:view'), roleController.getAllRoles);
router.get('/:roleId',requirePermission('province:view'), roleController.getRoleById);

// PUT where HQ_SUPER_ADMIN only can update
router.put('/:roleId', requirePermission('audit:view'), roleController.updateRole);

export default router;