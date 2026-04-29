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
    '/:userId',
    requirePermission('user:view'),
    userController.getUserById,
);

userRouter.put(
    '/:userId',
    requirePermission('user:edit'),
    userController.updateUser,
);

userRouter.delete(
    '/:userId',
    requirePermission('user:deactivate'),
    userController.deactivateUser,
);

userRouter.post(
    '/:userId/reset-password',
    requirePermission('user:edit'),
    userController.resetUserPassword,
);

export default userRouter;
