//Create Vehicles Migration file

// owner_id: the registered owner — ON DELETE RESTRICT prevents orphaned vehicles.
// district_id: the district where the vehicle is registered.
// device_id: nullable FK to tracking_devices — SET NULL when device is unassigned.
// This allows unassign-device without losing the vehicle record.
// is_diplomatic: flags vehicles with diplomatic immunity (special handling).
// Soft delete: status transitions to 'DEREGISTERED'.
// FLAGGED status is set when vehicle is under investigation.
 
export async function up(knex) {
  await knex.schema.createTable('vehicles', (table) => {
    table.uuid('vehicle_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('owner_id').notNullable().references('owner_id').inTable('owners').onDelete('RESTRICT');
    table.uuid('district_id').notNullable().references('district_id').inTable('districts').onDelete('RESTRICT');
    table.uuid('device_id').nullable().references('device_id').inTable('tracking_devices').onDelete('SET NULL');
    table.string('license_plate_no', 20).notNullable().unique();
    table.string('vehicle_reg_no', 20).notNullable().unique();
    table.string('chassis_number', 50).notNullable().unique();
    table.string('engine_number', 50).notNullable().unique();
    table.string('make_of_vehicle', 100).notNullable();
    table.string('model_of_vehicle', 100).notNullable();
    table.specificType('manufacture_year', 'SMALLINT').notNullable();
    table.string('vehicle_colour', 50).nullable();
    table.specificType('fuel_type', 'vehicle_fuel_type').notNullable();
    table.boolean('is_diplomatic').notNullable().defaultTo(false);
    table.date('vehicle_reg_date').notNullable();
    table.specificType('status', 'vehicle_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('vehicles');
}