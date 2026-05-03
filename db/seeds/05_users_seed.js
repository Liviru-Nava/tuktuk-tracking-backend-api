// db/seeds/05_users_seed.js
// 12 seeded police users covering all role types and jurisdiction levels.
//
// Password for ALL users: Liviru@123
// Hash: $2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm
//
// PDPA Compliance:
//   contact_no is encrypted at rest using AES-256-GCM.
//   The service layer decrypts this field before returning it in API responses.
//   Postman will receive the plain text value — e.g. "+94771000001"
//
// Encrypted with ENCRYPTION_KEY from .env at seed generation time.
// DO NOT manually edit the contact_no values — they are ciphertext.
// To regenerate: node scripts/encrypt_users_seed.js

export async function seed(knex) {

  const PASSWORD_HASH = '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm';

  await knex('users').insert([

    // HQ_SUPER_ADMIN — HQ
    {
      user_id:       '55555555-0001-0001-0001-000000000001',
      username:      'hq.superadmin',
      fullname:      'Rohana Wickramasinghe',
      email_address: 'rohana.w@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-HQ-0001',
      contact_no:    'xmmX4c0btq+Hf1S0:7RiDuZJYTywWEyBr9VwZZA==:PHzNQkdDRWxaWLW6',
      office_id:     '44444444-0001-0001-0001-000000000001',
      role_id:       '33333333-0001-0001-0001-000000000001',
      status:        'ACTIVE',
    },

    // HQ_OFFICER — HQ
    {
      user_id:       '55555555-0002-0002-0002-000000000002',
      username:      'hq.officer',
      fullname:      'Kumara Perera',
      email_address: 'kumara.p@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-HQ-0002',
      contact_no:    'WAv2h9/iyboJwcaU:TS03s+iCN7e1pDvi3ourOg==:u6b29A9Uo02FPYTS',
      office_id:     '44444444-0001-0001-0001-000000000001',
      role_id:       '33333333-0002-0002-0002-000000000002',
      status:        'ACTIVE',
    },

    // PROVINCIAL_HEAD — WP PHQ
    {
      user_id:       '55555555-0003-0003-0003-000000000003',
      username:      'wp.head',
      fullname:      'Nimal Jayasuriya',
      email_address: 'nimal.j@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-WP-0001',
      contact_no:    'beTqzEZNsfa0LPHB:DMjM/rcU9qODTPjKCdDmUA==:iD8Zp5BLt0BC+Bdd',
      office_id:     '44444444-0002-0002-0002-000000000002',
      role_id:       '33333333-0003-0003-0003-000000000003',
      status:        'ACTIVE',
    },

    // PROVINCIAL_OFFICER — WP PHQ
    {
      user_id:       '55555555-0004-0004-0004-000000000004',
      username:      'wp.officer',
      fullname:      'Saman Bandara',
      email_address: 'saman.b@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-WP-0002',
      contact_no:    'niWzzyM7CltVPJ0e:mVa6K3XdI6WlCGM6DSxdaQ==:nr7Za39vUScUOenW',
      office_id:     '44444444-0002-0002-0002-000000000002',
      role_id:       '33333333-0004-0004-0004-000000000004',
      status:        'ACTIVE',
    },

    // PROVINCIAL_HEAD — CP PHQ
    {
      user_id:       '55555555-0005-0005-0005-000000000005',
      username:      'cp.head',
      fullname:      'Gamini Rathnayake',
      email_address: 'gamini.r@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-CP-0001',
      contact_no:    'qw4wei2KZhlL9Hsr:OJuqElyJSxsywxRe2gPhcQ==:IPHMeYQNMt7ykjNX',
      office_id:     '44444444-0003-0003-0003-000000000003',
      role_id:       '33333333-0003-0003-0003-000000000003',
      status:        'ACTIVE',
    },

    // PROVINCIAL_OFFICER — SP PHQ
    {
      user_id:       '55555555-0006-0006-0006-000000000006',
      username:      'sp.officer',
      fullname:      'Pradeep Fernando',
      email_address: 'pradeep.f@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-SP-0001',
      contact_no:    'I7IL9PuqxhUj4k5j:TbvT9haQsBwh7C58SFqHUA==:A9uVqaWOUeZXijH/',
      office_id:     '44444444-0004-0004-0004-000000000004',
      role_id:       '33333333-0004-0004-0004-000000000004',
      status:        'ACTIVE',
    },

    // STATION_HEAD — Colombo Fort
    {
      user_id:       '55555555-0007-0007-0007-000000000007',
      username:      'col.fort.head',
      fullname:      'Asanka Silva',
      email_address: 'asanka.s@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-COL-0001',
      contact_no:    'QrHbIrrO0DEQ5NnF:pD5j57DHnmdkQMfz5s5g2Q==:yqikTNOabwMaoqsv',
      office_id:     '44444444-0011-0011-0011-000000000011',
      role_id:       '33333333-0007-0007-0007-000000000007',
      status:        'ACTIVE',
    },

    // STATION_OFFICER — Colombo Fort
    {
      user_id:       '55555555-0008-0008-0008-000000000008',
      username:      'col.fort.officer',
      fullname:      'Buddhika Rajapaksa',
      email_address: 'buddhika.r@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-COL-0002',
      contact_no:    'MgGt5eYn/O42fHn8:nYoW5iSgW4hVh9o1JEoZyQ==:cW4P2HqPbnmEd0k7',
      office_id:     '44444444-0011-0011-0011-000000000011',
      role_id:       '33333333-0008-0008-0008-000000000008',
      status:        'ACTIVE',
    },

    // STATION_HEAD — Negombo
    {
      user_id:       '55555555-0009-0009-0009-000000000009',
      username:      'negombo.head',
      fullname:      'Lasitha Mendis',
      email_address: 'lasitha.m@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-NEG-0001',
      contact_no:    'Vw2EdCUPSZaJ3pee:cR5sZn+B08v6CwTwtEJ5DA==:m/FOGA/CZ9ydt2Xs',
      office_id:     '44444444-0013-0013-0013-000000000013',
      role_id:       '33333333-0007-0007-0007-000000000007',
      status:        'ACTIVE',
    },

    // STATION_OFFICER — Kandy City
    {
      user_id:       '55555555-0010-0010-0010-000000000010',
      username:      'kandy.officer',
      fullname:      'Chaminda Dissanayake',
      email_address: 'chaminda.d@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-KAN-0001',
      contact_no:    'hN0+2nqam0XqLmt9:bNrlxh822sOWT5wumKZkpw==:cr9loMkGT2U/0cmi',
      office_id:     '44444444-0016-0016-0016-000000000016',
      role_id:       '33333333-0008-0008-0008-000000000008',
      status:        'ACTIVE',
    },

    // STATION_HEAD — Jaffna City
    {
      user_id:       '55555555-0011-0011-0011-000000000011',
      username:      'jaffna.head',
      fullname:      'Arjun Krishnaswamy',
      email_address: 'arjun.k@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-JAF-0001',
      contact_no:    'F0eLlyi0e/fZfLN4:5qy2JtGOynGbRGK2QKqEqA==:ZzbxlBv1iyGQiRxW',
      office_id:     '44444444-0022-0022-0022-000000000022',
      role_id:       '33333333-0007-0007-0007-000000000007',
      status:        'ACTIVE',
    },

    // STATION_OFFICER — Galle City
    {
      user_id:       '55555555-0012-0012-0012-000000000012',
      username:      'galle.officer',
      fullname:      'Tharaka Weerasinghe',
      email_address: 'tharaka.w@police.gov.lk',
      password:      '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm',
      badge_id:      'SLP-GAL-0001',
      contact_no:    'McHnNBW0oT8RiR+K:tzY26D3pBScU0fut2wh49Q==:EtmItPqIN2Ua5y12',
      office_id:     '44444444-0019-0019-0019-000000000019',
      role_id:       '33333333-0008-0008-0008-000000000008',
      status:        'ACTIVE',
    },

  ]).onConflict('user_id').ignore();
}
