//Define user endpoint routes for sending requests

import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get(
    '/',
    requirePermission('user:view'),
    userController.getAllUsers,
);

userRouter.post(
    '/',
    requirePermission('user:create'),
    userController.createUser,
);

userRouter.get(
    '/:badgeId',
    requirePermission('user:view'),
    userController.getUserById,
);

userRouter.put(
    '/:badgeId',
    requirePermission('user:edit'),
    userController.updateUser,
);

userRouter.delete(
    '/:badgeId',
    requirePermission('user:deactivate'),
    userController.deactivateUser,
);

userRouter.post(
    '/:badgeId/reset-password',
    requirePermission('user:edit'),
    userController.resetUserPassword,
);

export default userRouter;
