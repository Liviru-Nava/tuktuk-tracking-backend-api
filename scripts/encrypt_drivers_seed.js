// Run from project root: node scripts/encrypt_drivers_seed.js
//
// Uses the EXACT same UUIDs as the original Python-generated 09_drivers.js
// so that 10_assignments.js driver_id foreign keys remain valid.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Encryption ────────────────────────────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
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

// ── EXACT UUIDs from original ──────────────────
// These match 10_assignments.js driver_id foreign keys exactly.
// DO NOT change these values.
const DRIVER_UUIDS = [
  '300d1eae-9d46-5061-b70a-46ca3563b770',
  '4a7a52ee-6b66-504e-bd35-9dd7758f6293',
  '8245e19d-a3e4-5da9-be61-49272466d292',
  '6542354e-4b70-585a-8b4d-c55b353e8f0a',
  '1bb582b3-968c-59d5-8f50-c116052a9e3c',
  '9d7ef1b8-50ec-5749-bf9a-6e302b5dd88b',
  '0562b1be-b39f-5bf4-af78-047001ae45c9',
  '22764dfb-da71-5460-84eb-387f311a78fa',
  '075e08bf-292e-5674-b2d8-5d5b36e653f2',
  'ca246104-fcff-527a-bdf3-a9905655212c',
  '4935920c-5ad6-5269-a5da-276052d0aa76',
  '9dfd2ace-f0af-5c97-b952-48c9ab69301b',
  '7711f71a-c5c3-56bf-9600-18533c0a8336',
  'ae0d7939-7108-5a9c-80f1-530d399983e3',
  '11350c8c-99fb-5ccd-ab52-c0a9cfe15cf3',
  '538150d0-d8db-5763-802f-d3e3572c5fe0',
  '2dc81b7b-f02e-512e-ad22-93e5eb5d02a0',
  'b08cb7f1-6b10-5f79-aaed-457f0d197b75',
  '317294d9-b9c1-5058-a1c9-39985fdd9d32',
  'cf015d61-6c6d-52d3-97ce-aa50444e1cf7',
  'd0d216db-1f1d-5319-b81d-f60bd48fb942',
  'b42cc73a-190c-50c8-a0fd-2ec6fc0987bb',
  '9ccf3061-18ac-534e-a0d5-1373254d90ce',
  '05d3a262-4b8b-53d1-a986-936bab72b95d',
  '2f5b3859-ea7a-581c-b7b3-20c7c36fbef1',
  '1c4c18ea-75b0-5860-a4c0-da88c8284de1',
  'c24fdd86-bfe7-5517-80c9-7c72fc1b78e6',
  '723c6c66-2013-52d9-912a-e18ba5f494be',
  'f8dcb1be-415b-5a0d-a27d-b247aceec83c',
  '139d6056-5e1a-56dd-925f-7bf0095ed02a',
  '508e0cf4-166a-5504-9967-800605b6e501',
  'c21cd3ab-6c41-5da2-866a-d6868968a9fe',
  '1e53400b-9991-5665-8a01-87a8f82a734e',
  '6fe74cdd-bb72-56dd-96f6-96296919c213',
  'cb73aa84-f1fe-533c-a82d-53abc411e5f3',
  'ffa49f3a-f793-5e0d-bf69-51e0feefa398',
  '9945eb70-84d5-5bb1-a2c8-5da83528c118',
  '04c4ca58-b52e-5fae-85b2-bf4e62b9995b',
  'f64a2eff-b979-569e-8c0c-323a102ba3df',
  '9da40946-a713-5f9d-b535-336437a4e516',
  '253a25ba-8d29-5fe1-8e90-d89f8592d19b',
  'f3fc775f-41c4-5839-ad35-1b59e2444688',
  '8b6df219-f09b-5cbe-8388-7af2fec709d4',
  'aedb95b6-c00c-5961-83d8-4b45a98fab09',
  'fde310f4-52c1-5697-8a62-0a4c7a93246a',
  '60db16d2-fd4d-5c9a-8bfd-e2d45dec9209',
  '56a914a7-7427-559d-aac4-015f29d25d3d',
  '550852b2-e027-5b81-b7f8-55a93e075db2',
  'fd937e7e-8870-5f87-8878-14e0b0576f5f',
  'fbbe08a0-3499-53d7-b25c-98bc4a32a654',
  '7284bdad-07e7-578a-8406-f6adb4fbdf74',
  '7b5e3756-21b0-526e-9ccc-b362edb25271',
  '6348a10e-0978-5135-8735-d1bd95f9e839',
  '3f886b6b-efb1-509b-afb3-d093bd06d764',
  '18a20704-1a10-5ee8-a30a-41e6e3b9335e',
  '2aaeeab0-af1b-559d-9132-350d4f799bea',
  'da202060-a07e-5537-a30f-705328987f23',
  'c6c6bc4d-6680-58ee-931b-eadac6004996',
  'be91937a-0f28-5baf-8c0c-a71f15f7aebf',
  '6092f820-1cc0-5d70-87cc-d2a3655269f0',
  'a35b637f-1cf5-55eb-88f0-f435f7d7f7c6',
  '457840e2-fd66-55e7-8feb-a4c514c790dc',
  'b1ddd583-7865-5f5a-a3b1-a95d3b48d2f7',
  '31832287-bba1-58b1-b79f-85944a545c8c',
  'fdba4f2b-6f1a-584e-93ef-0826f06ff122',
  '8a981df4-9407-564b-88cd-91de3524c503',
  '605ddef9-4be1-5f01-a746-7e3ab8c2fbb8',
  '27d873c8-c3c8-53dc-961c-3d97f4433f5a',
  '2b3c3823-8bc1-57cc-a7dd-565837268555',
  '639d0ae6-36b0-5076-ad27-c2f167538c60',
  '8bd5e73a-6a97-5fd1-ac69-ce6579057d4e',
  'db0981ac-76ff-5391-9697-1053bc478c2d',
  '61a1accd-36c5-569e-8d22-1c8e924885cb',
  '3b30a093-ac00-5c56-b827-aafc6df76976',
  '99f4df5e-c43a-5d04-8e2a-fcf72d198d12',
  '72852739-93ca-529f-97d1-6b25b427f7ba',
  'b80fdde6-1415-5c21-a403-4d041d3e3725',
  '6de19b27-cdba-5e33-8370-9bf95531e03a',
  'd4b93f8a-a500-54e7-99f6-ceaad4541ca8',
  'aabce1e5-881f-5f12-9cd3-5a7584f2eb8b',
  '96f48770-d25b-50a2-955c-04ddd1de7179',
  '2b4ffb1a-c542-5bb7-b8d1-f65eaa5f854e',
  'cf14ffc9-9235-560e-86c0-ff38782ae80e',
  'ad5d488c-24e6-5260-922e-da3cb849e5ad',
  '2a704806-a630-5eca-9e12-7721a72df65a',
  '1f26ebd8-b763-55bd-9e6b-dbb152ef4edc',
  'fbc48cd0-fd97-5fd7-840c-3f0817ce4e7c',
  '619803b5-6d38-5e50-9257-ec36b13875bb',
  '975aad93-0020-53ce-a808-b1d79cc7c56a',
  '3737fa7a-ce5f-54be-a2be-44df442c02d0',
  '43ecbb85-e30a-5bea-a7f0-9faa1abfc39e',
  '91a8e5ad-b732-5ab8-8d6e-fc86adcaedb0',
  '48d70219-b44f-5796-8008-6b514be19702',
  'b1388ddb-6bd8-5a61-b390-88cf9fb74772',
  '314e2623-6a56-579e-8f54-7f9cf7961b6e',
  'ed4c4393-9cce-5cc5-88a5-22fb0ebbda1a',
  '909e1a80-c869-5339-8302-f7cf4cbaaa4d',
  '844c1d75-bab2-5e5f-99f9-5c66e30b7989',
  '94271fb5-068f-5051-9f89-328ebad59ad4',
  '47fe781f-fda3-58cc-89c5-fb98d29e4158',
  '9ccd3ca2-92e5-5e52-ac8b-c8b42359453c',
  'd244e2f9-07ba-5c33-8ad2-3841f9343850',
  '88acda3c-acf2-5bc7-a1f3-b1af4cfb8e7d',
  'c85316f4-0ff2-57e8-a940-18c0e0cc5e58',
  'b0fe770b-1a25-5f19-8469-2979135f782c',
  '9d35a084-a237-5024-98ed-9929dcf6bf0d',
  '5d1ecba6-6b77-50e3-a41e-5b385694c9f1',
  'b08e2b43-b810-5601-949c-55f2c6a7fd1d',
  '3fc32bf3-062b-5b82-9867-034350c6bdae',
  '573cab70-3a1e-5778-bbf6-0a5c380342d5',
  '5bb17aeb-e0fa-5454-bb08-483806c72a42',
  '0aefd481-d5c0-502a-b336-3d8d01d49bc6',
  'c81e3ff3-202c-595c-a685-bfe54b9951ac',
  '3d4320e6-0d30-5f70-a6da-bcd1801cd714',
  '7e0856f2-ff9c-5204-8b1f-f75945fe5c88',
  '4afb44ab-94c5-5665-8164-c28982e1cbf9',
  '8a5f3421-e0ed-5b11-a291-09f504470c14',
  '818802f3-887c-597b-bd65-cf7e817030a2',
  'f2c617a6-d8b6-5fcd-9281-3b3a34241784',
  '017287aa-3523-5e51-beb1-37af5139f891',
  'd8dcb9e8-40a1-5d13-b616-fa438eb8e252',
  'b0b9fe28-13c8-5e03-9770-6b671c705c4c',
  '0b455aa3-27bd-5f85-a273-0ad218e89a47',
  '362584ca-a2ac-5e71-8a42-66fea8b8fd1d',
  '1de6930b-f385-54be-8ff9-bc7036d10b66',
  '8005e8ae-33fd-5b9a-94d3-b1995aebd499',
  'e43c4c9f-a761-54ff-b018-b46d2ec9a021',
  'd94eaaa1-723e-544b-a987-f078c3519e3d',
  '0f2a3630-0939-5c06-a82d-a7b793b79626',
  'fb245cac-c30b-58a2-b330-b2db20d48914',
  'df656123-6251-5cbf-a24a-be38a810f473',
  '0afddecd-e17c-5278-9f5a-7875d859dffc',
  '3b88b643-f26a-5e07-9f8c-5c48a0e3a312',
  '394fa9eb-09cd-599f-83b4-d747dffc68f7',
  'a541ee30-0b65-5f8a-bc6b-526193526e1d',
  '070a28af-8bcc-5b48-8879-3a985f838d29',
  '07fed25b-0f81-5b24-b18c-3c9ed0ba761c',
  '0275b0a8-e7fc-588f-ac84-8fde758d84e2',
  '45734b57-6cb8-5edf-9314-120204656309',
  '497eda66-43ef-5bc3-90fd-87104ceb3ba9',
  'e94a7904-a8ca-51a0-ad10-a5568582053c',
  '253c78cd-7cd0-5093-bcf6-e657214db265',
  'e21c4dfb-b9b7-5f7b-9184-bc879ca65d2d',
  '6900e8cd-9ac8-549e-86a8-f60177bfc8ee',
  'b8b2dff5-ff17-5648-b548-be10885284a0',
  '6c0c9ee9-8eff-58e7-90b3-dcbf525aa7fe',
  '26411265-55a6-55ba-840f-81e49dccd74a',
  'a7671ce2-d176-511b-8b2a-1147fb4a9f51',
  '5f7b1fea-f660-54f3-84c1-63f4dbe4932e',
  '057c5f7f-5aef-5ebc-9406-3d6ccd8b4b43',
  '599743fe-1987-583c-8234-6f4eaafbbe8f',
  'ddae9eca-8b5d-558a-89e1-5f72c6d6e4ef',
  '35d3b371-d6a6-5ff4-aa52-da2873a868f0',
  '8a6fcaa9-5961-52dc-aa9f-e1a7b9d2b79e',
  'cbc068de-7ddc-5835-a884-35ea279f4344',
  '9c4f7f55-8552-5e3d-8ed8-c8472dee6a8d',
  '72b3c1d7-4291-5c43-b47d-ee032bd9dac6',
  '48b7c8fc-49dd-541f-a741-72141c41b899',
  '37c6182f-f0f9-5036-857e-6305d4840da5',
  'ed60e18a-d1f2-5bc0-b878-a0671b594065',
  '72cb4009-9060-5f08-98b5-aedca8d9769b',
  '96caafcd-0adb-5663-81d3-872ccd2e09de',
  '9d2ade05-fc68-5551-a21f-70197861b369',
  'bbca039c-4aa2-5264-ae53-9a8df2487980',
  '30c16c11-74f1-5bef-ae7c-e49d3088f8eb',
  '4226ad76-7457-519a-8012-88fdd68e2c03',
  'd299d8c9-73cc-5b4c-9410-052fb04628ef',
  '9c8fc35f-b8a0-50cc-81ec-46381313bba3',
  '26f94745-3419-5e68-9d20-32374c86c93b',
  '411d3f41-15b1-5603-a4c5-aea2d3219675',
  'a9e096b4-f270-590f-8c26-6033fc3aa136',
  '235bc77f-d55b-5df0-8f0b-36245dcf7e81',
  '4ce822a7-d1e1-5b6d-b25d-f3adf17d9a30',
  'a66f0f8a-2167-57f3-995d-decaf17926ee',
  '3fd14eee-01b6-5ae9-aa0d-ba598241b9a8',
  'b1c6ca43-2f11-54fe-b8c8-fb7545c40cdd',
  '2800bada-5f8e-5508-a63f-533555f1e98c',
  'b60844d3-9540-578b-8439-b3c6bae4278a',
  '5f5133ec-29db-58aa-a65b-822608ce98e2',
  'f9ab597d-73c0-597f-a46f-e6e5ff78b88c',
  'f31e981f-c243-5908-959d-ffea3eb12214',
  '3eac3cf6-6cb4-55b9-b34d-13f8b671eae8',
  '1d1b9f22-5a99-5dc7-a130-910aa6d9abe9',
  'a1880afc-5e4a-572b-955d-bfa281c19b48',
  '92b00a52-4a02-5494-a94d-5227160ac73a',
  'b609c206-9cd3-56d5-a2d2-1436c80a6b98',
  '9e85b891-eea5-50c6-9dac-dc963823f8c0',
  'fdd7aeaa-5208-5899-8330-d40f23ec23f8',
  '914c1243-b1da-55b8-b405-043ba39a4ce8',
  '0c520951-5fec-5450-83c5-5e9c89361d10',
  '49451f2a-8d8f-5ac9-8214-999510af5643',
  'd92f00c3-91cd-5654-9203-fd75cda477aa',
  '7c6cbbe0-de23-5084-ad21-c5f96c84aeae',
  '59e9d797-7d1a-5a22-8e64-66fbc7afb59b',
  '8f7d37d6-f2bc-5f9d-9ed5-9056d103d01a',
  '3a421c64-714d-54ad-94fc-b980fd70ce10',
  'cbe52ec3-8258-5f20-bdd7-8277e8993f79',
  'f2fdfb41-63e5-521c-a502-f2830d04e5bf',
  '1c98033d-b468-532f-b40d-614d2b486bae',
  '16ba787c-e79a-5692-a645-2c7663983ffc',
];

