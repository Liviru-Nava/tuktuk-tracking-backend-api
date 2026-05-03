//This will be used to manage the district routes for the endpoints. 

import { Router } from 'express';
import * as districtController from '../controllers/districtController.js';
import * as officeController from '../controllers/officeController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requirePermission('district:view'));

router.get('/', districtController.getAllDistricts);
router.get('/:districtId', districtController.getDistrictById);
router.get('/:districtId/offices',
  requirePermission('office:view'),
  officeController.getOfficesByDistrict,
);

export default router;