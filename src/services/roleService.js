//Business login to deal with the roles
//Only the HQ_SUPER_ADMIN can edit the roles and permissions.

import * as roleRepo from '../repositories/roleRepository.js';

export async function getAllRoles() {
    return roleRepo.findAllRoles();
}

export async function getRoleById(roleId) {
    if (!roleId) {
        throw { statusCode: 400, message: 'Role ID is required' };
    }

    const role = await roleRepo.findRoleById(roleId);
    if (!role) {
        throw { statusCode: 404, message: 'Role not found' };
    }

    return role;
}

export async function updateRole(roleId, body, user) {

    if (!roleId) {
        throw { statusCode: 400, message: 'Role ID is required' };
    }

    // Only HQ_SUPER_ADMIN can update roles
    if (user.role !== 'HQ_SUPER_ADMIN') {
        throw { statusCode: 403, message: 'Only HQ Super Admin can modify roles' };
    }

    // Confirm role exists
    const existing = await roleRepo.findRoleById(roleId);
    if (!existing) {
        throw { statusCode: 404, message: 'Role not found' };
    }

    // Only these two fields are editable
    const fieldsAllowedUpdates = {};

    if (body.role_description !== undefined) {
        if (typeof body.role_description !== 'string') {
        throw { statusCode: 400, message: 'role_description must be a string' };
        }
        fieldsAllowedUpdates.role_description = body.role_description.trim();
    }

    if (body.permissions !== undefined) {
        if (!Array.isArray(body.permissions)) {
        throw { statusCode: 400, message: 'permissions must be an array of strings' };
        }

        // Validate each permission string against known permissions
        const validPermissions = [
        'vehicle:create', 'vehicle:view', 'vehicle:edit',
        'vehicle:delete', 'vehicle:change_status',
        'driver:create', 'driver:view', 'driver:edit',
        'driver:delete', 'driver:change_status',
        'owner:create', 'owner:view', 'owner:edit', 'owner:delete',
        'device:create', 'device:view', 'device:edit',
        'device:delete', 'device:assign_to_vehicle',
        'location:view_live', 'location:view_history',
        'assignment:create', 'assignment:view',
        'assignment:edit', 'assignment:close',
        'office:create', 'office:view', 'office:edit', 'office:delete',
        'province:view', 'district:view',
        'user:create', 'user:view', 'user:edit', 'user:deactivate',
        'audit:view',
        ];

        const invalid = body.permissions.filter(p => !validPermissions.includes(p));
        if (invalid.length > 0) {
        throw {
            statusCode: 400,
            message: `Invalid permission strings: ${invalid.join(', ')}`,
        };
        }

        fieldsAllowedUpdates.permissions = body.permissions;
    }

    if (Object.keys(fieldsAllowedUpdates).length === 0) {
        throw {
        statusCode: 400,
        message: 'No valid fields to update. Only role_description and permissions are editable.',
        };
    }

    const updated = await roleRepo.updateRole(roleId, fieldsAllowedUpdates);
    return updated;
}