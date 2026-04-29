//Repo for the Roles

import db from '../config/knex.js';

export async function findAllRoles() {
  return db('roles')
    .select(
      'role_id',
      'role_name',
      'role_description',
      'user_management_scope',
      'permissions',
    )
    .orderBy('role_name', 'asc');
}

export async function findRoleById(roleId) {
  return db('roles')
    .where({ role_id: roleId })
    .select(
      'role_id',
      'role_name',
      'role_description',
      'user_management_scope',
      'permissions',
    )
    .first();
}

export async function updateRole(roleId, updates) {
  const [updated] = await db('roles')
    .where({ role_id: roleId })
    .update(updates)
    .returning([
      'role_id',
      'role_name',
      'role_description',
      'user_management_scope',
      'permissions',
    ]);
  return updated;
}