//Create vehicle driver assignments migration file

// Junction table tracking which driver is assigned to which vehicle over time.
// This is a temporal assignment table — it stores the full history.
// ACTIVE assignment:    unassigned_time IS NULL AND is_current_driver = TRUE
// CLOSED assignment:    unassigned_time IS NOT NULL AND is_current_driver = FALSE
// The assign-driver controller must:
//   1. Close any existing active assignment for the vehicle (set unassigned_time, is_current_driver=false)
//   2. Create a new assignment row atomically in a single transaction
// PARTIAL UNIQUE INDEX below enforces: only ONE active assignment per vehicle at a time.
// is_driver_owner = TRUE means the driver and the registered owner are the same person.
// No DELETE endpoint — assignments are closed via /unassign-driver controller only.
// ON DELETE RESTRICT on both FKs prevents removing a vehicle or driver with open assignments.
 
export async function up(knex) {
  await knex.schema.createTable('vehicle_driver_assignments', (table) => {
    table.uuid('assignment_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vehicle_id').notNullable().references('vehicle_id').inTable('vehicles').onDelete('RESTRICT');
    table.uuid('driver_id').notNullable().references('driver_id').inTable('drivers').onDelete('RESTRICT');
    table.timestamp('assigned_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('unassigned_time', { useTz: true }).nullable();
    table.boolean('is_current_driver').notNullable().defaultTo(true);
    table.boolean('is_driver_owner').notNullable().defaultTo(false);
  });

  await knex.raw(`
    CREATE UNIQUE INDEX idx_vehicle_driver_assignments_one_active
    ON vehicle_driver_assignments (vehicle_id)
    WHERE is_current_driver = TRUE
  `);
}
 
export async function down(knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_vehicle_driver_assignments_one_active
  `);
  await knex.schema.dropTableIfExists('vehicle_driver_assignments');
}