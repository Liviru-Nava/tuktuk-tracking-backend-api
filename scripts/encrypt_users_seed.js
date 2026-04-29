// Run this from your project root:
//   node scripts/encrypt_users_seed.js
//
// It reads ENCRYPTION_KEY from your .env and writes
// the encrypted db/seeds/05_users.js file.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASSWORD_HASH = '$2b$10$9bxJzBFzVPA1nWDpgASv8e/8xj6dj6iiTxpIBvYnUQ9wprVJF8dxm';

//encryption paramters
const ALGORITHM  = 'aes-256-gcm';
const IV_LENGTH  = 12;
const TAG_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    console.error('\nENCRYPTION_KEY missing or invalid in .env');
    console.error('Must be a 64-character hex string (32 bytes).');
    console.error('Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
  return Buffer.from(key, 'hex');
}

function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

const rawUsers = [
  {
    user_id:       '55555555-0001-0001-0001-000000000001',
    username:      'hq.superadmin',
    fullname:      'Rohana Wickramasinghe',
    email_address: 'rohana.w@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-HQ-0001',
    contact_no:    '+94771000001',          // ← will be encrypted
    office_id:     '44444444-0001-0001-0001-000000000001',
    role_id:       '33333333-0001-0001-0001-000000000001',
    status:        'ACTIVE',
    role_label:    'HQ_SUPER_ADMIN',
    office_label:  'HQ',
  },
  {
    user_id:       '55555555-0002-0002-0002-000000000002',
    username:      'hq.officer',
    fullname:      'Kumara Perera',
    email_address: 'kumara.p@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-HQ-0002',
    contact_no:    '+94771000002',
    office_id:     '44444444-0001-0001-0001-000000000001',
    role_id:       '33333333-0002-0002-0002-000000000002',
    status:        'ACTIVE',
    role_label:    'HQ_OFFICER',
    office_label:  'HQ',
  },
  {
    user_id:       '55555555-0003-0003-0003-000000000003',
    username:      'wp.head',
    fullname:      'Nimal Jayasuriya',
    email_address: 'nimal.j@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-WP-0001',
    contact_no:    '+94771000003',
    office_id:     '44444444-0002-0002-0002-000000000002',
    role_id:       '33333333-0003-0003-0003-000000000003',
    status:        'ACTIVE',
    role_label:    'PROVINCIAL_HEAD',
    office_label:  'WP PHQ',
  },
  {
    user_id:       '55555555-0004-0004-0004-000000000004',
    username:      'wp.officer',
    fullname:      'Saman Bandara',
    email_address: 'saman.b@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-WP-0002',
    contact_no:    '+94771000004',
    office_id:     '44444444-0002-0002-0002-000000000002',
    role_id:       '33333333-0004-0004-0004-000000000004',
    status:        'ACTIVE',
    role_label:    'PROVINCIAL_OFFICER',
    office_label:  'WP PHQ',
  },
  {
    user_id:       '55555555-0005-0005-0005-000000000005',
    username:      'cp.head',
    fullname:      'Gamini Rathnayake',
    email_address: 'gamini.r@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-CP-0001',
    contact_no:    '+94771000005',
    office_id:     '44444444-0003-0003-0003-000000000003',
    role_id:       '33333333-0003-0003-0003-000000000003',
    status:        'ACTIVE',
    role_label:    'PROVINCIAL_HEAD',
    office_label:  'CP PHQ',
  },
  {
    user_id:       '55555555-0006-0006-0006-000000000006',
    username:      'sp.officer',
    fullname:      'Pradeep Fernando',
    email_address: 'pradeep.f@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-SP-0001',
    contact_no:    '+94771000006',
    office_id:     '44444444-0004-0004-0004-000000000004',
    role_id:       '33333333-0004-0004-0004-000000000004',
    status:        'ACTIVE',
    role_label:    'PROVINCIAL_OFFICER',
    office_label:  'SP PHQ',
  },
  {
    user_id:       '55555555-0007-0007-0007-000000000007',
    username:      'col.fort.head',
    fullname:      'Asanka Silva',
    email_address: 'asanka.s@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-COL-0001',
    contact_no:    '+94771000007',
    office_id:     '44444444-0011-0011-0011-000000000011',
    role_id:       '33333333-0007-0007-0007-000000000007',
    status:        'ACTIVE',
    role_label:    'STATION_HEAD',
    office_label:  'Colombo Fort',
  },
  {
    user_id:       '55555555-0008-0008-0008-000000000008',
    username:      'col.fort.officer',
    fullname:      'Buddhika Rajapaksa',
    email_address: 'buddhika.r@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-COL-0002',
    contact_no:    '+94771000008',
    office_id:     '44444444-0011-0011-0011-000000000011',
    role_id:       '33333333-0008-0008-0008-000000000008',
    status:        'ACTIVE',
    role_label:    'STATION_OFFICER',
    office_label:  'Colombo Fort',
  },
  {
    user_id:       '55555555-0009-0009-0009-000000000009',
    username:      'negombo.head',
    fullname:      'Lasitha Mendis',
    email_address: 'lasitha.m@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-NEG-0001',
    contact_no:    '+94771000009',
    office_id:     '44444444-0013-0013-0013-000000000013',
    role_id:       '33333333-0007-0007-0007-000000000007',
    status:        'ACTIVE',
    role_label:    'STATION_HEAD',
    office_label:  'Negombo',
  },
  {
    user_id:       '55555555-0010-0010-0010-000000000010',
    username:      'kandy.officer',
    fullname:      'Chaminda Dissanayake',
    email_address: 'chaminda.d@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-KAN-0001',
    contact_no:    '+94771000010',
    office_id:     '44444444-0016-0016-0016-000000000016',
    role_id:       '33333333-0008-0008-0008-000000000008',
    status:        'ACTIVE',
    role_label:    'STATION_OFFICER',
    office_label:  'Kandy City',
  },
  {
    user_id:       '55555555-0011-0011-0011-000000000011',
    username:      'jaffna.head',
    fullname:      'Arjun Krishnaswamy',
    email_address: 'arjun.k@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-JAF-0001',
    contact_no:    '+94771000011',
    office_id:     '44444444-0022-0022-0022-000000000022',
    role_id:       '33333333-0007-0007-0007-000000000007',
    status:        'ACTIVE',
    role_label:    'STATION_HEAD',
    office_label:  'Jaffna City',
  },
  {
    user_id:       '55555555-0012-0012-0012-000000000012',
    username:      'galle.officer',
    fullname:      'Tharaka Weerasinghe',
    email_address: 'tharaka.w@police.gov.lk',
    password:      PASSWORD_HASH,
    badge_id:      'SLP-GAL-0001',
    contact_no:    '+94771000012',
    office_id:     '44444444-0019-0019-0019-000000000019',
    role_id:       '33333333-0008-0008-0008-000000000008',
    status:        'ACTIVE',
    role_label:    'STATION_OFFICER',
    office_label:  'Galle City',
  },
];

