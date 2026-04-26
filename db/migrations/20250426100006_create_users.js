//Create Users Migration file

// System users: police officers at all levels.
// password stores bcrypt hash — never plain text.
// badge_id is the physical police badge number — unique nationally.
// office_id links to the user's assigned office (determines jurisdiction).
// role_id links to the user's role (determines permissions).
// Soft delete: status transitions to 'INACTIVE', no physical row removal.
// last_login_time is updated on each successful authentication.
 
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 100).notNullable().unique();
    table.string('fullname', 200).notNullable();
    table.string('email_address', 150).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('badge_id', 50).notNullable().unique();
    table.string('contact_no', 500).nullable();
    table.uuid('office_id').notNullable().references('office_id').inTable('offices').onDelete('RESTRICT');
    table.uuid('role_id').notNullable().references('role_id').inTable('roles').onDelete('RESTRICT');
    table.specificType('status', 'user_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('last_login_time', { useTz: true }).nullable();
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}