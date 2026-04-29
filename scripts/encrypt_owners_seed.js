// Run from project root: node scripts/encrypt_owners_seed.js
//
// Uses the EXACT same UUIDs as the original Python-generated 06_owners.js
// so that 08_vehicles.js foreign keys remain valid.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Encryption Pramaters
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH  = 12;
const TAG_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    console.error('\nENCRYPTION_KEY missing or invalid in .env');
    process.exit(1);
  }
  return Buffer.from(key, 'hex');
}

function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}


const OWNER_UUIDS = [
  '5f0f6642-bc9c-50de-9aca-80e0acf9a9df',
  '50459402-76b1-5668-9e99-1fde36dc0e7c',
  'fe5c4bda-6fe5-5e77-8b19-2e0bde162251',
  '2f2466ac-3287-5317-873d-75b7b912b219',
  'f49a7d0e-5f45-5645-a4c6-21dac8bb1b20',
  '8afae43e-65e6-5a55-b8e1-e117f0de0681',
  'be0ce0ca-0870-59c5-9175-9ea22bd05f59',
  'b02fbe52-8246-5691-905a-9efdf2fb1127',
  'bda0f8ef-732a-5e9d-9a76-096b067b5cc6',
  '0c13f526-6b6c-529f-bea7-68726332c894',
  'a9d5b518-4437-5072-b31b-93801cd24277',
  '3bfebbee-7212-5bbe-9c40-73c0187069f7',
  '3485aba8-ed21-59c5-8b6c-54eeedb6054b',
  'c7b19401-c43b-55d0-9292-2f05afdc2b57',
  '632ce8fe-b596-5db0-af94-e48746a59250',
  'fd914f16-d72c-5b86-aee9-4c5b6f5acd12',
  '17aa2cf0-d3bd-54f9-a40d-b07aa4dac685',
  '35b3ce43-3178-589f-9126-e767511a1bab',
  '560457a8-bffe-5f23-873e-22145caaab34',
  '438998c5-5609-512b-add7-b01c1404e633',
  'ba253d74-eeb7-592f-8732-e464e212ad47',
  'db30bd9d-2ed3-582a-b9b5-16f493e382ec',
  '7fb4a92e-70c4-504f-aa65-fffbc9147109',
  'ffc736d7-74f1-5227-958b-e948ad0e9feb',
  'ecc9c3d8-e2a6-5952-b8f0-e36defb22bc8',
  '76bedf5a-10e6-56a0-b425-624a8c2c8438',
  '3f45d3aa-5a49-58d4-913b-9a9f8c280c11',
  '495d15d6-b2ac-5ea6-a840-601cdd801139',
  '406d09c0-a214-524b-94a9-ec0050420c7b',
  '4a489819-8aa9-5594-b1d0-a4fef211e01d',
  '9664049f-f932-5c52-aa03-8ede3dc06eec',
  'ea3ff8d4-0ad8-5ac3-bbd6-30aed38c4158',
  'dd16955f-007a-58d2-ad2c-ace4165dc9b7',
  '61be80b4-b79c-5cda-a383-1da2a901783f',
  '96128ce2-4a91-50ae-9a83-ccd75d9f8eb9',
  '75892fd3-33d8-5111-87d9-9c56b578d80c',
  'd5f395d5-6d4b-5df4-83e8-62df66af83e8',
  '4dd94441-bd66-5d00-ae50-ce295ad82cea',
  '2f68ed8c-8924-5560-a39e-1ae225e23f10',
  '07a8b1bb-d939-5cb6-b77a-a1143b3e18d7',
  '33238b22-1edf-5adc-9bb1-c558ad22b878',
  'b26fe9d4-9b4e-5cc8-ad7e-67d991f447b2',
  '453a5e08-1a9e-5acb-ac7e-5f57d2eb02c8',
  'c3040bec-5102-54f3-907f-c1a2b561fa61',
  '67be7013-aaae-5700-8871-22040a96351c',
  '894505c0-c0ba-511f-81b8-4164be65bb5e',
  'ea3cb5f2-f5be-5164-aadf-d7ce268b8c9c',
  'fca71910-2360-5153-a6a0-7b63a59c5b37',
  'cce56abc-47d5-5ffe-94fd-8fe1dfd48308',
  'b0a500bf-91ba-5748-84e8-cad10463f1f3',
  '105b7426-e23b-5113-a9b0-6afa3ae1aa14',
  'd5baaa80-41f8-511f-86f5-79d14dd1a404',
  '03a5844c-4726-588f-af79-d3d865ea0b19',
  '4aa11934-d154-51a9-8729-c172a3a7cc63',
  '4cfc1692-9b81-5623-ab21-9430b86a8264',
  '067d330a-d9c4-5311-87ef-bd1353a6a693',
  'a716af5c-6a3f-5468-a116-bc7679f67452',
  '87e8d5d3-f608-5155-ba61-37c7e5633f35',
  'e5eb65c7-6bf4-5b6f-9147-d836b0ccba74',
  '94c40947-879a-5270-b67d-6d115ceabd24',
  '2aa24769-0800-5eb0-8f06-d5d5466f092b',
  'fbc1aa12-1712-5a7b-831c-6f091f7c0438',
  '1927f1fc-7057-5a8d-ad27-a4f5478d4c6c',
  '8c0ed95e-efe8-5d06-ad55-c6b94aae54d0',
  'fe1aa976-a84e-5891-88bf-ed19dc7e2945',
  '73c71efd-433c-564b-8ab8-90c978fa27f2',
  '0684bb5f-e47a-5597-a931-19237e776a17',
  'ace80005-2ecd-5ca4-94d2-8c5568529fc7',
  'e5a24ed4-88b9-5294-b9fb-a1d74c662050',
  '9ad34907-cd9c-551b-80b9-15c879427eac',
  '629ff9be-c37b-5c03-b529-cf611544eea1',
  '7ae339f3-7afd-54dc-9d1d-28e959432489',
  '2234e98e-9223-52cb-9757-ab92cb8470c9',
  'dec0271c-ee0a-5665-9f98-1da7d5257309',
  'e1649a7b-94d5-5b66-ab42-6aa95f7a309f',
  '38fde419-ed30-5696-90ff-3354c0cb11b8',
  'a591ea67-5b43-5eec-9ad2-4ebc450b8b2d',
  '27cd592f-dbca-5c7b-ab00-4cb9a1516add',
  'f4207903-1eed-577e-81b4-15d52ed79ab0',
  '4c03524b-1c72-5bec-bde5-0202277d24f4',
  'd5f86164-ac09-58cf-974f-f5b1dc33b27d',
  'ea14b9da-0fe2-5174-8e35-aefeccd04672',
  'ee35a66b-d792-5bec-a669-c4499d9319b5',
  '7d0ddbf7-357c-5dd2-8ae8-188a961dd977',
  'ff06495b-9471-5607-9c49-735254a00408',
  '3006b3bf-c14a-5c6e-a9fd-876e9127c8bc',
  '020ce67c-77d1-550a-bea8-0bf87e02c361',
  '9959fe56-222e-5fba-9dd6-1fa17c3bb234',
  '09b14514-aef9-5e79-8882-d5d14091e0a5',
  '6e177805-594f-58fb-b9fe-6c2bfb313272',
  '6b739e6c-2f96-5f12-a1bb-03385051b18f',
  'fc5ccfd4-cc4f-5c3d-bd3e-eb6347412ab3',
  '9df468e0-6706-5d90-a9da-bdb5ffdba868',
  '6dda36e2-78a1-5c60-a2a7-ab54aea0380b',
  '40ce5b1b-5d57-570d-8cfe-54707ffc951f',
  '56f11b30-1ee9-5c43-aa86-24f1ccfb8c88',
  '8c2af64b-1741-5d65-9ed0-f0419069679e',
  '3d89a38c-3f1d-53dd-898d-2fedbc27488f',
  '9e49a3ea-a5e9-59f7-837d-a563b043a553',
  'a6657b69-dd9b-58fb-a1ff-558c50fb6d4e',
  '653c590f-4e6b-509e-828f-e482f43987c1',
  '5d95c228-68e7-540e-96b9-eb9b1d053cec',
  '34fa1ba1-828c-5d17-a4bc-52e8f6970da5',
  'c0fd401e-9838-53e5-88f5-0b5ef359524b',
  '03a9b9f2-fb6c-5243-8076-32a890560687',
  '0756bcb7-1d30-5f11-a42b-f7bce3428ac6',
  'f089051e-64d2-5faa-b1e5-8a2a0cf4babb',
  '31601986-da57-58d1-9ec9-fe5aeacd537c',
  'e225f69c-c3dc-539f-9c6c-2cfe06848344',
  'ab50ada5-61eb-522b-b2e4-3af3d04d0de5',
  'ec7c7b35-919d-554a-86b8-b24438896afd',
  'b8a05bd6-6860-5cd4-b6da-874d07ce4e76',
  '1a67ed5d-f753-55b2-8ab3-e5879e6b44c2',
  'c8747226-f478-5e9d-a628-e89f28f19d89',
  'f58cdd54-f2e5-59d6-9497-9d95b2609161',
  'e3f8ec03-bf5e-5cf6-9516-6fc8c2d57b3b',
  'cdd3f9a0-dfcf-5f0e-96a1-ee38d766cef6',
  '85e882bc-9b9c-5ffe-a3d5-dfc7da94f770',
  'ba14b7ee-6130-57cb-8874-ce46bc062ca6',
  '2abbba47-970e-519b-a47b-59210d28488a',
  '08bf5249-7493-5a34-887a-1c3061164d96',
  'e0f14b7c-df78-55a0-815d-d063d49e4975',
  '6b6c4c0e-87b9-5537-8381-9b750408c943',
  '81271729-2e24-50cc-8135-8a35cdc1e0f5',
  '34661a75-367f-50da-b01c-cd1bea47f899',
  '6b82c2c2-3780-599f-ae07-27fe2013a3ce',
  'fc0b6cd9-9e5c-557d-b400-df05c754be1a',
  '20f536ef-f0fb-5843-8d09-d09e3ff654a2',
  '650f1c1d-494f-504d-b692-54d8b1ff03a2',
  'cab4983e-d899-522c-8203-b2ccd0fff69f',
  '8261c7da-078e-5a90-977d-0d04887dc64f',
  '03350359-02d1-5c04-b07d-39581839d5c8',
  '017b5c44-a73b-5b8c-b58a-7cc9a3525b49',
  '248ccadd-3caf-5c69-a50b-443b63fe6149',
  '2bec3231-6613-5409-885f-fe463d6452a4',
  '420506ca-eada-5dd3-8ff8-b29fd3751512',
  '463ed595-8bcd-51cb-8ab3-0410fbce244e',
  'e7487d85-ea1e-5c73-ad76-22175f1d79cd',
  '53b1cdca-365c-502c-92fe-a72d306296c2',
  '761f78bb-5b6c-53ff-94dd-0ba922c31043',
  'cc9ee5a3-3aa8-57fd-8b1e-4f9df9ddb941',
  '0dda46be-8a76-559b-94c5-b8a8034751be',
  '2610af2a-ed79-5759-8c8f-f7f7d4b1ad9e',
  'e0d61768-cec5-543c-9520-fb917c125b75',
  '662dbc69-d3e5-5c4d-97d5-a97e35c14f23',
  '3c37d3fa-8fe6-596b-b44f-67141c3e42d6',
  '87f43e9c-fa2f-5cec-85fc-f4a34acaa073',
  'd3bc62f2-0377-5ef0-a70b-97cb9bbefdf3',
  '6884e817-5fda-5fc1-92bc-5d88ee811bc9',
  '44e397ee-4e66-50d4-8ea9-0ade034f1644',
  '8b1489a0-20fd-5daf-ac81-dcaed318f24c',
  'c73fb4f9-0688-504b-a816-70a18848a695',
  'ac1831be-2e50-5281-b162-b9a87709817b',
  'd3f51fb2-f245-59c8-96c8-fbefdfe69b0f',
  '7d47ac8b-8c5e-5f47-8c84-17e2e9647a80',
  '7de57903-04ce-515a-8c09-1e7cf2388acf',
  'f5326500-7793-5973-8781-a5d76a8b54fe',
  'bb6f3555-aa21-594e-a01c-157c0671fdc1',
  'b14fee16-7426-5574-9ef9-b929cf4ac76f',
  '16f646aa-ab7c-595a-8d76-328a869a1ae0',
  '4f577775-cd17-5396-b7d9-dbc189803e3e',
  '19d6e669-007e-599f-980f-383026bc23fc',
  '2cb6256a-584c-58b7-a138-26a1e324cc4e',
  '1427d043-9913-5951-9f21-de13514ab8a1',
  'f2744362-6e9a-568f-a0d3-59bd88e94a6e',
  '754a8f90-75e7-59d2-b48f-2606fed2e1e7',
  'cdf956ee-f54b-56f1-a906-c6ae24aa617b',
  '9a9658e6-c7d8-5d23-9e42-549b1f781d56',
  '44614c6d-7e5d-5c92-b3dc-401f28857baa',
  '601d9fae-dc7a-521d-8e93-c558f43c5762',
  'dff7de62-6fea-535e-9791-7f86aaf1209a',
  'db5ccfdc-e78d-5967-9057-a3b34a6b6710',
  'bb876647-fa26-5c1b-8e0f-d6b4837d83f0',
  'eaaf8bfe-7a2e-5515-a689-caf78000852a',
  '9612e2b2-7f61-53d6-b327-96d9f9c6077d',
  'ef521be0-2584-5c75-863c-79136c0eb6bc',
  'fb5f41e3-4192-5af2-9430-94fac41db82a',
  'd9a02a20-bc10-5e0c-916b-83a0511a11ef',
  'f8116e9d-225d-502b-9fe8-b897a8465329',
  '82daa7f0-2c09-50e5-833c-884adb7de8e2',
  'b51c70e0-e251-5155-85d8-e3919cf2cee7',
  '02a1bb62-f3ad-50d4-8256-da9968f8f9b3',
  'aadbf670-5e61-541c-854f-96f19e9dc9d6',
  '5c748349-6233-53e0-8ee7-d603352cc2bb',
  '0e434073-036b-545d-8eb2-770998628793',
  '0fa76288-825d-5466-a359-9dfc1f34baeb',
  'e5f1d323-f92d-50f1-aef9-1ac2bc31668f',
  '6d4bfd10-5b8f-521d-8c3b-1da163ac4ac9',
  '139d2bdf-a0b4-5160-a11a-434c5c9b3628',
  '42fd2a5b-1bba-5e5c-b8ed-a67027e88197',
  'f06003cf-f282-51a1-8345-c22004e6d26d',
  '71a26300-4bab-54e6-bbe6-1340c224d62e',
  '485fe0d1-5bc9-5ab1-a161-963d93bbd1fe',
  '8f3db382-adb1-576c-8b35-f24d63cb57f1',
  'a16cf4a6-ed25-5fc8-8792-b51f6d4570bc',
  'df154293-a701-5800-8de8-4eb6fa48e497',
  '0efe98b8-1df8-5f08-ac52-f332ad74cc17',
  'da975046-f578-57ff-bcda-b697de09155b',
  '3b5c4623-ff5b-5d4b-a314-a5d792cc8355',
  '9baad457-83b7-58f6-9a9e-fef370ce4da2',
];

