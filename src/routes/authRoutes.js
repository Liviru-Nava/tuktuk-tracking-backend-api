// src/routes/auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/authControllers.js';
import { authenticate }    from '../middleware/authMiddleware.js';
import { validateLogin, validateRefresh } from '../middleware/validateMiddleware.js';

const router = Router();

router.post('/login',   validateLogin,   authController.login);
router.post('/refresh', validateRefresh, authController.refresh);
router.post('/logout',  authenticate,    authController.logout);

export default router;