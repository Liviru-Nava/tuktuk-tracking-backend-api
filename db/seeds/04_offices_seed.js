// 1 National HQ + 9 Provincial HQs + 27 Divisional Stations
// Every one of the 25 districts has at least one station.
// Colombo and Gampaha have two stations each (high-density districts).
// jurisdiction_ref_id:
//   NULL          for NATIONAL jurisdiction
//   province_id   for PROVINCIAL jurisdiction
//   district_id   for DISTRICT jurisdiction

export async function seed(knex) {
  await knex('offices').del();

  await knex('offices').insert([

    // ── NATIONAL HEADQUARTERS ─────────────────────────────────────────────
    {
      office_id:            '44444444-0001-0001-0001-000000000001',
      office_code:          'SLP-HQ',
      office_name:          'Sri Lanka Police Headquarters',
      office_type:          'HEADQUARTERS',
      jurisdiction_type:    'NATIONAL',
      jurisdiction_ref_id:  null,
      office_address:       'Chatham Street, Colombo 01',
      office_contact:       '+94112421111',
      status:               'ACTIVE',
    },

    // ── PROVINCIAL HQs (9) ────────────────────────────────────────────────
    {
      office_id:            '44444444-0002-0002-0002-000000000002',
      office_code:          'SLP-PHQ-WP',
      office_name:          'Western Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0001-0001-0001-000000000001',
      office_address:       'Colombo 07',
      office_contact:       '+94112697777',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0003-0003-0003-000000000003',
      office_code:          'SLP-PHQ-CP',
      office_name:          'Central Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0002-0002-0002-000000000002',
      office_address:       'Kandy Road, Kandy',
      office_contact:       '+94812234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0004-0004-0004-000000000004',
      office_code:          'SLP-PHQ-SP',
      office_name:          'Southern Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0003-0003-0003-000000000003',
      office_address:       'Galle Road, Galle',
      office_contact:       '+94912234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0005-0005-0005-000000000005',
      office_code:          'SLP-PHQ-NP',
      office_name:          'Northern Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0004-0004-0004-000000000004',
      office_address:       'Hospital Road, Jaffna',
      office_contact:       '+94212234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0006-0006-0006-000000000006',
      office_code:          'SLP-PHQ-EP',
      office_name:          'Eastern Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0005-0005-0005-000000000005',
      office_address:       'Trincomalee Road, Batticaloa',
      office_contact:       '+94652234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0007-0007-0007-000000000007',
      office_code:          'SLP-PHQ-NWP',
      office_name:          'North Western Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0006-0006-0006-000000000006',
      office_address:       'Colombo Road, Kurunegala',
      office_contact:       '+94372234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0008-0008-0008-000000000008',
      office_code:          'SLP-PHQ-NCP',
      office_name:          'North Central Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0007-0007-0007-000000000007',
      office_address:       'Maithripala Mawatha, Anuradhapura',
      office_contact:       '+94252234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0009-0009-0009-000000000009',
      office_code:          'SLP-PHQ-UP',
      office_name:          'Uva Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0008-0008-0008-000000000008',
      office_address:       'Badulla Road, Badulla',
      office_contact:       '+94552234567',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0010-0010-0010-000000000010',
      office_code:          'SLP-PHQ-SGP',
      office_name:          'Sabaragamuwa Province Police Headquarters',
      office_type:          'PROVINCIAL_HQ',
      jurisdiction_type:    'PROVINCIAL',
      jurisdiction_ref_id:  '11111111-0009-0009-0009-000000000009',
      office_address:       'Colombo Road, Ratnapura',
      office_contact:       '+94452234567',
      status:               'ACTIVE',
    },

    // ── DIVISIONAL STATIONS — ALL 25 DISTRICTS ───────────────────────────
    // Western Province ─────────────────────────────────────────────────────

    // Colombo (district 0001) — 2 stations
    {
      office_id:            '44444444-0011-0011-0011-000000000011',
      office_code:          'SLP-DS-COL-FORT',
      office_name:          'Colombo Fort Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0001-0001-0001-000000000001',
      office_address:       'Colombo Fort, Colombo 01',
      office_contact:       '+94112421111',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0012-0012-0012-000000000012',
      office_code:          'SLP-DS-COL-WELLAWATTE',
      office_name:          'Wellawatte Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0001-0001-0001-000000000001',
      office_address:       'Galle Road, Wellawatte, Colombo 06',
      office_contact:       '+94112501234',
      status:               'ACTIVE',
    },

    // Gampaha (district 0002) — 2 stations
    {
      office_id:            '44444444-0013-0013-0013-000000000013',
      office_code:          'SLP-DS-GAM-NEGOMBO',
      office_name:          'Negombo Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0002-0002-0002-000000000002',
      office_address:       'Main Street, Negombo',
      office_contact:       '+94312222345',
      status:               'ACTIVE',
    },
    {
      office_id:            '44444444-0014-0014-0014-000000000014',
      office_code:          'SLP-DS-GAM-WATTALA',
      office_name:          'Wattala Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0002-0002-0002-000000000002',
      office_address:       'Colombo Road, Wattala',
      office_contact:       '+94112981234',
      status:               'ACTIVE',
    },

    // Kalutara (district 0003)
    {
      office_id:            '44444444-0015-0015-0015-000000000015',
      office_code:          'SLP-DS-KAL-CITY',
      office_name:          'Kalutara Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0003-0003-0003-000000000003',
      office_address:       'Main Street, Kalutara',
      office_contact:       '+94342222345',
      status:               'ACTIVE',
    },

    // Central Province ─────────────────────────────────────────────────────

    // Kandy (district 0004)
    {
      office_id:            '44444444-0016-0016-0016-000000000016',
      office_code:          'SLP-DS-KAN-CITY',
      office_name:          'Kandy City Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0004-0004-0004-000000000004',
      office_address:       'Kandy Lake Road, Kandy',
      office_contact:       '+94812222345',
      status:               'ACTIVE',
    },

    // Matale (district 0005)
    {
      office_id:            '44444444-0017-0017-0017-000000000017',
      office_code:          'SLP-DS-MAT-CITY',
      office_name:          'Matale Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0005-0005-0005-000000000005',
      office_address:       'Main Street, Matale',
      office_contact:       '+94662222345',
      status:               'ACTIVE',
    },

    // Nuwara Eliya (district 0006)
    {
      office_id:            '44444444-0018-0018-0018-000000000018',
      office_code:          'SLP-DS-NUW-CITY',
      office_name:          'Nuwara Eliya Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0006-0006-0006-000000000006',
      office_address:       'Park Road, Nuwara Eliya',
      office_contact:       '+94522222345',
      status:               'ACTIVE',
    },

    // Southern Province ────────────────────────────────────────────────────

    // Galle (district 0007)
    {
      office_id:            '44444444-0019-0019-0019-000000000019',
      office_code:          'SLP-DS-GAL-CITY',
      office_name:          'Galle City Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0007-0007-0007-000000000007',
      office_address:       'Church Street, Galle Fort',
      office_contact:       '+94912222345',
      status:               'ACTIVE',
    },

    // Matara (district 0008)
    {
      office_id:            '44444444-0020-0020-0020-000000000020',
      office_code:          'SLP-DS-MTR-CITY',
      office_name:          'Matara Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0008-0008-0008-000000000008',
      office_address:       'Anagarika Dharmapala Mawatha, Matara',
      office_contact:       '+94412222345',
      status:               'ACTIVE',
    },

    // Hambantota (district 0009)
    {
      office_id:            '44444444-0021-0021-0021-000000000021',
      office_code:          'SLP-DS-HAM-CITY',
      office_name:          'Hambantota Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0009-0009-0009-000000000009',
      office_address:       'Tissa Road, Hambantota',
      office_contact:       '+94472222345',
      status:               'ACTIVE',
    },

    // Northern Province ────────────────────────────────────────────────────

    // Jaffna (district 0010)
    {
      office_id:            '44444444-0022-0022-0022-000000000022',
      office_code:          'SLP-DS-JAF-CITY',
      office_name:          'Jaffna City Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0010-0010-0010-000000000010',
      office_address:       'Stanley Road, Jaffna',
      office_contact:       '+94212222345',
      status:               'ACTIVE',
    },

    // Kilinochchi (district 0011)
    {
      office_id:            '44444444-0023-0023-0023-000000000023',
      office_code:          'SLP-DS-KIL-CITY',
      office_name:          'Kilinochchi Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0011-0011-0011-000000000011',
      office_address:       'Main Street, Kilinochchi',
      office_contact:       '+94212322345',
      status:               'ACTIVE',
    },

    // Mannar (district 0012)
    {
      office_id:            '44444444-0024-0024-0024-000000000024',
      office_code:          'SLP-DS-MAN-CITY',
      office_name:          'Mannar Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0012-0012-0012-000000000012',
      office_address:       'Old Park Road, Mannar',
      office_contact:       '+94232222345',
      status:               'ACTIVE',
    },

    // Vavuniya (district 0013)
    {
      office_id:            '44444444-0025-0025-0025-000000000025',
      office_code:          'SLP-DS-VAV-CITY',
      office_name:          'Vavuniya Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0013-0013-0013-000000000013',
      office_address:       'Hospital Road, Vavuniya',
      office_contact:       '+94242222345',
      status:               'ACTIVE',
    },

    // Mullaitivu (district 0014)
    {
      office_id:            '44444444-0026-0026-0026-000000000026',
      office_code:          'SLP-DS-MUL-CITY',
      office_name:          'Mullaitivu Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0014-0014-0014-000000000014',
      office_address:       'Beach Road, Mullaitivu',
      office_contact:       '+94212422345',
      status:               'ACTIVE',
    },

    // Eastern Province ─────────────────────────────────────────────────────

    // Batticaloa (district 0015)
    {
      office_id:            '44444444-0027-0027-0027-000000000027',
      office_code:          'SLP-DS-BAT-CITY',
      office_name:          'Batticaloa Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0015-0015-0015-000000000015',
      office_address:       'Bar Road, Batticaloa',
      office_contact:       '+94652322345',
      status:               'ACTIVE',
    },

    // Ampara (district 0016)
    {
      office_id:            '44444444-0028-0028-0028-000000000028',
      office_code:          'SLP-DS-AMP-CITY',
      office_name:          'Ampara Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0016-0016-0016-000000000016',
      office_address:       'D.S. Senanayake Street, Ampara',
      office_contact:       '+94632222345',
      status:               'ACTIVE',
    },

    // Trincomalee (district 0017)
    {
      office_id:            '44444444-0029-0029-0029-000000000029',
      office_code:          'SLP-DS-TRI-CITY',
      office_name:          'Trincomalee Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0017-0017-0017-000000000017',
      office_address:       'Dockyard Road, Trincomalee',
      office_contact:       '+94262222345',
      status:               'ACTIVE',
    },

    // North Western Province ───────────────────────────────────────────────

    // Kurunegala (district 0018)
    {
      office_id:            '44444444-0030-0030-0030-000000000030',
      office_code:          'SLP-DS-KUR-CITY',
      office_name:          'Kurunegala Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0018-0018-0018-000000000018',
      office_address:       'Colombo Road, Kurunegala',
      office_contact:       '+94372222345',
      status:               'ACTIVE',
    },

    // Puttalam (district 0019)
    {
      office_id:            '44444444-0031-0031-0031-000000000031',
      office_code:          'SLP-DS-PUT-CITY',
      office_name:          'Puttalam Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0019-0019-0019-000000000019',
      office_address:       'Kurunegala Road, Puttalam',
      office_contact:       '+94322222345',
      status:               'ACTIVE',
    },

    // North Central Province ───────────────────────────────────────────────

    // Anuradhapura (district 0020)
    {
      office_id:            '44444444-0032-0032-0032-000000000032',
      office_code:          'SLP-DS-ANU-CITY',
      office_name:          'Anuradhapura Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0020-0020-0020-000000000020',
      office_address:       'Maithripala Mawatha, Anuradhapura',
      office_contact:       '+94252222345',
      status:               'ACTIVE',
    },

    // Polonnaruwa (district 0021)
    {
      office_id:            '44444444-0033-0033-0033-000000000033',
      office_code:          'SLP-DS-POL-CITY',
      office_name:          'Polonnaruwa Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0021-0021-0021-000000000021',
      office_address:       'Batticaloa Road, Polonnaruwa',
      office_contact:       '+94272222345',
      status:               'ACTIVE',
    },

    // Uva Province ─────────────────────────────────────────────────────────

    // Badulla (district 0022)
    {
      office_id:            '44444444-0034-0034-0034-000000000034',
      office_code:          'SLP-DS-BAD-CITY',
      office_name:          'Badulla Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0022-0022-0022-000000000022',
      office_address:       'Lower King Street, Badulla',
      office_contact:       '+94552222345',
      status:               'ACTIVE',
    },

    // Monaragala (district 0023)
    {
      office_id:            '44444444-0035-0035-0035-000000000035',
      office_code:          'SLP-DS-MON-CITY',
      office_name:          'Monaragala Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0023-0023-0023-000000000023',
      office_address:       'Wellawaya Road, Monaragala',
      office_contact:       '+94552322345',
      status:               'ACTIVE',
    },

    // Sabaragamuwa Province ────────────────────────────────────────────────

    // Ratnapura (district 0024)
    {
      office_id:            '44444444-0036-0036-0036-000000000036',
      office_code:          'SLP-DS-RAT-CITY',
      office_name:          'Ratnapura Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0024-0024-0024-000000000024',
      office_address:       'Main Street, Ratnapura',
      office_contact:       '+94452222345',
      status:               'ACTIVE',
    },

    // Kegalle (district 0025)
    {
      office_id:            '44444444-0037-0037-0037-000000000037',
      office_code:          'SLP-DS-KEG-CITY',
      office_name:          'Kegalle Police Station',
      office_type:          'DIVISIONAL_STATION',
      jurisdiction_type:    'DISTRICT',
      jurisdiction_ref_id:  '22222222-0025-0025-0025-000000000025',
      office_address:       'Colombo Road, Kegalle',
      office_contact:       '+94352222345',
      status:               'ACTIVE',
    },
  ]);
}