// ── Data helpers ────
const SINHALA_FIRST = ['Nimal','Kamal','Saman','Sunil','Rohan','Priya','Anura','Chamara',
  'Thilak','Ruwan','Lasith','Dinesh','Mahesh','Nuwan','Isuru','Dilan','Harsha','Tharaka',
  'Buddhika','Chanaka','Malinda','Kasun','Dhanushka','Ravindra','Sanjeewa','Indika',
  'Lahiru','Chathura','Sachith','Amila'];
const SINHALA_LAST  = ['Perera','Silva','Fernando','Jayasuriya','Wickramasinghe','Rajapaksa',
  'Bandara','Rathnayake','Dissanayake','Weerasinghe','Gunasekara','Mendis','Jayawardena',
  'Senanayake','Pathirana','Fonseka','Ranasinghe','Kumarasinghe','Seneviratne','Liyanage',
  'Wijesinghe','Marasinghe','Samarawickrama','Karunanayake','Amarasinghe','Herath',
  'Gunawardena','Thilakarathne','Madushanka','Jayalath'];
const TAMIL_FIRST   = ['Arjun','Vijay','Kumar','Rajan','Murugan','Selvam','Pradeep',
  'Suresh','Ramesh','Dinesh','Ganesh','Karthik','Senthil','Bala','Muthu'];
