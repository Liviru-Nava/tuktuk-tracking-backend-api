//Create Location Pings Migration file

// Append-only GPS ping records from tracking devices.
// No UPDATE or DELETE endpoints — pings are immutable evidence records.
// device_id FK ON DELETE RESTRICT prevents removing a device with ping history.
// NUMERIC(10,7): supports coordinates like 6.9271000 (lat) 79.8612000 (lon)
// 10 total digits, 7 decimal places — precision to ~1cm at Sri Lanka's latitude.
// speed_kmh NUMERIC(5,2): e.g. 45.50 km/h — nullable (some devices don't report speed).
// device_battery SMALLINT 0-100: battery percentage — nullable (not all devices report).
 
export async function up(knex) {
  await knex.schema.createTable('location_pings', (table) => {
    table.uuid('ping_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('device_id').notNullable().references('device_id').inTable('tracking_devices').onDelete('RESTRICT');
    table.specificType('latitude', 'NUMERIC(10,7)').notNullable();
    table.specificType('longitude', 'NUMERIC(10,7)').notNullable();
    table.timestamp('ping_timestamp', { useTz: true }).notNullable();
    table.specificType('speed_kmh', 'NUMERIC(5,2)').nullable();
    table.specificType('device_battery', 'SMALLINT').nullable();
  });
 
  // CHECK constraint for battery range only from 0 to 100
  await knex.raw(`
    ALTER TABLE location_pings
    ADD CONSTRAINT chk_device_battery_range
    CHECK (device_battery IS NULL OR (device_battery >= 0 AND device_battery <= 100))
  `);
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('location_pings');
}