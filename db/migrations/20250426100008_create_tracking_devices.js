//Create Tracking Devices Migration file

// GPS tracking devices installed in tuk-tuks.
// Created BEFORE vehicles because vehicles holds a FK to tracking_devices.
// device_serial_no is the hardware identifier printed on the physical device.
// Soft delete: device_status transitions to 'DECOMMISSIONED'.
// A device can be unassigned from a vehicle (vehicle.device_id SET NULL)
// without being decommissioned, it becomes available for reassignment.
 
export async function up(knex) {
  await knex.schema.createTable('tracking_devices', (table) => {
    table.uuid('device_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('device_serial_no', 100).notNullable().unique();
    table.string('device_token_hash', 128).nullable().unique();
    table.specificType('device_status', 'device_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('tracking_devices');
}