const TAMIL_LAST    = ['Krishnaswamy','Rajaratnam','Thuraisingam','Ponnambalam','Balasingham',
  'Maheswaran','Subramaniam','Sivanesan','Nadarajah','Ramanathan'];

const DISTRICT_NAMES = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle',
];

let rngState = 12345;
function lcgRand() {
  rngState = (rngState * 1664525 + 1013904223) & 0xffffffff;
  return (rngState >>> 0) / 0xffffffff;
}
function pick(arr) { return arr[Math.floor(lcgRand() * arr.length)]; }
function randInt(min, max) { return min + Math.floor(lcgRand() * (max - min + 1)); }

function fullName(idx) {
  if (idx % 7 === 0) return `${pick(TAMIL_FIRST)} ${pick(TAMIL_LAST)}`;
  return `${pick(SINHALA_FIRST)} ${pick(SINHALA_LAST)}`;
}

function syntheticNIC(idx) {
  const yy  = String(60 + (idx % 39)).padStart(2, '0');
  const ddd = String(1  + (idx % 365)).padStart(3, '0');
  const seq = String(1000 + (idx % 8999));
  return `${yy}${ddd}${seq}V`;
}

function phone(idx) {
  const prefixes = ['71','72','77','78','76','75','70'];
  return `+94${prefixes[idx % prefixes.length]}${String(randInt(1000000, 9999999))}`;
}