// ── Encrypt and build final rows ──
console.log('\nEncrypting contact_no fields with ENCRYPTION_KEY from .env...\n');

const encryptedUsers = rawUsers.map(u => {
  // Destructure out the helper labels — not DB columns
  const { role_label, office_label, ...dbFields } = u;
  return {
    ...dbFields,
    contact_no: u.contact_no ? encrypt(u.contact_no) : null,
  };
});

// Print summary
rawUsers.forEach((u, i) => {
  console.log(`  ${u.username.padEnd(22)} ${u.contact_no} → ${encryptedUsers[i].contact_no.slice(0, 40)}...`);
});

// ── Write users_seed.js ─────────────────────────────────────────────────────────
function toJsValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean')        return v ? 'true' : 'false';
  if (typeof v === 'number')         return String(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildRow(user, rawUser) {
  return `    // ${rawUser.role_label} — ${rawUser.office_label}
    {
      user_id:       ${toJsValue(user.user_id)},
      username:      ${toJsValue(user.username)},
      fullname:      ${toJsValue(user.fullname)},
      email_address: ${toJsValue(user.email_address)},
      password:      ${toJsValue(PASSWORD_HASH)},
      badge_id:      ${toJsValue(user.badge_id)},
      contact_no:    ${toJsValue(user.contact_no)},
      office_id:     ${toJsValue(user.office_id)},
      role_id:       ${toJsValue(user.role_id)},
      status:        ${toJsValue(user.status)},
    },`;
}

const rows = encryptedUsers.map((u, i) => buildRow(u, rawUsers[i])).join('\n\n');

const output = `// db/seeds/05_users_seed.js
// 12 seeded police users covering all role types and jurisdiction levels.
//
// Password for ALL users: Liviru@123
// Hash: ${PASSWORD_HASH}
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

  const PASSWORD_HASH = '${PASSWORD_HASH}';

  await knex('users').insert([

${rows}

  ]).onConflict('user_id').ignore();
}
`;

const outPath = path.join(__dirname, '..', 'db', 'seeds', '05_users_seed.js');
fs.writeFileSync(outPath, output, 'utf8');

console.log(`\n  Written: db/seeds/05_users_seed.js`);
console.log('    contact_no fields are now AES-256-GCM encrypted.');
console.log('    Run seeds with: npx knex seed:run --knexfile knexfile.js\n');