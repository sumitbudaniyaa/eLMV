import { PrismaClient, Role, StakeholderType, InstrumentType, ApplicationType, ApplicationStatus } from "@prisma/client";
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
  console.log("[SEED] Seeding Legal Metrology database (Jaipur, Rajasthan)...");

  // Password for all seed users: Password@123
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
  console.log(`[SEED] Seeded Admin: ${admin.email}`);

  // 2. Seed Legal Metrology Officer (LMO) — Jaipur, Rajasthan
  const lmo = await prisma.user.upsert({
    where: { email: "lmo.jaipur@metrology.gov.in" },
    update: {},
    create: {
      email: "lmo.jaipur@metrology.gov.in",
      phone: "9876543211",
      name: "Inspector Ananya Sharma (LMO Jaipur)",
      passwordHash,
      role: Role.LMO,
      isVerified: true,
      isActive: true,
      officerProfile: {
        create: {
          badgeNumber: "RJ-LMO-2024-089",
          jurisdictionDistrict: "Jaipur",
          jurisdictionState: "Rajasthan",
          jurisdictionZone: "North Zone",
          officeAddress: "Legal Metrology Bhavan, Tonk Road, Jaipur - 302015",
        },
      },
    },
  });
  console.log(`[SEED] Seeded LMO: ${lmo.email}`);

  // 3. Seed Government Approved Test Centre (GATC) Agency Admin — Jaipur, Rajasthan
  const gatcUser = await prisma.user.upsert({
    where: { email: "gatc.lead@precisionlab.org" },
    update: {},
    create: {
      email: "gatc.lead@precisionlab.org",
      phone: "9876543212",
      name: "Dr. Vikram Seth (Apex Metrology GATC)",
      passwordHash,
      role: Role.GATC_ADMIN,
      isVerified: true,
      isActive: true,
      gatcProfile: {
        create: {
          agencyName: "Apex Precision Metrology & Calibration Labs Ltd.",
          accreditationNumber: "NABL-LM-RJ-2024-041",
          notificationRefNumber: "GOI-DOCA-LM/2023/GATC-041",
          authorizedScope: ["NON_AUTOMATIC_WEIGHING_INSTRUMENT", "FUEL_DISPENSER"],
          validUntil: new Date("2028-12-31"),
          district: "Jaipur",
          state: "Rajasthan",
          address: "Plot 12, Sitapura Industrial Area, Jaipur",
        },
      },
    },
    include: { gatcProfile: true },
  });
  console.log(`[SEED] Seeded GATC Agency: ${gatcUser.email}`);

  // 3b. Seed GATC Field Inspector under Apex Metrology
  const gatcProfile = gatcUser.gatcProfile || await prisma.gATCProfile.findUnique({ where: { userId: gatcUser.id } });
  if (gatcProfile) {
    const gatcInspector = await prisma.user.upsert({
      where: { email: "inspector.rahul@precisionlab.org" },
      update: {},
      create: {
        email: "inspector.rahul@precisionlab.org",
        phone: "9876543214",
        name: "Rahul Verma (Field Inspector, Apex GATC)",
        passwordHash,
        role: Role.GATC_INSPECTOR,
        isVerified: true,
        isActive: true,
        gatcInspectorProfile: {
          create: {
            gatcProfileId: gatcProfile.id,
            employeeId: "APEX-INSP-041-01",
            designation: "Senior Calibration & Testing Engineer",
            qualificationRef: "NABL-CAL-MET-2022-881",
            authorizedScope: ["NON_AUTOMATIC_WEIGHING_INSTRUMENT", "FUEL_DISPENSER"],
          },
        },
      },
    });
    console.log(`[SEED] Seeded GATC Inspector: ${gatcInspector.email}`);
  }

  // 4. Seed Consumer / Commercial Trader User — Jaipur, Rajasthan
  const consumer = await prisma.user.upsert({
    where: { email: "trader.rajesh@shreestores.com" },
    update: {},
    create: {
      email: "trader.rajesh@shreestores.com",
      phone: "9876543213",
      name: "Rajesh Kumar (Shree Provision Stores)",
      passwordHash,
      role: Role.CONSUMER,
      isVerified: true,
      isActive: true,
      stakeholderProfile: {
        create: {
          type: StakeholderType.COMMERCIAL_USER,
          businessName: "Shree Provision Stores Pvt Ltd",
          tradeLicenseNumber: "TL-JMC-2023-9942",
          gstin: "08AABCS1429B1ZB",
          district: "Jaipur",
          state: "Rajasthan",
          address: "No. 45, Johari Bazaar, Pink City",
          pincode: "302003",
        },
      },
    },
  });
  console.log(`[SEED] Seeded Consumer: ${consumer.email}`);

  // 5. Seed Root PKI Signing Key
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
    console.log("[SEED] Seeded Root PKI ECDSA Signing Key (v1-2026)");
  }

  // 6. Seed Instruments for Consumer — Jaipur, Rajasthan
  const instrument1 = await prisma.instrument.upsert({
    where: { serialNumber: "ESSAE-DS-2025-00892" },
    update: {},
    create: {
      ownerId: consumer.id,
      type: InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT,
      category: "NAWI-ClassIII",
      make: "Essae-Teraoka",
      model: "DS-252",
      serialNumber: "ESSAE-DS-2025-00892",
      capacity: 30.0,
      unit: "kg",
      accuracyClass: "Class III",
      verificationInterval: 12,
      installationAddress: "No. 45, Counter 1, Johari Bazaar",
      district: "Jaipur",
      state: "Rajasthan",
      pincode: "302003",
    },
  });

  const instrument2 = await prisma.instrument.upsert({
    where: { serialNumber: "METTLER-TOLEDO-PB3002" },
    update: {},
    create: {
      ownerId: consumer.id,
      type: InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT,
      category: "NAWI-ClassII",
      make: "Mettler Toledo",
      model: "Precision Balance PB-3002",
      serialNumber: "METTLER-TOLEDO-PB3002",
      capacity: 3100.0,
      unit: "g",
      accuracyClass: "Class II",
      verificationInterval: 12,
      installationAddress: "No. 45, Testing Lab, Johari Bazaar",
      district: "Jaipur",
      state: "Rajasthan",
      pincode: "302003",
    },
  });
  console.log(`[SEED] Seeded Instruments: ${instrument1.serialNumber}, ${instrument2.serialNumber}`);

  // 7. Seed Applications & Certified Verification Record
  const keyRecord = await prisma.signingKey.findFirst({ where: { isActive: true } });

  function decryptKey(encryptedRecord: string): string {
    const parts = encryptedRecord.split(":");
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = crypto.createHash("sha256").update(PKI_KEY_ENCRYPTION_SECRET).digest();
    const decipher = crypto.createDecipheriv(CIPHER_ALGO, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Application 1: CERTIFIED
  const app1 = await prisma.application.upsert({
    where: { applicationNumber: "LM-APP-2026-0000001" },
    update: {},
    create: {
      applicationNumber: "LM-APP-2026-0000001",
      instrumentId: instrument1.id,
      applicantId: consumer.id,
      assignedOfficerId: lmo.id,
      type: ApplicationType.RE_VERIFICATION,
      status: ApplicationStatus.CERTIFIED,
      feeAmount: 500.0,
      feePaid: true,
      feeReceiptNumber: "REC-JMC-2026-8812",
      scheduledDate: new Date(),
    },
  });

  // Inspection for App 1
  const inspection1 = await prisma.inspectionRecord.upsert({
    where: { applicationId: app1.id },
    update: {},
    create: {
      applicationId: app1.id,
      officerId: lmo.id,
      result: "PASSED",
      observations: {
        visualCheck: "Compliant",
        eccentricityTest: "0.02g error within limit",
        repeatabilityTest: "Consistent within 0.01g",
      },
      standardsUsed: ["Working Class F2 Weights (Set #901)"],
      maxPermissibleError: 15.0,
      actualErrorObserved: 4.2,
      sealNumber: "STAMP-RJ-2026-9812",
      remarks: "Statutory physical stamping completed per Section 24.",
    },
  });

  // Certificate for App 1
  if (keyRecord) {
    const certNumber = "LM-RJ-2026-0000001";
    const existingCert = await prisma.certificate.findUnique({ where: { certificateNumber: certNumber } });

    if (!existingCert) {
      const issuedAt = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      const canonicalObj = {
        accuracyClass: instrument1.accuracyClass,
        actualErrorObserved: inspection1.actualErrorObserved,
        applicationNumber: app1.applicationNumber,
        capacity: instrument1.capacity,
        certificateNumber: certNumber,
        issuedAt: issuedAt.toISOString(),
        keyVersion: keyRecord.keyVersion,
        make: instrument1.make,
        maxPermissibleError: inspection1.maxPermissibleError,
        model: instrument1.model,
        ownerName: consumer.name,
        sealNumber: inspection1.sealNumber,
        serialNumber: instrument1.serialNumber,
        unit: instrument1.unit,
        validUntil: validUntil.toISOString(),
        verifyingOfficer: lmo.name,
      };

      const canonicalJson = JSON.stringify(canonicalObj, Object.keys(canonicalObj).sort());
      const privateKeyPem = decryptKey(keyRecord.privateKeyEncrypted);

      const sign = crypto.createSign("SHA256");
      sign.update(canonicalJson);
      sign.end();
      const signature = sign.sign(privateKeyPem, "base64");
      const qrToken = crypto.randomBytes(32).toString("hex");

      await prisma.certificate.create({
        data: {
          certificateNumber: certNumber,
          applicationId: app1.id,
          signingKeyId: keyRecord.id,
          signingKeyVersion: keyRecord.keyVersion,
          canonicalPayload: canonicalJson,
          signature,
          qrToken,
          issuedAt,
          validUntil,
        },
      });
      console.log(`[SEED] Seeded Authenticated Certificate: ${certNumber} (Token: ${qrToken})`);
    }
  }

  // Application 2: SCHEDULED (due for inspection tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 30, 0, 0);

  await prisma.application.upsert({
    where: { applicationNumber: "LM-APP-2026-0000002" },
    update: {},
    create: {
      applicationNumber: "LM-APP-2026-0000002",
      instrumentId: instrument2.id,
      applicantId: consumer.id,
      assignedOfficerId: lmo.id,
      type: ApplicationType.NEW,
      status: ApplicationStatus.SCHEDULED,
      feeAmount: 750.0,
      feePaid: true,
      feeReceiptNumber: "REC-JMC-2026-8813",
      scheduledDate: tomorrow,
    },
  });

  console.log("[SEED] Seeded Application 2 (SCHEDULED for physical testing)");
  console.log("[SEED] Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("[ERROR] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
