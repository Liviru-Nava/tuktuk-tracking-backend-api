//Create District Migration File

// Immutable reference table. Seeded once. No UPDATE or DELETE endpoints.
// Each district belongs to exactly one province.
// ON DELETE RESTRICT prevents orphaned districts if a province is ever removed.
 
export async function up(knex) {
  await knex.schema.createTable('districts', (table) => {
    table.uuid('district_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('province_id').notNullable().references('province_id').inTable('provinces').onDelete('RESTRICT');
    table.string('district_name', 100).notNullable();
    table.string('district_code', 10).notNullable().unique();
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('districts');
}