// ── Generate owners ───
console.log('\n  Encrypting owner PII fields...\n');

const owners = [];
for (let i = 1; i <= 200; i++) {
  const districtName = DISTRICT_NAMES[(i - 1) % DISTRICT_NAMES.length];
  const gender = (i % 4 === 0) ? 'FEMALE' : 'MALE';
  const houseNo = randInt(1, 250);
  const plainNIC = syntheticNIC(i);
  const plainPhone = phone(i);
  const plainAddress = `No.${houseNo}, ${districtName} Road, ${districtName}`;

  owners.push({
    owner_id:          OWNER_UUIDS[i - 1],
    owner_fullname:    fullName(i),
    owner_identity_no: encrypt(plainNIC),
    owner_id_type:     'NIC',
    owner_gender:      gender,
    owner_contact:     encrypt(plainPhone),
    owner_address:     encrypt(plainAddress),
    status:            (i % 20 === 0) ? 'INACTIVE' : 'ACTIVE',
  });
}

console.log('Sample (first 3):');
owners.slice(0, 3).forEach((o, idx) => {
  console.log(`[${idx+1}] UUID: ${o.owner_id}`);
  console.log(`NIC ciphertext: ${o.owner_identity_no.slice(0, 45)}...`);
});
console.log(`\n  Total: ${owners.length} owners\n`);

