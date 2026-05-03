//Create Owners Migration file

// Vehicle owners can be individuals or businesses registered with the RMV/DMT.
// owner_identity_no is the NIC, passport number, or business registration number.
// owner_id_type tells which identity document was used.
// Soft delete: status transitions to 'INACTIVE' and no physical row removal.
// FLAGGED status is set by police when owner is under investigation.
 
export async function up(knex) {
  await knex.schema.createTable('owners', (table) => {
    table.uuid('owner_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('owner_fullname', 200).notNullable();
    table.string('owner_identity_no', 500).notNullable().unique();
    table.string('owner_identity_no_hmac', 64).notNullable().unique();
    table.specificType('owner_id_type', 'owner_id_type').notNullable();
    table.specificType('owner_gender', 'owner_gender').notNullable();
    table.string('owner_contact', 500).nullable();
    table.text('owner_address').nullable();
    table.specificType('status', 'owner_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('owners');
}