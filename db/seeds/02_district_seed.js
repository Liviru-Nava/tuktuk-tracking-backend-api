// All 25 districts of Sri Lanka mapped to their correct provinces.

export async function seed(knex) {
  await knex('districts').del();

  await knex('districts').insert([
    // Western Province (WP)
    { district_id: '22222222-0001-0001-0001-000000000001', province_id: '11111111-0001-0001-0001-000000000001', district_name: 'Colombo', district_code: 'COL' },
    { district_id: '22222222-0002-0002-0002-000000000002', province_id: '11111111-0001-0001-0001-000000000001', district_name: 'Gampaha', district_code: 'GAM' },
    { district_id: '22222222-0003-0003-0003-000000000003', province_id: '11111111-0001-0001-0001-000000000001', district_name: 'Kalutara', district_code: 'KAL' },

    // Central Province (CP)
    { district_id: '22222222-0004-0004-0004-000000000004', province_id: '11111111-0002-0002-0002-000000000002', district_name: 'Kandy', district_code: 'KAN' },
    { district_id: '22222222-0005-0005-0005-000000000005', province_id: '11111111-0002-0002-0002-000000000002', district_name: 'Matale', district_code: 'MAT' },
    { district_id: '22222222-0006-0006-0006-000000000006', province_id: '11111111-0002-0002-0002-000000000002', district_name: 'Nuwara Eliya', district_code: 'NUW' },

    // Southern Province (SP)
    { district_id: '22222222-0007-0007-0007-000000000007', province_id: '11111111-0003-0003-0003-000000000003', district_name: 'Galle', district_code: 'GAL' },
    { district_id: '22222222-0008-0008-0008-000000000008', province_id: '11111111-0003-0003-0003-000000000003', district_name: 'Matara', district_code: 'MTR' },
    { district_id: '22222222-0009-0009-0009-000000000009', province_id: '11111111-0003-0003-0003-000000000003', district_name: 'Hambantota', district_code: 'HAM' },

    // Northern Province (NP)
    { district_id: '22222222-0010-0010-0010-000000000010', province_id: '11111111-0004-0004-0004-000000000004', district_name: 'Jaffna', district_code: 'JAF' },
    { district_id: '22222222-0011-0011-0011-000000000011', province_id: '11111111-0004-0004-0004-000000000004', district_name: 'Kilinochchi', district_code: 'KIL' },
    { district_id: '22222222-0012-0012-0012-000000000012', province_id: '11111111-0004-0004-0004-000000000004', district_name: 'Mannar', district_code: 'MAN' },
    { district_id: '22222222-0013-0013-0013-000000000013', province_id: '11111111-0004-0004-0004-000000000004', district_name: 'Vavuniya', district_code: 'VAV' },
    { district_id: '22222222-0014-0014-0014-000000000014', province_id: '11111111-0004-0004-0004-000000000004', district_name: 'Mullaitivu', district_code: 'MUL' },

    // Eastern Province (EP)
    { district_id: '22222222-0015-0015-0015-000000000015', province_id: '11111111-0005-0005-0005-000000000005', district_name: 'Batticaloa', district_code: 'BAT' },
    { district_id: '22222222-0016-0016-0016-000000000016', province_id: '11111111-0005-0005-0005-000000000005', district_name: 'Ampara', district_code: 'AMP' },
    { district_id: '22222222-0017-0017-0017-000000000017', province_id: '11111111-0005-0005-0005-000000000005', district_name: 'Trincomalee', district_code: 'TRI' },

    // North Western Province (NWP)
    { district_id: '22222222-0018-0018-0018-000000000018', province_id: '11111111-0006-0006-0006-000000000006', district_name: 'Kurunegala', district_code: 'KUR' },
    { district_id: '22222222-0019-0019-0019-000000000019', province_id: '11111111-0006-0006-0006-000000000006', district_name: 'Puttalam', district_code: 'PUT' },

    // North Central Province (NCP)
    { district_id: '22222222-0020-0020-0020-000000000020', province_id: '11111111-0007-0007-0007-000000000007', district_name: 'Anuradhapura', district_code: 'ANU' },
    { district_id: '22222222-0021-0021-0021-000000000021', province_id: '11111111-0007-0007-0007-000000000007', district_name: 'Polonnaruwa', district_code: 'POL' },

    // Uva Province (UP)
    { district_id: '22222222-0022-0022-0022-000000000022', province_id: '11111111-0008-0008-0008-000000000008', district_name: 'Badulla', district_code: 'BAD' },
    { district_id: '22222222-0023-0023-0023-000000000023', province_id: '11111111-0008-0008-0008-000000000008', district_name: 'Monaragala', district_code: 'MON' },

    // Sabaragamuwa Province (SGP)
    { district_id: '22222222-0024-0024-0024-000000000024', province_id: '11111111-0009-0009-0009-000000000009', district_name: 'Ratnapura', district_code: 'RAT' },
    { district_id: '22222222-0025-0025-0025-000000000025', province_id: '11111111-0009-0009-0009-000000000009', district_name: 'Kegalle', district_code: 'KEG' },
  ]);
}