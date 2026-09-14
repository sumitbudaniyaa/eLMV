import { prisma } from "../../config/database";
import { Role, ApplicationStatus, InspectionResult } from "@sih/shared";

export class DashboardService {
  async getSummary(userId: string, role: Role) {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    if (role === Role.CONSUMER) {
      const [
        totalInstruments,
        pendingApplications,
        activeCertificates,
        expiringInstruments,
        recentApplications,
      ] = await Promise.all([
        prisma.instrument.count({ where: { ownerId: userId } }),
        prisma.application.count({
          where: {
            applicantId: userId,
            status: {
              in: [
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.SCHEDULED,
                ApplicationStatus.INSPECTED,
              ],
            },
          },
        }),
        prisma.certificate.count({
          where: {
            application: { applicantId: userId },
            validUntil: { gte: now },
          },
        }),
        prisma.instrument.findMany({
          where: {
            ownerId: userId,
            nextDueAt: { lte: thirtyDaysAhead, gte: now },
          },
          take: 5,
        }),
        prisma.application.findMany({
          where: { applicantId: userId },
          take: 5,
          orderBy: { submittedAt: "desc" },
          include: {
            instrument: { select: { serialNumber: true, make: true } },
            certificate: { select: { certificateNumber: true, validUntil: true } },
          },
        }),
      ]);

      return {
        role,
        stats: {
          totalInstruments,
          pendingApplications,
          activeCertificates,
          expiringSoonCount: expiringInstruments.length,
        },
        expiringInstruments,
        recentApplications,
      };
    }

    if (role === Role.LMO || role === Role.GATC_INSPECTOR) {
      const [
        pendingInspections,
        completedInspections,
        certifiedCount,
        upcomingSchedule,
      ] = await Promise.all([
        prisma.application.count({
          where: {
            assignedOfficerId: userId,
            status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.SCHEDULED] },
          },
        }),
        prisma.inspectionRecord.count({
          where: { officerId: userId },
        }),
        prisma.certificate.count({
          where: {
            application: { assignedOfficerId: userId },
          },
        }),
        prisma.application.findMany({
          where: {
            assignedOfficerId: userId,
            status: ApplicationStatus.SCHEDULED,
            scheduledDate: { gte: now },
          },
          take: 5,
          orderBy: { scheduledDate: "asc" },
          include: {
            instrument: { select: { serialNumber: true, make: true, district: true } },
            applicant: { select: { name: true, phone: true } },
          },
        }),
      ]);

      return {
        role,
        stats: {
          pendingInspections,
          completedInspections,
          certifiedCount,
          scheduledUpcomingCount: upcomingSchedule.length,
        },
        upcomingSchedule,
      };
    }

    if (role === Role.GATC_ADMIN) {
      const gatcProfile = await prisma.gATCProfile.findUnique({
        where: { userId },
      });
      const agencyId = gatcProfile?.id;

      const [
        pendingTests,
        completedTests,
        certifiedCount,
        inspectorsCount,
        upcomingSchedule,
      ] = await Promise.all([
        prisma.application.count({
          where: {
            OR: [
              { assignedGatcProfileId: agencyId, status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.SCHEDULED] } },
              { assignedOfficerId: userId, status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.SCHEDULED] } },
            ],
          },
        }),
        prisma.inspectionRecord.count({
          where: {
            officer: {
              gatcInspectorProfile: { gatcProfileId: agencyId },
            },
          },
        }),
        prisma.certificate.count({
          where: {
            application: {
              OR: [
                { assignedGatcProfileId: agencyId },
                { assignedOfficer: { gatcInspectorProfile: { gatcProfileId: agencyId } } },
              ],
            },
          },
        }),
        agencyId
          ? prisma.gATCInspectorProfile.count({ where: { gatcProfileId: agencyId } })
          : 0,
        prisma.application.findMany({
          where: {
            OR: [
              { assignedGatcProfileId: agencyId },
              { assignedOfficerId: userId },
            ],
            status: ApplicationStatus.SCHEDULED,
          },
          take: 5,
          orderBy: { scheduledDate: "asc" },
          include: {
            instrument: { select: { serialNumber: true, make: true, district: true } },
            applicant: { select: { name: true, phone: true } },
          },
        }),
      ]);

      return {
        role,
        agencyProfile: gatcProfile,
        stats: {
          pendingInspections: pendingTests,
          completedInspections: completedTests,
          certifiedCount,
          inspectorsCount,
          scheduledUpcomingCount: upcomingSchedule.length,
        },
        upcomingSchedule,
      };
    }

    // Role.ADMIN
    const [
      totalInstruments,
      totalApplications,
      totalCertificates,
      totalRevenue,
      statusGroups,
      officersCount,
    ] = await Promise.all([
      prisma.instrument.count(),
      prisma.application.count(),
      prisma.certificate.count({ where: { validUntil: { gte: now } } }),
      prisma.application.aggregate({
        where: { feePaid: true },
        _sum: { feeAmount: true },
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.user.count({
        where: { role: { in: [Role.LMO, Role.GATC_ADMIN, Role.GATC_INSPECTOR] } },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    statusGroups.forEach((g) => {
      statusCounts[g.status] = g._count.status;
    });

    return {
      role,
      stats: {
        totalInstruments,
        totalApplications,
        activeCertificates: totalCertificates,
        statutoryRevenue: totalRevenue._sum.feeAmount || 0,
        activeOfficers: officersCount,
        statusCounts,
      },
    };
  }
}

export const dashboardService = new DashboardService();

