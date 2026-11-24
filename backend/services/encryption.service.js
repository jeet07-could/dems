// Cybersecurity Service: AES-256-GCM Authenticated Encryption for Evidence at Rest.
// Ensures evidence confidentiality, integrity, and non-tamper guarantees.
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;         // 128-bit IV
const TAG_LENGTH = 16;        // 128-bit Authentication Tag
const KEY_LENGTH = 32;        // 256-bit Key

// Derive or load master key from environment, with deterministic secure fallback for demo
function getMasterKey() {
  const secret = process.env.EVIDENCE_ENCRYPTION_KEY || 'dems-master-evidence-encryption-key-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a binary buffer using AES-256-GCM with authenticated tag
 * @param {Buffer} buffer - Raw file bytes
 * @returns {{ ciphertext: Buffer, iv: string, authTag: string }}
 */
export function encryptEvidence(buffer) {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts and verifies authenticity of evidence bytes
 * If the ciphertext or tag has been tampered with, throws an integrity error
 * @param {Buffer} ciphertext
 * @param {string} ivHex
 * @param {string} authTagHex
 * @returns {Buffer} original plaintext buffer
 */
export function decryptEvidence(ciphertext, ivHex, authTagHex) {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted;
}

/**
 * Computes HMAC-SHA256 digital signature of evidence metadata
 */
export function signEvidenceMetadata(metadata) {
  const key = getMasterKey();
  const data = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verifies HMAC-SHA256 signature
 */
export function verifyEvidenceSignature(metadata, signature) {
  const expected = signEvidenceMetadata(metadata);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}
