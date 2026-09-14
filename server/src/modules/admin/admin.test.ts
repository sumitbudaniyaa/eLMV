import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../config/database";

describe("Admin Module (/api/v1/admin)", () => {
  let adminToken: string;
  let consumerToken: string;

  beforeAll(async () => {
    // Login as seeded Admin
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@metrology.gov.in", password: "Password@123" });
    adminToken = adminRes.body.data.tokens.accessToken;

    // Login as seeded Consumer
    const consumerRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "trader.rajesh@shreestores.com", password: "Password@123" });
    consumerToken = consumerRes.body.data.tokens.accessToken;
  });

  it("POST /api/v1/admin/officers — should reject non-admin users with 403", async () => {
    const res = await request(app)
      .post("/api/v1/admin/officers")
      .set("Authorization", `Bearer ${consumerToken}`)
      .send({
        name: "Test Officer",
        email: "test.officer@example.com",
        phone: "9988776655",
        password: "Password@123",
        badgeNumber: "TEST-BADGE-001",
        jurisdictionDistrict: "Jaipur",
        jurisdictionState: "Rajasthan",
      });

    expect(res.status).toBe(403);
  });

  it("POST /api/v1/admin/officers — Admin can successfully provision a new LMO", async () => {
    const uniqueEmail = `lmo-${Date.now()}@metrology.gov.in`;
    const uniquePhone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueBadge = `RJ-LMO-${Date.now()}`;

    const res = await request(app)
      .post("/api/v1/admin/officers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Officer Sunita Verma",
        email: uniqueEmail,
        phone: uniquePhone,
        password: "Password@123",
        badgeNumber: uniqueBadge,
        jurisdictionDistrict: "Jodhpur",
        jurisdictionState: "Rajasthan",
        jurisdictionZone: "Central Zone",
        officeAddress: "Collectorate Circle, Jodhpur",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.officerProfile.badgeNumber).toBe(uniqueBadge);

    // Cleanup
    await prisma.user.delete({ where: { email: uniqueEmail } });
  });

  it("POST /api/v1/admin/gatc-agencies — Admin can successfully provision a new GATC Agency", async () => {
    const uniqueEmail = `gatc-${Date.now()}@testlab.org`;
    const uniquePhone = `92${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueAccr = `NABL-TEST-${Date.now()}`;

    const res = await request(app)
      .post("/api/v1/admin/gatc-agencies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        agencyName: "National Test House Calibration Center",
        accreditationNumber: uniqueAccr,
        authorizedScope: ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"],
        validUntil: "2029-12-31T00:00:00.000Z",
        district: "Jaipur",
        state: "Rajasthan",
        address: "Industrial Area, Phase 1",
        adminName: "Dr. Alok Nath",
        adminEmail: uniqueEmail,
        adminPhone: uniquePhone,
        adminPassword: "Password@123",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gatcProfile.agencyName).toBe("National Test House Calibration Center");

    // Cleanup
    await prisma.user.delete({ where: { email: uniqueEmail } });
  });

  it("GET /api/v1/admin/officers — should list all officers", async () => {
    const res = await request(app)
      .get("/api/v1/admin/officers")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
