//The will be for the routes manegeement for the province endpoints

import { Router } from 'express';
import * as provinceController from '../controllers/provinceControllers.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// All province routes require authentication + province:view permission
router.use(authenticate);
router.use(requirePermission('province:view'));

router.get('/', provinceController.getAllProvinces);
router.get('/:provinceId', provinceController.getProvinceById);
router.get('/:provinceId/districts', provinceController.getDistrictsByProvince);

export default router;