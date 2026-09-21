import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purge() {
  console.log("[PURGE] Starting database purge...");

  const delCert = await prisma.certificate.deleteMany({});
  console.log(`[PURGE] Deleted ${delCert.count} certificates.`);

  const delInsp = await prisma.inspectionRecord.deleteMany({});
  console.log(`[PURGE] Deleted ${delInsp.count} inspection records.`);

  const delHist = await prisma.applicationHistory.deleteMany({});
  console.log(`[PURGE] Deleted ${delHist.count} application histories.`);

  const delApp = await prisma.application.deleteMany({});
  console.log(`[PURGE] Deleted ${delApp.count} applications.`);

  const delInst = await prisma.instrument.deleteMany({});
  console.log(`[PURGE] Deleted ${delInst.count} instruments.`);

  const delNotif = await prisma.notification.deleteMany({});
  console.log(`[PURGE] Deleted ${delNotif.count} notifications.`);

  const delAudit = await prisma.auditLog.deleteMany({});
  console.log(`[PURGE] Deleted ${delAudit.count} audit logs.`);

  const delToken = await prisma.refreshToken.deleteMany({});
  console.log(`[PURGE] Deleted ${delToken.count} refresh tokens.`);

  const delGatcInsp = await prisma.gATCInspectorProfile.deleteMany({});
  console.log(`[PURGE] Deleted ${delGatcInsp.count} GATC inspector profiles.`);

  const delGatc = await prisma.gATCProfile.deleteMany({});
  console.log(`[PURGE] Deleted ${delGatc.count} GATC profiles.`);

  const delStakeholder = await prisma.stakeholderProfile.deleteMany({});
  console.log(`[PURGE] Deleted ${delStakeholder.count} stakeholder profiles.`);

  const delOfficer = await prisma.officerProfile.deleteMany({});
  console.log(`[PURGE] Deleted ${delOfficer.count} officer profiles.`);

  const delUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@metrology.gov.in",
      },
    },
  });
  console.log(`[PURGE] Deleted ${delUsers.count} non-admin users.`);

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });
  console.log("[PURGE] Remaining users:", remainingUsers);

  const keyCount = await prisma.signingKey.count();
  console.log(`[PURGE] Active/Existing Signing Keys: ${keyCount}`);

  console.log("[PURGE] Database purge completed successfully.");
}

purge()
  .catch((e) => {
    console.error("[PURGE ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

