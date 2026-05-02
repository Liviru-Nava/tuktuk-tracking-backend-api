//Controller for the roles

import * as roleService from '../services/roleService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';
import { buildCollection } from '../utils/paginationUtils.js';

export async function getAllRoles(req, res) {

    try {
        const roles = await roleService.getAllRoles();
        const collection = buildCollection(
        '/tuktrack/v1/roles',
        0,
        roles.length,
        roles.length,
        roles,
        );

        return sendCollection(res, 200, 'Roles retrieved successfully', collection);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[ROLE] getAllRoles error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

export async function getRoleById(req, res) {
    try {
        const role = await roleService.getRoleById(req.params.roleId);
        return sendSuccess(res, 200, 'Role retrieved successfully', role);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[ROLE] getRoleById error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

export async function updateRole(req, res) {
    try {
        const updated = await roleService.updateRole(
        req.params.roleId,
        req.body,
        req.user,
        );
        return sendSuccess(res, 200, 'Role updated successfully', updated);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[ROLE] updateRole error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}