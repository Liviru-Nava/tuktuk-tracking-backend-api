//User controller for handling user related requests

import * as userService from '../services/userService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

export async function getAllUsers(request, response) {
    try {
        const collectionOfUsers = await userService.getAllUsers(request.query, request.user);
        return sendCollection(response, 200, 'Users retrieved successfully', collectionOfUsers);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] getAllUsers error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function getUserById(request, response) {
    try {
        const foundUser = await userService.getUserById(request.params.userId, request.user);
        return sendSuccess(response, 200, 'User retrieved successfully', foundUser);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] getUserById error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function createUser(request, response) {
    try {
        const newlyCreatedUser = await userService.createUser(request.body, request.user);
        return sendSuccess(response, 201, 'User created successfully', newlyCreatedUser);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] createUser error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function updateUser(request, response) {
    try {
        const updatedUser = await userService.updateUser(
            request.params.userId,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'User updated successfully', updatedUser);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] updateUser error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function deactivateUser(request, response) {
    try {
        const deactivatedUser = await userService.deactivateUser(
            request.params.userId,
            request.user,
        );
        return sendSuccess(response, 200, 'User deactivated successfully', deactivatedUser);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] deactivateUser error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}

export async function resetUserPassword(request, response) {
    try {
        const resetResult = await userService.resetUserPassword(
            request.params.userId,
            request.body,
            request.user,
        );
        return sendSuccess(response, 200, 'Password reset successfully', resetResult);
    } catch (error) {
        if (error.statusCode) return sendError(response, error.statusCode, error.message);
        console.error('[USER] resetUserPassword error:', error);
        return sendError(response, 500, 'Internal server error');
    }
}
