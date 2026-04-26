//Create Offices Migration file

// Represents Police HQ, Provincial HQs, District HQs, and Divisional Stations.
// jurisdiction_ref_id is polymorphic:
//   NULL          when jurisdiction_type = 'NATIONAL'
//   province_id   when jurisdiction_type = 'PROVINCIAL'
//   district_id   when jurisdiction_type = 'DISTRICT'
// Referential integrity for jurisdiction_ref_id is enforced at the service layer
// Soft delete: status transitions to 'CLOSED' — no physical row removal.
 
export async function up(knex) {
  await knex.schema.createTable('offices', (table) => {
    table.uuid('office_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('office_code', 50).notNullable().unique();
    table.string('office_name', 150).notNullable();
    table.specificType('office_type', 'office_type').notNullable();
    table.specificType('jurisdiction_type', 'jurisdiction_type').notNullable();
    table.uuid('jurisdiction_ref_id').nullable();
    table.text('office_address').nullable();
    table.string('office_contact', 20).nullable();
    table.specificType('status', 'office_status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('offices');
}