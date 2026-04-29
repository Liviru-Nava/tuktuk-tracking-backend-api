// All 8 roles with their permission arrays and management scopes.
// Permissions follow the finalized permission string list from the data model.
// permissions is stored as a PostgreSQL TEXT[] array.

export async function seed(knex) {

  const allPermissions = [
    'vehicle:create', 'vehicle:view', 'vehicle:edit', 'vehicle:delete', 'vehicle:change_status',
    'driver:create', 'driver:view', 'driver:edit', 'driver:delete', 'driver:change_status',
    'owner:create', 'owner:view', 'owner:edit', 'owner:delete',
    'device:create', 'device:view', 'device:edit', 'device:delete', 'device:assign_to_vehicle',
    'location:view_live', 'location:view_history',
    'assignment:create', 'assignment:view', 'assignment:edit', 'assignment:close',
    'office:create', 'office:view', 'office:edit', 'office:delete',
    'province:view',
    'district:view',
    'user:create', 'user:view', 'user:edit', 'user:deactivate',
    'audit:view',
  ];

  const officerPermissions = [
    'vehicle:view', 'vehicle:change_status',
    'driver:view', 'driver:change_status',
    'owner:view',
    'device:view',
    'location:view_live', 'location:view_history',
    'assignment:view',
    'office:view',
    'province:view',
    'district:view',
    'user:view',
  ];

  await knex('roles').insert([
    {
      role_id: '33333333-0001-0001-0001-000000000001',
      role_name: 'HQ_SUPER_ADMIN',
      role_description: 'Police Headquarters Super Administrator. Full system access with national jurisdiction. Can manage all users, offices, roles, and configurations.',
      user_management_scope: 'NATIONAL',
      permissions: allPermissions,
    },
    {
      role_id: '33333333-0002-0002-0002-000000000002',
      role_name: 'HQ_OFFICER',
      role_description: 'Police Headquarters Officer. National jurisdiction with standard operational permissions. Cannot manage users or system configuration.',
      user_management_scope: 'NONE',
      permissions: officerPermissions,
    },
    {
      role_id: '33333333-0003-0003-0003-000000000003',
      role_name: 'PROVINCIAL_HEAD',
      role_description: 'Provincial-level commanding officer. Can manage users and offices within their assigned province.',
      user_management_scope: 'PROVINCIAL',
      permissions: [
        'vehicle:create', 'vehicle:view', 'vehicle:edit', 'vehicle:change_status',
        'driver:create', 'driver:view', 'driver:edit', 'driver:change_status',
        'owner:create', 'owner:view', 'owner:edit',
        'device:view', 'device:assign_to_vehicle',
        'location:view_live', 'location:view_history',
        'assignment:create', 'assignment:view', 'assignment:edit', 'assignment:close',
        'office:create', 'office:view', 'office:edit',
        'province:view',
        'district:view',
        'user:create', 'user:view', 'user:edit', 'user:deactivate',
        'audit:view',
      ],
    },
    {
      role_id: '33333333-0004-0004-0004-000000000004',
      role_name: 'PROVINCIAL_OFFICER',
      role_description: 'Provincial-level officer. Scoped to their assigned province with standard operational permissions.',
      user_management_scope: 'NONE',
      permissions: officerPermissions,
    },
    {
      role_id: '33333333-0005-0005-0005-000000000005',
      role_name: 'DISTRICT_HEAD',
      role_description: 'District-level commanding officer. Can manage users and offices within their assigned district.',
      user_management_scope: 'DISTRICT',
      permissions: [
        'vehicle:create', 'vehicle:view', 'vehicle:edit', 'vehicle:change_status',
        'driver:create', 'driver:view', 'driver:edit', 'driver:change_status',
        'owner:create', 'owner:view', 'owner:edit',
        'device:view', 'device:assign_to_vehicle',
        'location:view_live', 'location:view_history',
        'assignment:create', 'assignment:view', 'assignment:edit', 'assignment:close',
        'office:view', 'office:edit',
        'province:view',
        'district:view',
        'user:create', 'user:view', 'user:edit', 'user:deactivate',
        'audit:view',
      ],
    },
    {
      role_id: '33333333-0006-0006-0006-000000000006',
      role_name: 'DISTRICT_OFFICER',
      role_description: 'District-level officer. Scoped to their assigned district with standard operational permissions.',
      user_management_scope: 'NONE',
      permissions: officerPermissions,
    },
    {
      role_id: '33333333-0007-0007-0007-000000000007',
      role_name: 'STATION_HEAD',
      role_description: 'Divisional station commanding officer. Can manage users within their assigned station.',
      user_management_scope: 'STATION',
      permissions: [
        'vehicle:create', 'vehicle:view', 'vehicle:edit', 'vehicle:change_status',
        'driver:create', 'driver:view', 'driver:edit', 'driver:change_status',
        'owner:create', 'owner:view', 'owner:edit',
        'device:view',
        'location:view_live', 'location:view_history',
        'assignment:create', 'assignment:view', 'assignment:edit', 'assignment:close',
        'office:view',
        'province:view',
        'district:view',
        'user:create', 'user:view', 'user:edit', 'user:deactivate',
      ],
    },
    {
      role_id: '33333333-0008-0008-0008-000000000008',
      role_name: 'STATION_OFFICER',
      role_description: 'Divisional station officer. Scoped to their assigned station with standard operational permissions.',
      user_management_scope: 'NONE',
      permissions: officerPermissions,
    },
  ]).onConflict('role_id').ignore();
}