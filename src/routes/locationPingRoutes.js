//Routes for handling the location ping related endpoints

import { Router } from 'express';
import * as locationPingController from '../controllers/locationPingController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const locationPingRoutes = Router();

locationPingRoutes.use(authenticate);

// POST /api/v1/location-pings
locationPingRoutes.post(
    '/',
    requirePermission('location:view_history'),
    locationPingController.submitLocationPing,
);

export default locationPingRoutes;