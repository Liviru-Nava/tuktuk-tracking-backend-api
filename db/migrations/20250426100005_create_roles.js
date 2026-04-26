//Create Roles Migration file

// Roles are deployment-time concerns, no POST or DELETE endpoints.
// Only role_description and permissions are editable via API (HQ_SUPER_ADMIN only).
// role_name uses the role_name_enum type defined in migration 1.
 
export async function up(knex) {
  await knex.schema.createTable('roles', (table) => {
    table.uuid('role_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.specificType('role_name', 'role_name_enum').notNullable().unique();
    table.text('role_description').nullable();
    table.specificType('user_management_scope', 'user_management_scope').notNullable();
    table.specificType('permissions', 'TEXT[]').notNullable().defaultTo('{}'); //TEXT[] for array permissions
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('roles');
}