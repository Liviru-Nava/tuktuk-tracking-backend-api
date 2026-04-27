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
  await knex('users').del();

  const PASSWORD_HASH = '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm';

  await knex('users').insert([

    // HQ_SUPER_ADMIN — HQ
    {
      user_id:       '55555555-0001-0001-0001-000000000001',
      username:      'hq.superadmin',
      fullname:      'Rohana Wickramasinghe',
      email_address: 'rohana.w@police.gov.lk',
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-HQ-0001',
      contact_no:    'D72EAJ60A4aA3vYE:bzsFIJt6GwgLROU4SAx3bg==:+2SWfvfdBajIHXis',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-HQ-0002',
      contact_no:    '1PZY0P5FvNq63ex5:PfSvOEIlJN9cLWWrNbLh4A==:kV4d9tPP73fOxzNr',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-WP-0001',
      contact_no:    'esR3L0XLerR8zsRy:2fmb7R5k+AJwgXo4lQPawA==:vIdvuRUN80P6Qdws',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-WP-0002',
      contact_no:    'pLOailuYgz78q68D:liOfs5jpUEAMox06aDUa9w==:YpiTz3uZQ26TJy1o',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-CP-0001',
      contact_no:    'd3BjMBmOAyTt3Web:AIWXXVexuHTYI8LrHEO7+w==:cpfyit2ctgd8LGtr',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-SP-0001',
      contact_no:    'I7GM3gLLqMqCX4wS:OOvAW6XR1Ja360QN8vh7AQ==:X+FoBp1+oQ44oSM9',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-COL-0001',
      contact_no:    'C+IRVUYHE4aoGh/T:YDb3zysh8FTZ3Unm7VxStQ==:6LRiltFA+r9r9MxO',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-COL-0002',
      contact_no:    'vuUE+tk2yPKa/r4U:nWacfBt1Mk792YeFS+fwrg==:wjX6v7eNbRMHrSc8',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-NEG-0001',
      contact_no:    'yCy16FZiiyDWXgQY:Es9GXylnFgay1ZcIiFXW4w==:qgA5x9GY2ms7SdyQ',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-KAN-0001',
      contact_no:    'pYeG8WDiL/c8L2zN:vbTPM+rvA2cQExA7FvrYkg==:uMHPsoRMxZ/yiVAj',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-JAF-0001',
      contact_no:    'usBeNYieuim8kDBW:QmQtq6a1gw4RC/rZrBHSgw==:QGs2b29LM4H95Iuz',
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
      password:      process.env.PASSWORD_HASH,
      badge_id:      'SLP-GAL-0001',
      contact_no:    'q39g/829ETHlMijd:dzwyPcCmE0Ck35v7Wal/sw==:Gj0KgON4EgBLfR/p',
      office_id:     '44444444-0019-0019-0019-000000000019',
      role_id:       '33333333-0008-0008-0008-000000000008',
      status:        'ACTIVE',
    },

  ]);
}
