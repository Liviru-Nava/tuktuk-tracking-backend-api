// All 9 provinces of Sri Lanka — immutable reference data.
// province_code follows the official Sri Lanka administrative codes.

export async function seed(knex) {
  await knex('provinces').insert([
    {
      province_id: '11111111-0001-0001-0001-000000000001',
      province_name: 'Western Province',
      province_code: 'WP',
    },
    {
      province_id: '11111111-0002-0002-0002-000000000002',
      province_name: 'Central Province',
      province_code: 'CP',
    },
    {
      province_id: '11111111-0003-0003-0003-000000000003',
      province_name: 'Southern Province',
      province_code: 'SP',
    },
    {
      province_id: '11111111-0004-0004-0004-000000000004',
      province_name: 'Northern Province',
      province_code: 'NP',
    },
    {
      province_id: '11111111-0005-0005-0005-000000000005',
      province_name: 'Eastern Province',
      province_code: 'EP',
    },
    {
      province_id: '11111111-0006-0006-0006-000000000006',
      province_name: 'North Western Province',
      province_code: 'NWP',
    },
    {
      province_id: '11111111-0007-0007-0007-000000000007',
      province_name: 'North Central Province',
      province_code: 'NCP',
    },
    {
      province_id: '11111111-0008-0008-0008-000000000008',
      province_name: 'Uva Province',
      province_code: 'UP',
    },
    {
      province_id: '11111111-0009-0009-0009-000000000009',
      province_name: 'Sabaragamuwa Province',
      province_code: 'SGP',
    },
  ]).onConflict('province_id').ignore();
}