// ── Write seed file ───
function toJsValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean')        return v ? 'true' : 'false';
  if (typeof v === 'number')         return String(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const rows = owners.map(o => {
  const pairs = Object.entries(o).map(([k, v]) => `${k}: ${toJsValue(v)}`).join(',\n');
  return `{\n${pairs},\n}`;
}).join(',\n');

const output = `// db/seeds/06_owners_seed.js
// 200 synthetic tuk-tuk owners distributed across all 25 Sri Lanka districts.
//
// PDPA Compliance — encrypted at rest with AES-256-GCM:
//   owner_identity_no  (NIC number)
//   owner_contact      (phone number)
//   owner_address      (residential address)
//
// UUIDs match 08_vehicles.js owner_id foreign keys exactly.
// Service layer decrypts before returning API responses.
// Regenerate: node scripts/encrypt_owners_seed.js

export async function seed(knex) {

  const rows = [
${rows}
  ];

  for (let i = 0; i < rows.length; i += 50) {
    await knex('owners').insert(rows.slice(i, i + 50)).onConflict('owner_id').ignore();
  }

  console.log(\`Owners seeded: \${rows.length} records\`);
}
`;

const outPath = path.join(__dirname, '..', 'db', 'seeds', '06_owners_seed.js');
fs.writeFileSync(outPath, output, 'utf8');
console.log('Written: db/seeds/06_owners_seed.js');
console.log('UUIDs preserved — vehicle FK relationships intact.\n');