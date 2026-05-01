//Routes for handling the location ping related endpoints

import { Router } from 'express';
import * as locationPingController from '../controllers/locationPingController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const locationPingRouter = Router();

locationPingRouter.use(authenticate);

// POST /api/v1/location-pings
locationPingRouter.post(
    '/',
    requirePermission('location:view_history'),
    locationPingController.submitLocationPing,
);

export default locationPingRouter;