// ── Data helpers ──
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

// LCG seeded random — seed 99999 matches original driver offset
let rngState = 99999;
function lcgRand() {
  rngState = (rngState * 1664525 + 1013904223) & 0xffffffff;
  return (rngState >>> 0) / 0xffffffff;
}
function pick(arr) { return arr[Math.floor(lcgRand() * arr.length)]; }
function randInt(min, max) { return min + Math.floor(lcgRand() * (max - min + 1)); }

function fullName(idx) {
  if (idx % 6 === 0) return `${pick(TAMIL_FIRST)} ${pick(TAMIL_LAST)}`;
  return `${pick(SINHALA_FIRST)} ${pick(SINHALA_LAST)}`;
}

function syntheticNIC(idx) {
  const yy  = String(60 + ((idx + 300) % 39)).padStart(2, '0');
  const ddd = String(1  + ((idx + 300) % 365)).padStart(3, '0');
  const seq = String(2000 + (idx % 7999));
  return `${yy}${ddd}${seq}V`;
}

function phone(idx) {
  const prefixes = ['71','72','77','78','76','75','70'];
  return `+94${prefixes[(idx + 3) % prefixes.length]}${String(randInt(1000000, 9999999))}`;
}

function syntheticLicense(idx) {
  const letters = 'BCDFGHJKLMNPRSTUVWXYZ';
  return `${letters[idx % letters.length]}${String(1000000 + idx).padStart(7, '0')}`;
}

