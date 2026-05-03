//Create Drivers Migration file

// Tuk-tuk drivers are separate from owners (owner may not be the driver).
// driver_identity_no is the NIC or passport number of the driver.
// driver_license_no is the official driving licence number from DMT.
// license_expiry_date is critical for operational checks and expired licence = alert.
// Soft delete: status transitions to 'SUSPENDED'.
// BLACKLISTED: driver permanently barred from operating and requires admin action.
 
export async function up(knex) {
await knex.schema.createTable('drivers', (table) => {
    table.uuid('driver_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('driver_fullname', 200).notNullable();
    table.string('driver_identity_no', 500).notNullable().unique();
    table.specificType('driver_id_type', 'driver_id_type').notNullable();
    table.date('date_of_birth').notNullable();
    table.specificType('driver_gender', 'driver_gender').notNullable();
    table.string('driver_contact_no', 500).nullable();
    table.text('address').nullable();
    table.string('driver_license_no', 500).notNullable().unique();
    table.string('driver_license_no_hmac', 64).notNullable().unique();
    table.date('license_expiry_date').notNullable();
    table.specificType('status', 'driver_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
});
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('drivers');
}