//ENUM generation migration file
export async function up(knex) {

  await knex.raw(`
    CREATE TYPE office_type AS ENUM (
      'HEADQUARTERS',
      'PROVINCIAL_HQ',
      'DISTRICT_HQ',
      'DIVISIONAL_STATION'
    )
  `);

  await knex.raw(`
    CREATE TYPE office_status AS ENUM (
      'ACTIVE',
      'CLOSED'
    )
  `);

  await knex.raw(`
    CREATE TYPE jurisdiction_type AS ENUM (
      'NATIONAL',
      'PROVINCIAL',
      'DISTRICT'
    )
  `);

  await knex.raw(`
    CREATE TYPE role_name_enum AS ENUM (
      'HQ_SUPER_ADMIN',
      'HQ_OFFICER',
      'PROVINCIAL_HEAD',
      'PROVINCIAL_OFFICER',
      'DISTRICT_HEAD',
      'DISTRICT_OFFICER',
      'STATION_HEAD',
      'STATION_OFFICER'
    )
  `);

  await knex.raw(`
    CREATE TYPE user_management_scope AS ENUM (
      'NATIONAL',
      'PROVINCIAL',
      'DISTRICT',
      'STATION',
      'NONE'
    )
  `);

  await knex.raw(`
    CREATE TYPE user_status AS ENUM (
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED'
    )
  `);

  await knex.raw(`
    CREATE TYPE owner_id_type AS ENUM (
      'NIC',
      'PASSPORT',
      'BUSINESS'
    )
  `);

  await knex.raw(`
    CREATE TYPE owner_gender AS ENUM (
      'MALE',
      'FEMALE',
      'OTHER'
    )
  `);

  await knex.raw(`
    CREATE TYPE owner_status AS ENUM (
      'ACTIVE',
      'INACTIVE',
      'FLAGGED'
    )
  `);

  await knex.raw(`
    CREATE TYPE vehicle_fuel_type AS ENUM (
      'PETROL',
      'CNG',
      'ELECTRIC'
    )
  `);

  await knex.raw(`
    CREATE TYPE vehicle_status AS ENUM (
      'ACTIVE',
      'SUSPENDED',
      'FLAGGED',
      'DEREGISTERED'
    )
  `);

  await knex.raw(`
    CREATE TYPE driver_id_type AS ENUM (
      'NIC',
      'PASSPORT'
    )
  `);

  await knex.raw(`
    CREATE TYPE driver_gender AS ENUM (
      'MALE',
      'FEMALE',
      'OTHER'
    )
  `);

  await knex.raw(`
    CREATE TYPE driver_status AS ENUM (
      'ACTIVE',
      'SUSPENDED',
      'BLACKLISTED'
    )
  `);

  await knex.raw(`
    CREATE TYPE device_status AS ENUM (
      'ACTIVE',
      'INACTIVE',
      'FAULTY',
      'DECOMMISSIONED'
    )
  `);

}

export async function down(knex) {
  await knex.raw(`DROP TYPE IF EXISTS device_status`);
  await knex.raw(`DROP TYPE IF EXISTS driver_status`);
  await knex.raw(`DROP TYPE IF EXISTS driver_gender`);
  await knex.raw(`DROP TYPE IF EXISTS driver_id_type`);
  await knex.raw(`DROP TYPE IF EXISTS vehicle_status`);
  await knex.raw(`DROP TYPE IF EXISTS vehicle_fuel_type`);
  await knex.raw(`DROP TYPE IF EXISTS owner_status`);
  await knex.raw(`DROP TYPE IF EXISTS owner_gender`);
  await knex.raw(`DROP TYPE IF EXISTS owner_id_type`);
  await knex.raw(`DROP TYPE IF EXISTS user_status`);
  await knex.raw(`DROP TYPE IF EXISTS user_management_scope`);
  await knex.raw(`DROP TYPE IF EXISTS role_name_enum`);
  await knex.raw(`DROP TYPE IF EXISTS jurisdiction_type`);
  await knex.raw(`DROP TYPE IF EXISTS office_status`);
  await knex.raw(`DROP TYPE IF EXISTS office_type`);
}