// ── Generate drivers ───
console.log('\nEncrypting driver PII fields...\n');

const drivers = [];
for (let i = 1; i <= 200; i++) {
  const distName = DISTRICT_NAMES[(i - 1) % DISTRICT_NAMES.length];
  const dobYear = 1970 + (i % 28);
  const dobMonth = String(1 + (i % 12)).padStart(2, '0');
  const dobDay = String(1 + (i % 28)).padStart(2, '0');
  const expYear = 2025 + (i % 6);
  const expMonth = String(1 + (i % 12)).padStart(2, '0');
  const gender = (i % 5 === 0) ? 'FEMALE' : 'MALE';
  const houseNo = randInt(1, 200);

  const plainNIC = syntheticNIC(i);
  const plainPhone = phone(i);
  const plainAddress = `No.${houseNo}, Main Street, ${distName}`;
  const plainLicense = syntheticLicense(i);

  drivers.push({
    driver_id:           DRIVER_UUIDS[i - 1],
    driver_fullname:     fullName(i),
    driver_identity_no:  encrypt(plainNIC),
    driver_id_type:      'NIC',
    date_of_birth:       `${dobYear}-${dobMonth}-${dobDay}`,
    driver_gender:       gender,
    driver_contact_no:   encrypt(plainPhone),
    address:             encrypt(plainAddress),
    driver_license_no:   encrypt(plainLicense),
    license_expiry_date: `${expYear}-${expMonth}-28`,
    status:              (i % 20 === 0) ? 'SUSPENDED' : 'ACTIVE',
  });
}

