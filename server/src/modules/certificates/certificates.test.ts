import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../config/database";
import { ApplicationStatus, InspectionResult } from "@sih/shared";

describe("Certificates & Public Verification Module", () => {
  let officerToken: string;
  let applicationId: string;
  let certificateNumber: string;
  let qrToken: string;

  beforeAll(async () => {
    // 1. Authenticate as LMO officer
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "lmo.jaipur@metrology.gov.in",
        password: "Password@123",
      });

    officerToken = loginRes.body.data.tokens.accessToken;

    // 2. Fetch a seeded instrument
    const instrument = await prisma.instrument.findFirst({
      where: { serialNumber: "ESSAE-DS-2025-00892" },
    });

    const consumer = await prisma.user.findFirst({
      where: { email: "trader.rajesh@shreestores.com" },
    });

    // 3. Create an application in INSPECTED status
    const testApp = await prisma.application.create({
      data: {
        applicationNumber: `APP-TEST-${Date.now()}`,
        instrumentId: instrument!.id,
        applicantId: consumer!.id,
        status: ApplicationStatus.INSPECTED,
        inspectionRecord: {
          create: {
            officerId: loginRes.body.data.user.id,
            result: InspectionResult.PASSED,
            observations: { linearity: "Pass", repeatability: "Pass" },
            standardsUsed: ["STD-01"],
            maxPermissibleError: 1.5,
            actualErrorObserved: 0.4,
            photoUrls: ["https://example.com/photo.jpg"],
            sealNumber: "SEAL-TEST-99",
          },
        },
      },
    });

    applicationId = testApp.id;
  });

  afterAll(async () => {
    // Cleanup test records
    await prisma.certificate.deleteMany({ where: { applicationId } });
    await prisma.inspectionRecord.deleteMany({ where: { applicationId } });
    await prisma.application.deleteMany({ where: { id: applicationId } });
    await prisma.$disconnect();
  });

  it("POST /api/v1/certificates/issue — should generate PKI-signed certificate and stamped PDF", async () => {
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const res = await request(app)
      .post("/api/v1/certificates/issue")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        applicationId,
        validUntil: validUntil.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateNumber).toBeDefined();
    expect(res.body.data.signature).toBeDefined();
    expect(res.body.data.qrToken).toBeDefined();

    certificateNumber = res.body.data.certificateNumber;
    qrToken = res.body.data.qrToken;
  });

  it("GET /api/v1/verification/verify/:qrToken — PUBLIC endpoint should cryptographically validate signature", async () => {
    // Note: NO authorization header passed!
    const res = await request(app).get(`/api/v1/verification/verify/${qrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isSignatureValid).toBe(true);
    expect(res.body.data.verificationStatus).toBe("VALID_AND_ACTIVE");
    expect(res.body.data.instrument.serialNumber).toBe("ESSAE-DS-2025-00892");
    expect(res.body.data.cryptographicDetails.algorithm).toBe("ECDSA_P256");
  });

  it("GET /api/v1/verification/verify/:certNumber — should verify by certificate number", async () => {
    const res = await request(app).get(`/api/v1/verification/verify/${certificateNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isSignatureValid).toBe(true);
  });

  it("Tamper Detection: altering canonicalPayload in DB should cause cryptographic signature validation to FAIL", async () => {
    // Simulate database tampering
    const cert = await prisma.certificate.findUnique({ where: { qrToken } });
    const tamperedPayload = cert!.canonicalPayload.replace("0.4", "9.9");

    await prisma.certificate.update({
      where: { qrToken },
      data: { canonicalPayload: tamperedPayload },
    });

    const res = await request(app).get(`/api/v1/verification/verify/${qrToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isSignatureValid).toBe(false);
    expect(res.body.data.verificationStatus).toBe("SIGNATURE_FORGED_OR_ALTERED");

    // Restore original payload
    await prisma.certificate.update({
      where: { qrToken },
      data: { canonicalPayload: cert!.canonicalPayload },
    });
  });
});

