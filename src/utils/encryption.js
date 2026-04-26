// AES-256-GCM symmetric encryption for PII fields stored at rest.
// ENCRYPTION_KEY must be a 32-byte (256-bit) hex string in .env
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Format of encrypted output: base64(iv):base64(authTag):base64(ciphertext)
// All three components are needed for decryption.

import crypto from 'crypto';

const ALGORITHM  = 'aes-256-gcm';
const IV_LENGTH  = 12;
const TAG_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypts a plain text string.
 * Returns: "base64iv:base64tag:base64ciphertext"
 */
export function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;

  const key        = getKey();
  const iv         = crypto.randomBytes(IV_LENGTH);
  const cipher     = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted  = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);
  const authTag    = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a ciphertext string produced by encrypt().
 * Returns the original plain text string.
 */
export function decrypt(ciphertext) {
  if (ciphertext === null || ciphertext === undefined) return null;

  const [ivB64, tagB64, dataB64] = ciphertext.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid ciphertext format. Expected "iv:tag:data".');
  }

  const key      = getKey();
  const iv       = Buffer.from(ivB64, 'base64');
  const authTag  = Buffer.from(tagB64, 'base64');
  const data     = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Decrypts all encrypted PII fields in a row object.
 * Pass the field names that are encrypted.
 * Returns a new object with decrypted values — does not mutate the original.
 */
export function decryptFields(row, fields) {
  if (!row) return row;
  const result = { ...row };
  for (const field of fields) {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  }
  return result;
}

// Fields encrypted per table — export so service layer can reference consistently
export const ENCRYPTED_FIELDS = {
  owners:  ['owner_identity_no', 'owner_contact', 'owner_address'],
  drivers: ['driver_identity_no', 'driver_contact_no', 'address', 'driver_license_no'],
  users:   ['contact_no'],
};