console.log('Sample (first 3):');
drivers.slice(0, 3).forEach((d, idx) => {
  console.log(`[${idx+1}] UUID: ${d.driver_id}`);
  console.log(`License ciphertext: ${d.driver_license_no.slice(0, 45)}...`);
});
console.log(`\nTotal: ${drivers.length} drivers\n`);

// ── Write seed file ───
function toJsValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean')        return v ? 'true' : 'false';
  if (typeof v === 'number')         return String(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const rows = drivers.map(d => {
  const pairs = Object.entries(d).map(([k, v]) => `      ${k}: ${toJsValue(v)}`).join(',\n');
  return `    {\n${pairs},\n    }`;
}).join(',\n');

const output = `// db/seeds/09_drivers_seed.js
// 200 synthetic tuk-tuk drivers.
//
// PDPA Compliance — encrypted at rest with AES-256-GCM:
//   driver_identity_no  (NIC number)
//   driver_contact_no   (phone number)
//   address             (residential address)
//   driver_license_no   (driving licence number)
//
// UUIDs match 10_assignments.js driver_id foreign keys exactly.
// Service layer decrypts before returning API responses.
// Regenerate: node scripts/encrypt_drivers_seed.js

export async function seed(knex) {
  await knex('drivers').del();

  const rows = [
${rows}
  ];

  for (let i = 0; i < rows.length; i += 50) {
    await knex('drivers').insert(rows.slice(i, i + 50));
  }

  console.log(\`Drivers seeded: \${rows.length} records\`);
}
`;

const outPath = path.join(__dirname, '..', 'db', 'seeds', '09_drivers_seed.js');
fs.writeFileSync(outPath, output, 'utf8');
console.log('Written: db/seeds/09_drivers_seed.js');
console.log('UUIDs preserved — assignment FK relationships intact.\n');