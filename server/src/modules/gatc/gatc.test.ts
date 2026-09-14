import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../config/database";

describe("GATC Module (/api/v1/gatc)", () => {
  let gatcAdminToken: string;
  let consumerToken: string;

  beforeAll(async () => {
    // Login as seeded GATC Agency Admin
    const gatcRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "gatc.lead@precisionlab.org", password: "Password@123" });
    gatcAdminToken = gatcRes.body.data.tokens.accessToken;

    // Login as seeded Consumer
    const consumerRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "trader.rajesh@shreestores.com", password: "Password@123" });
    consumerToken = consumerRes.body.data.tokens.accessToken;
  });

  it("POST /api/v1/gatc/inspectors — should reject non-GATC_ADMIN with 403", async () => {
    const res = await request(app)
      .post("/api/v1/gatc/inspectors")
      .set("Authorization", `Bearer ${consumerToken}`)
      .send({
        name: "Test Inspector",
        email: "test.insp@precisionlab.org",
        phone: "9988771122",
        password: "Password@123",
        employeeId: "APEX-INSP-999",
      });

    expect(res.status).toBe(403);
  });

  it("POST /api/v1/gatc/inspectors — GATC Admin can successfully provision an in-house Inspector", async () => {
    const uniqueEmail = `insp-${Date.now()}@precisionlab.org`;
    const uniquePhone = `93${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueEmpId = `APEX-STAFF-${Date.now()}`;

    const res = await request(app)
      .post("/api/v1/gatc/inspectors")
      .set("Authorization", `Bearer ${gatcAdminToken}`)
      .send({
        name: "Pooja Sharma",
        email: uniqueEmail,
        phone: uniquePhone,
        password: "Password@123",
        employeeId: uniqueEmpId,
        designation: "Calibration Specialist",
        qualificationRef: "NABL-CAL-2024-912",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gatcInspectorProfile.employeeId).toBe(uniqueEmpId);

    // Cleanup
    await prisma.user.delete({ where: { email: uniqueEmail } });
  });

  it("GET /api/v1/gatc/inspectors — should list in-house inspectors under agency", async () => {
    const res = await request(app)
      .get("/api/v1/gatc/inspectors")
      .set("Authorization", `Bearer ${gatcAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
