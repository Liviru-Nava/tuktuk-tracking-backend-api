//Create Refresh Tokens Migration file

// Infrastructure table and not exposed via any API endpoint.
// Stores hashed refresh tokens issued during login.
// token_hash stores SHA-256 hash of the actual token and it is never the raw token.
// ON DELETE CASCADE: when a user is deleted, all their refresh tokens are removed.
// Hard deletes ARE permitted on this table (unlike all other tables).
// A scheduled cleanup job should purge rows where:
//   expires_at < NOW() OR revoked = TRUE

// revoked = TRUE is set immediately on logout or when a new token is issued
// (token rotation strategy — each refresh issues a new token and revokes the old one).
 
export async function up(knex) {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('token_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.boolean('revoked').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
 
export async function down(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
}