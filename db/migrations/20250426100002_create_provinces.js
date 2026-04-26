//Create Province Migration file

export async function up(knex) {
  await knex.schema.createTable('provinces', (table) => {
    table.uuid('province_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('province_name', 100).notNullable();
    table.string('province_code', 10).notNullable().unique();
    table.timestamp('created_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('provinces');
}