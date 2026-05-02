// Run from project root: node scripts/encrypt_tracking_devices_seed.js

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

function hmac(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  return crypto
    .createHmac('sha256', getKey())
    .update(String(plaintext))
    .digest('hex');
}

function firmwareToken(sequence) {
  return `FIRMTUKTUK${String(sequence).padStart(4, '0')}`;
}

// ── Fixed UUIDs — must match vehicles.device_id FK references ──────────────
// DO NOT change these values.
const DEVICE_UUIDS = [
    'a1345168-cf7b-5624-8889-a447df42141b',
    '7ff32f30-dc85-5063-893d-18be8fc61f4d',
    '0cbee5e7-7b9f-5be0-83df-1dcaaeaf59da',
    'a7d0f563-c90b-537b-8190-df07832d389d',
    'a77afba5-7180-52e6-9de2-6571087ad8c3',
    'e82b11d5-24bc-5bc7-9fa4-d54a51e5cdcf',
    'ce996d3d-6702-55f2-892a-df5354ac7cc1',
    '82c86b1e-5422-5b41-878b-e314f4b0966f',
    '8e068df9-491d-5596-b047-4b2a67d036c0',
    'c9f39ce6-1536-59c9-bece-aadb75fdb3d5',
    '841d57a2-3df4-5846-a2c5-a2a63a8ef6ff',
    '03e6b58a-dfef-571f-ad01-49f38834bcab',
    'f9570170-22d1-55c1-9f61-c0afc9139c5d',
    'b5c274b0-af3e-5203-8262-0177bd12dba0',
    'd2ca6b58-41ac-5318-a63f-f6afedafee9f',
    '56faa14f-828a-5d5d-aa8a-46f198a76e44',
    '29b87337-98ab-5a2b-a103-ddfc956eee23',
    'a9c662af-4437-5cab-8c89-322074b78ed9',
    'de0bffb1-649b-50b4-816a-080ce6e4619c',
    '6442d681-5958-57eb-a9f1-9c40fba6e692',
    '66c71160-4581-5812-b6a4-94f11c956e1d',
    '3b103a0f-e0b5-58ca-88bf-ec617f11e60b',
    '3a64fad8-66c6-5e34-bbea-88e1c9ec2ed0',
    'bc1545aa-e455-59d1-b019-8d145c5346d9',
    '6f062f85-e9ad-5454-ad81-56a828b5c2f8',
    '3c61fe44-fd7a-5074-99d3-3059a92135eb',
    'a438de02-ad58-5030-8e67-7350d5953def',
    'cc1d4731-229c-549b-b09a-8b1e36e6b8b7',
    'b10c45f3-47ae-5af1-9117-43c52a1b752f',
    'db2454b3-1cac-579a-86ff-3f69df405af7',
    '014f9878-8d9d-5fd3-be68-e4e100382b57',
    'e66cd4ad-70ce-5195-adbf-fcdd103dc9e6',
    'a30c5cb0-7c1b-50cc-b307-4d27f7e1dc33',
    '1f9c6956-351e-53db-b2b6-15ca422cf991',
    'ad91844b-68b4-5e31-b48d-42e45404d80d',
    '9b204dc0-82f0-5783-9e89-eea6f697c662',
    '5a77f58e-f8a5-5a9b-bbb0-0d5238524fc7',
    '5de28ad0-4817-537f-9933-85dab65d10cf',
    'ed1daadd-322a-583f-8a36-29ebaa6e6be9',
    'd24977ed-e902-583a-b4f3-dab28887600d',
    '7b45dcd1-e5ee-5db7-8891-cd6bdf680611',
    'b44ca7f1-576b-5ef0-9777-1d4cad6c9749',
    'be621c1c-521b-5aa6-904a-d75645a079ee',
    '43341b43-36bd-5984-b450-b956f6c639ea',
    '792100d3-6e6b-570a-aa0b-2802cbe4517a',
    '5a640d75-c15b-5b97-97cd-1ab5f3ec1abf',
    '78e285db-1814-5983-8e02-656a88f95f40',
    '1c916ae7-0e55-5b30-ac7c-f6acf41c3f82',
    'fdaa344a-0cd2-5735-b447-8d9725c2ae3f',
    '04ceefa0-2b9b-59f8-bd47-af4b5803b8e9',
    'f83bdff7-c25f-5a2b-a860-b837256d30ad',
    '349b8c42-e528-5294-8ed8-54bef48a2229',
    '8c129eb3-4c4c-5dd6-b83e-fddb5d7338ef',
    '594c0ad4-d053-54d7-86d1-1e63c21a21b5',
    '983b7d53-34a7-51fe-ba24-fc34f9a84fa9',
    '58576a02-cf74-5018-82fe-ff26fd93c302',
    '07360413-87ee-506e-ba83-9629175b9e5a',
    '0de76491-8986-5436-9735-fce1df139be8',
    '61d5f3cf-b33e-572f-bcf1-f262829c8223',
    'b7c5e5ac-df0d-554b-82bb-eeffdb02f64a',
    '6a68b73c-89c1-5341-80dd-009bc93f6b5e',
    'f8e5a2da-e745-5711-8d42-9edfc573b001',
    'f5a371ad-59e2-58b3-8914-3eccb28aedad',
    '5de66af8-dcb7-5216-bcc7-3391615003cf',
    '39cb7839-c273-51fd-8f06-0fe319d99c70',
    '562bd35a-2296-5e11-aa53-b5060e67a015',
    '203c3b46-8139-531b-ab98-4d77ee7d0b5e',
    'b86528d5-6cd0-5845-9c52-359a7bcea23f',
    '4a7b033b-392b-5e2c-844c-1fe5db45d882',
    'c9c4ee19-b62e-53ff-833c-56babff4ead3',
    '6bb956a6-4d7a-5127-bfce-7c7617f079ce',
    'be5856ea-51f7-5508-aa3c-510c7842f376',
    '872b5b43-690f-59a4-9985-b94eac562d7e',
    'aaf75150-14da-5779-a97d-04893186c430',
    '3262367f-d84f-519a-aba1-8093936347f4',
    '271df2a5-e68c-5a82-ae3f-a576eaae7a60',
    '1f3117b6-60b4-5eff-a0c2-6dcc839de1ac',
    'ff7d84f9-730b-5c41-8399-a718aaa173fc',
    '580acf77-fbc9-587f-af2b-032e7fa8f16e',
    'e72feefa-7bdb-5e10-a857-1ab1791303a7',
    '44dc2794-161e-59db-8233-c5da22cce0fe',
    '2be83a12-f7f4-58ad-a0ee-b1529d9602f0',
    '57c5693e-e705-5268-8706-44aa8523121f',
    '238a167f-38b3-511e-abe9-16cb428b719b',
    '299a2fe7-b21a-5dc3-ba5d-d8da19123f51',
    'b6ebcc8e-dd1e-59c5-953d-a9f765fb2de3',
    '4a9ce89e-9974-5289-a11c-cd4d44516991',
    'ce345c44-cb0b-5d26-af2f-a28b0f1a5f5c',
    '937ca456-28c2-550b-b127-b0c9756f634e',
    '5b38dc75-b281-5fc4-957a-f43e61aa7c5f',
    '39ac0dd1-fd50-560a-9d57-a32065f54888',
    '954b7a94-ebb3-5d2c-8323-eb27153d2f56',
    'a16f9c60-c83e-5a98-b457-b9241f398c3d',
    '1db725f1-d873-5f6a-a725-f2e6e0c9f9f6',
    '67f4f759-2c1b-5ec4-b977-59d2c1f6ee0d',
    '3aa97153-2c72-521e-8e8c-c02254edbf06',
    '9ff7753b-2d79-582d-837a-94ec9191b144',
    '700c723b-271e-56fc-8101-319598b125e2',
    '558ad181-69ba-56dd-a2c7-762975c6b9d0',
    '71fc158c-651c-5964-8920-23c69712bc0e',
    '003c983c-cd47-536b-af90-d0bcd6033626',
    'd9e1a81d-6b09-57da-a9e4-d1b72a1b5eca',
    'edb7f28f-03d4-53aa-8e6e-5a756f239553',
    '2e700d3a-5a6c-5d89-9a42-68770b16b226',
    'dae4ba2d-a55d-570e-8799-d618fda92ccc',
    '03b12c79-2b80-59af-834a-a734c92fe854',
    '9720b431-c562-5f3d-950a-d4ec0267040a',
    '36beadae-d83e-5a88-9017-25b832418481',
    '32abafd3-fecf-5b49-b12f-412e70854ef7',
    '91567ed8-1c05-5e2f-aae4-7d255224fa9f',
    '89e6789e-b015-5819-9a83-7e2326cc5d73',
    'fb3c7b8c-45de-5c88-9de6-b36c46086cd5',
    'c0d6bc2d-ebf5-5fd3-9423-66abefa56e22',
    '28afdae0-a95d-5c27-839f-97341e2086f7',
    'a08ca7f4-d649-52c1-9615-6ca877718593',
    '14b5b784-94c3-5f60-96f0-1bf4b639bc2d',
    '7a9fbed9-10c3-53c7-b36e-b22bb38b5fde',
    '9e9dbd35-edfb-5ce0-a11b-3943dac116d5',
    'fd144a13-a6a2-5b26-8200-919da91b9b12',
    '95792a26-a0c5-5bdb-b9fa-ac81bc1c51ba',
    '9e5f6077-b0db-5c2d-a2aa-e8f31428d298',
    'a39f64e4-7e80-55d4-8e7a-fd35bacdc546',
    '1dde6f6b-d57b-53bb-9f4e-a59a9ea71257',
    'd05dffc0-bdd2-5073-9f2c-73880153d495',
    '1e723a29-4aa9-5fdb-a749-e1877275226e',
    'f8ee53ac-95fd-5959-87dc-96a6a40c2abb',
    '2fda51b5-3c8f-5829-9410-77a54ba33994',
    '6dc86170-dd51-5ff1-9007-c18ea6d60ccd',
    'cc6ade85-8204-5e7d-a149-632ff1d93499',
    '22894f79-07d4-55be-8290-4745c15c345f',
    'a24c212c-1f91-5113-bbc3-94ee7ac351c9',
    'e944ab35-7c8c-5d9f-9062-43bfc9a65ea2',
    'e788e4d9-5e1c-57ad-9573-4cac9c597943',
    '43c78c57-9a97-5233-978b-69502c137859',
    '7dd55d1c-fe71-593b-8ad8-99abcf89dffc',
    'ad22ff4e-dafa-55a2-9c2b-49c7e2cc905f',
    '08ae501d-a595-5a86-b4aa-b9e7a654ac64',
    '1c636f82-d5ad-550f-80e3-5d1eb8778ef8',
    '67c34390-33c1-55ba-ad32-238edc52f3fb',
    'ce174671-1c00-5dba-99c4-eda343b749d0',
    '505fd834-5ff4-5ba3-94ae-78155555a53a',
    '6cb954ad-ab06-51fa-a269-b901d5225ee4',
    '918d6a44-fa2d-50b4-8262-5a0e0ceee9e9',
    '762fc234-3279-50a1-971e-505c15a7d087',
    'ffbdaf24-bf45-53e0-bcec-27955cf79b52',
    '00a6d22e-f2ea-522e-bfa9-996343677172',
    'd430fc76-a800-5c41-bdc2-61382f9e6f9e',
    '5bd148ff-d411-5ed7-ad2c-e614afda1ca1',
    '340d017d-1ae7-51d0-a375-3d411481d311',
    '74ba332c-65ef-51b4-93fd-12cd3bcf9c85',
    '77bb5b25-c0d0-5ba6-b798-89b0aa788e68',
    'f76af460-d562-52bf-bfd6-a1f7948d38f1',
    'edebc340-a1ad-5e6f-8ce5-8f7362679408',
    'ad5df35b-c3d4-5411-9801-68cc62d885a6',
    '46565ad2-81e9-59e9-b49f-9949d62e8eb6',
    '59202dfb-d90c-5f52-8c98-03dda29910bc',
    '51e4fb6a-21a4-51c7-8e14-8fb514a171c0',
    'eb814a66-3628-51ef-a75f-e070874f4998',
    '9a342803-be3b-543c-beb2-fc45374b840e',
    'a2d66435-329b-51e1-8e81-6d12411921ce',
    '1967898d-f15c-5f75-b121-a15fca962e1d',
    '6fa494f8-1c5e-553c-82d4-b3e80b5c664e',
    'f5eb442f-07fb-5ca1-88c3-e2eeeafda1d4',
    '7e66279a-c481-577d-bad8-80b0ef29dfd3',
    'e407996b-ce83-51dc-88e1-aa2629d6fb23',
    '91716db6-cfa4-53db-8e0e-e32706bfa015',
    '237026fa-ed0a-56df-b1e1-e86df0823679',
    '9403ccaa-058e-5efc-9dae-dd93e49aa3ed',
    'db000c39-ff8f-5b17-81a7-20f14656d85b',
    '55784c36-041a-5eb6-8986-51aaf359945e',
    '2a1900dc-08ba-5d84-b373-a43875b4c080',
    '687fc56a-0bd2-5fa7-a1e3-4981853335de',
    'ca2734b6-007e-5c6b-b496-254214d4b62b',
    '9a21c2cc-4e8c-5ca9-af8f-da1256e8021e',
    '1ba96afd-29c0-591b-8042-5fcc1a70e05d',
    '340445bb-2929-5dee-8ec5-540b2fd42ac2',
    'c01d930c-1aa4-5ad7-8804-f65a690af62e',
    '8d20d7af-9a79-51c0-b50a-5a36d18bd7b1',
    'b3bf3a82-cc22-597c-94d9-c7d0e39b94b8',
    '37a5994c-c7df-540b-b9fb-fa35c1cef421',
    '5877ae23-0f95-5d06-82e5-90f50add1003',
    'd8b0cfe0-7f94-5e7c-a90d-48dfc64bcf51',
    'fd118d6d-714a-54f9-aa13-45fa612700ab',
    'd8232ad1-88b2-53cf-9cf3-f59de45dca58',
    '2ade5d05-d1cf-5d42-95e5-4f268bb0934f',
    'fe17bbbd-9f0b-583a-95b1-76d2f53ee897',
    '7177ae88-4ff3-5a5d-a31e-3fd1d39c7865',
    'c431a411-238b-5eef-b9f6-fccc2bd6494b',
    '75583e48-398f-5d95-8b35-0436d74b68b3',
    'ca8a125e-970e-533f-9a87-f58568558b35',
    '9f150b61-ef77-53c9-bcc1-491fb4125334',
    'fd203f28-09db-53db-be80-92cb1ef88507',
    'e2acbfda-9e7f-583e-9322-3fba21c9a48c',
    'ef397fb7-f028-597f-a5db-55d0f6c3654c',
    '6a03cbdb-46b4-5ec3-b218-33245054943a',
    '6f32e5dd-e617-5822-8179-2acc493b48da',
    '22ea481b-ca4c-5a4a-bd23-85415f637781',
    '63ee5850-abb1-594e-9cc2-893f4d708da9',
    '64453756-699e-5abc-a7dc-5f099ce0d8b4',
    '4c9382cd-d43a-5142-80ad-c266d49c4556'
];

