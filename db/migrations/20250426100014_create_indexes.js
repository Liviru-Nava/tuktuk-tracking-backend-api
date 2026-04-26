//Creatr Indexing Migration file

// All indexes in one migration — created after all tables exist.
// Separating indexes from table creation makes rollback cleaner
// and makes the indexing strategy easy to review in one place.

// INDEX NAMING CONVENTION:
//   idx_{table}_{column(s)}
//   idx_{table}_{column}_brin  (for BRIN indexes)
//
// CATEGORIES:
//   1. Foreign key indexes — PostgreSQL does NOT auto-index FKs
//   2. Query performance indexes — high-frequency lookup patterns
//   3. BRIN index — location_pings time-series (append-only, ordered by time)

export async function up(knex) {
  await knex.raw(`

    -- districts.province_id
    CREATE INDEX idx_districts_province_id
      ON districts (province_id);

    -- offices.jurisdiction_ref_id (polymorphic — indexed for filtering)
    CREATE INDEX idx_offices_jurisdiction_ref_id
      ON offices (jurisdiction_ref_id)
      WHERE jurisdiction_ref_id IS NOT NULL;

    -- users.office_id
    CREATE INDEX idx_users_office_id
      ON users (office_id);

    -- users.role_id
    CREATE INDEX idx_users_role_id
      ON users (role_id);

    -- vehicles.owner_id
    CREATE INDEX idx_vehicles_owner_id
      ON vehicles (owner_id);

    -- vehicles.district_id
    CREATE INDEX idx_vehicles_district_id
      ON vehicles (district_id);

    -- vehicles.device_id (nullable FK — filtered index excludes NULLs)
    CREATE INDEX idx_vehicles_device_id
      ON vehicles (device_id)
      WHERE device_id IS NOT NULL;

    -- vehicle_driver_assignments.vehicle_id
    CREATE INDEX idx_vda_vehicle_id
      ON vehicle_driver_assignments (vehicle_id);

    -- vehicle_driver_assignments.driver_id
    CREATE INDEX idx_vda_driver_id
      ON vehicle_driver_assignments (driver_id);

    -- location_pings.device_id (included in composite below — standalone not needed)

    -- refresh_tokens.user_id
    CREATE INDEX idx_refresh_tokens_user_id
      ON refresh_tokens (user_id);






    -- GET /vehicles?status=...  (filter by status — common operational query)
    CREATE INDEX idx_vehicles_status
      ON vehicles (status);

    -- GET /drivers?status=...
    CREATE INDEX idx_drivers_status
      ON drivers (status);

    -- GET /owners?status=...
    CREATE INDEX idx_owners_status
      ON owners (status);

    -- GET /offices?status=...
    CREATE INDEX idx_offices_status
      ON offices (status);

    -- GET /users?status=...
    CREATE INDEX idx_users_status
      ON users (status);

    -- GET /tracking-devices?device_status=...
    CREATE INDEX idx_tracking_devices_status
      ON tracking_devices (device_status);

    -- Vehicle lookup by license plate
    CREATE INDEX idx_vehicles_license_plate_no
      ON vehicles (license_plate_no);

    -- Vehicle lookup by registration number
    CREATE INDEX idx_vehicles_vehicle_reg_no
      ON vehicles (vehicle_reg_no);

    -- Driver lookup by identity number (police investigative query)
    CREATE INDEX idx_drivers_identity_no
      ON drivers (driver_identity_no);

    -- Owner lookup by identity number
    CREATE INDEX idx_owners_identity_no
      ON owners (owner_identity_no);

    -- User login lookup by username
    CREATE INDEX idx_users_username
      ON users (username);

    -- User login lookup by email
    CREATE INDEX idx_users_email_address
      ON users (email_address);

    -- Refresh token lookup by hash (called on every /auth/refresh request)
    CREATE INDEX idx_refresh_tokens_token_hash
      ON refresh_tokens (token_hash);

    -- Expired/revoked token cleanup job
    CREATE INDEX idx_refresh_tokens_expires_revoked
      ON refresh_tokens (expires_at, revoked);



    -- PRIMARY QUERY PATTERN:
    -- GET /tracking-devices/{id}/location-pings
    -- GET /vehicles/{id}/location-pings
    -- GET /vehicles/{id}/last-location
    -- Composite index: device_id first (equality), ping_timestamp DESC (range/sort)
    -- This single index serves all three endpoints above.
    CREATE INDEX idx_location_pings_device_time
      ON location_pings (device_id, ping_timestamp DESC);

    -- TIME-WINDOW QUERIES ACROSS ALL DEVICES:
    -- Province/district level operational queries — filter by time range
    -- BRIN (Block Range INdex): ideal for append-only data ordered by time.
    -- 100-1000x smaller than B-Tree with similar selectivity for time-range scans.

    CREATE INDEX idx_location_pings_timestamp_brin
      ON location_pings USING BRIN (ping_timestamp);



    CREATE INDEX idx_offices_jurisdiction_type
      ON offices (jurisdiction_type);

  `);
}

export async function down(knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_districts_province_id;
    DROP INDEX IF EXISTS idx_offices_jurisdiction_ref_id;
    DROP INDEX IF EXISTS idx_users_office_id;
    DROP INDEX IF EXISTS idx_users_role_id;
    DROP INDEX IF EXISTS idx_vehicles_owner_id;
    DROP INDEX IF EXISTS idx_vehicles_district_id;
    DROP INDEX IF EXISTS idx_vehicles_device_id;
    DROP INDEX IF EXISTS idx_vda_vehicle_id;
    DROP INDEX IF EXISTS idx_vda_driver_id;
    DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
    DROP INDEX IF EXISTS idx_vehicles_status;
    DROP INDEX IF EXISTS idx_drivers_status;
    DROP INDEX IF EXISTS idx_owners_status;
    DROP INDEX IF EXISTS idx_offices_status;
    DROP INDEX IF EXISTS idx_users_status;
    DROP INDEX IF EXISTS idx_tracking_devices_status;
    DROP INDEX IF EXISTS idx_vehicles_license_plate_no;
    DROP INDEX IF EXISTS idx_vehicles_vehicle_reg_no;
    DROP INDEX IF EXISTS idx_drivers_identity_no;
    DROP INDEX IF EXISTS idx_owners_identity_no;
    DROP INDEX IF EXISTS idx_users_username;
    DROP INDEX IF EXISTS idx_users_email_address;
    DROP INDEX IF EXISTS idx_refresh_tokens_token_hash;
    DROP INDEX IF EXISTS idx_refresh_tokens_expires_revoked;
    DROP INDEX IF EXISTS idx_location_pings_device_time;
    DROP INDEX IF EXISTS idx_location_pings_timestamp_brin;
    DROP INDEX IF EXISTS idx_offices_jurisdiction_type;
  `);
}