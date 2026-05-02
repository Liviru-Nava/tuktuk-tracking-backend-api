//Routes for handling the location ping related endpoints

import { Router } from 'express';
import * as locationPingController from '../controllers/locationPingController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';
import { authenticateDevice } from '../middleware/deviceAuthenticationMiddleware.js';

const locationPingRoutes = Router();

// POST /tuktrack/v1/location-pings
// Device-to-server — authenticated via X-Device-Token header, not a user JWT.
locationPingRoutes.post(
    '/',
    authenticateDevice,
    locationPingController.submitLocationPing,
);

export default locationPingRoutes;