const DEVICE_COUNT = DEVICE_UUIDS.length;

// ── Generate devices ─────────────────────────────────────────────────────────
console.log('\nGenerating tracking device firmware tokens...\n');
console.log('─'.repeat(60));
console.log('IMPORTANT: Record these tokens now — they are shown only once');
console.log('           and cannot be recovered after this script exits.');
console.log('─'.repeat(60) + '\n');

const devices = [];

for (let i = 1; i <= DEVICE_COUNT; i++) {
  const serialNo    = `SLPGPS${String(i).padStart(6, '0')}`;
  const token       = firmwareToken(i);
  const tokenHash   = hmac(token);

  devices.push({
    device_id:         DEVICE_UUIDS[i - 1],
    device_serial_no:  serialNo,
    device_status:     'ACTIVE',
    device_token_hash: tokenHash,
  });

  console.log(`[${String(i).padStart(3, '0')}] Serial: ${serialNo}  |  Token: ${token}`);
}

console.log(`\nTotal: ${devices.length} devices\n`);

// ── Write seed file ──────────────────────────────────────────────────────────
function toJsValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean')        return v ? 'true' : 'false';
  if (typeof v === 'number')         return String(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const rows = devices.map(d => {
  const pairs = Object.entries(d).map(([k, v]) => `      ${k}: ${toJsValue(v)}`).join(',\n');
  return `    {\n${pairs},\n    }`;
}).join(',\n');

const output = `// db/seeds/07_trackingdevice_seed.js
// ${DEVICE_COUNT} seeded tracking devices.
//
// device_token_hash — HMAC-SHA256 of the firmware token (FIRMTUKTUK000001 format).
// The plain-text tokens are printed once by scripts/encrypt_tracking_devices_seed.js
// and must be recorded at provisioning time. They are never stored in plain text.
//
// Regenerate: node scripts/encrypt_tracking_devices_seed.js
// UUIDs are fixed — vehicles.device_id FK references depend on them.

export async function seed(knex) {
  const rows = [
${rows}
  ];

  for (let i = 0; i < rows.length; i += 50) {
    await knex('tracking_devices').insert(rows.slice(i, i + 50)).onConflict('device_id').ignore();
  }

  console.log(\`Tracking devices seeded: \${rows.length} records\`);
}
`;

const outPath = path.join(__dirname, '..', 'db', 'seeds', '07_trackingdevice_seed.js');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, 'utf8');
console.log('Written: db/seeds/07_trackingdevice_seed.js');
console.log('UUIDs preserved — vehicles.device_id FK relationships intact.\n');