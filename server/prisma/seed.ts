import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const CIPHER_ALGO = "aes-256-gcm";
const PKI_KEY_ENCRYPTION_SECRET = process.env.PKI_KEY_ENCRYPTION_SECRET || "default-pki-secret-key-32chars!";

function encryptPrivateKey(privateKeyPem: string): string {
  const iv = crypto.randomBytes(12);
  const key = crypto
    .createHash("sha256")
    .update(PKI_KEY_ENCRYPTION_SECRET)
    .digest();
  const cipher = crypto.createCipheriv(CIPHER_ALGO, key, iv);

  let encrypted = cipher.update(privateKeyPem, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function generateEcdsaKeypair() {
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
  return { publicKey, privateKey };
}

async function main() {
  console.log("[SEED] Initializing Legal Metrology database...");

  // Password for admin: Password@123
  const passwordHash = await bcrypt.hash("Password@123", 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@metrology.gov.in" },
    update: {},
    create: {
      email: "admin@metrology.gov.in",
      phone: "9876543210",
      name: "S. K. Sharma (Joint Controller)",
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`[SEED] Admin account ready: ${admin.email}`);

  // 2. Ensure Root PKI Signing Key exists
  const activeKey = await prisma.signingKey.findFirst({
    where: { isActive: true },
  });

  if (!activeKey) {
    const { publicKey, privateKey } = generateEcdsaKeypair();
    const encryptedKey = encryptPrivateKey(privateKey);
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 2);

    await prisma.signingKey.create({
      data: {
        keyVersion: "v1-2026",
        algorithm: "ECDSA_P256",
        publicKey,
        privateKeyEncrypted: encryptedKey,
        isActive: true,
        validUntil,
      },
    });
    console.log("[SEED] Initialized Root PKI ECDSA Signing Key (v1-2026)");
  } else {
    console.log(`[SEED] Active Root PKI key found: ${activeKey.keyVersion}`);
  }

  console.log("[SEED] Seeding completed successfully (Admin & PKI only).");
}

main()
  .catch((e) => {
    console.error("[ERROR] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
