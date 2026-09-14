import crypto from "crypto";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { logger } from "../config/logger";
import { CanonicalCertificatePayload } from "@sih/shared";

const ALGORITHM = "ECDSA_P256";
const CIPHER_ALGO = "aes-256-gcm";

/**
 * Encrypt private key string for at-rest storage in database
 */
export function encryptPrivateKey(privateKeyPem: string): string {
  const iv = crypto.randomBytes(12);
  const key = crypto
    .createHash("sha256")
    .update(env.PKI_KEY_ENCRYPTION_SECRET)
    .digest();
  const cipher = crypto.createCipheriv(CIPHER_ALGO, key, iv);

  let encrypted = cipher.update(privateKeyPem, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt private key string from encrypted database representation
 */
export function decryptPrivateKey(encryptedRecord: string): string {
  const parts = encryptedRecord.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted private key format");
  }
  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = crypto
    .createHash("sha256")
    .update(env.PKI_KEY_ENCRYPTION_SECRET)
    .digest();

  const decipher = crypto.createDecipheriv(CIPHER_ALGO, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate a new ECDSA prime256v1 (P-256) keypair
 */
export function generateEcdsaKeypair(): {
  publicKeyPem: string;
  privateKeyPem: string;
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
  };
}

/**
 * Produce deterministic, canonical JSON representation
 * Keys are sorted recursively so identical payloads produce identical hashes
 */
export function canonicalizePayload(obj: Record<string, any>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Sign canonical payload using ECDSA P-256 private key
 * Returns base64 encoded signature
 */
export function signPayload(canonicalJson: string, privateKeyPem: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(canonicalJson);
  sign.end();
  return sign.sign(privateKeyPem, "base64");
}

/**
 * Verify signature against canonical payload using public key
 */
export function verifySignature(
  canonicalJson: string,
  signatureBase64: string,
  publicKeyPem: string
): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(canonicalJson);
    verify.end();
    return verify.verify(publicKeyPem, signatureBase64, "base64");
  } catch (err) {
    logger.error({ err }, "Cryptographic signature verification encountered error");
    return false;
  }
}

/**
 * Get or bootstrap active signing key from database
 */
export async function getActiveSigningKey(): Promise<{
  id: string;
  keyVersion: string;
  publicKeyPem: string;
  privateKeyPem: string;
}> {
  let keyRecord = await prisma.signingKey.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!keyRecord) {
    logger.info("No active PKI signing key found. Generating root signing key...");
    const { publicKeyPem, privateKeyPem } = generateEcdsaKeypair();
    const encryptedPrivate = encryptPrivateKey(privateKeyPem);
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 2); // 2-year lifecycle

    keyRecord = await prisma.signingKey.create({
      data: {
        keyVersion: env.PKI_ACTIVE_KEY_VERSION,
        algorithm: ALGORITHM,
        publicKey: publicKeyPem,
        privateKeyEncrypted: encryptedPrivate,
        isActive: true,
        validUntil,
      },
    });
    logger.info(`Initialized PKI root signing key version ${keyRecord.keyVersion}`);
  }

  const decryptedPrivate = decryptPrivateKey(keyRecord.privateKeyEncrypted);

  return {
    id: keyRecord.id,
    keyVersion: keyRecord.keyVersion,
    publicKeyPem: keyRecord.publicKey,
    privateKeyPem: decryptedPrivate,
  };
}

