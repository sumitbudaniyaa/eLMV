import { prisma } from "../../config/database";
import { ApplicationStatus, InspectionResult, Role } from "@sih/shared";

export class AnalyticsService {
  /**
   * Average Turnaround Time (TAT) distribution in days across statutory stages
   * Scoped by role:
   * - ADMIN: Statewide
   * - CONSUMER: User's applications
   * - LMO / GATC: Officer's assigned/conducted inspections
   */
  async getTurnaroundTime(userId: string, role: Role) {
    const where: any = {
      status: ApplicationStatus.CERTIFIED,
      certificate: { isNot: null },
    };

    if (role === Role.CONSUMER) {
      where.applicantId = userId;
    } else if (role === Role.LMO || role === Role.GATC_INSPECTOR || role === Role.GATC_ADMIN) {
      where.assignedOfficerId = userId;
    }

    const certifiedApps = await prisma.application.findMany({
      where,
      include: {
        certificate: true,
        inspectionRecord: true,
      },
    });

    if (certifiedApps.length === 0) {
      return {
        averageTotalDays: 0,
        submissionToInspectionDays: 0,
        inspectionToCertificationDays: 0,
        sampleSize: 0,
      };
    }

    let totalDurationMs = 0;
    let subToInspDurationMs = 0;
    let inspToCertDurationMs = 0;
    let countWithInsp = 0;

    certifiedApps.forEach((app) => {
      const submitted = new Date(app.submittedAt).getTime();
      const certified = new Date(app.certificate!.issuedAt).getTime();
      totalDurationMs += Math.max(0, certified - submitted);

      if (app.inspectionRecord) {
        const inspected = new Date(app.inspectionRecord.inspectedAt).getTime();
        subToInspDurationMs += Math.max(0, inspected - submitted);
        inspToCertDurationMs += Math.max(0, certified - inspected);
        countWithInsp++;
      }
    });

    const msPerDay = 1000 * 60 * 60 * 24;
    const avgTotalDays = totalDurationMs / certifiedApps.length / msPerDay;
    const avgSubToInsp = countWithInsp > 0 ? subToInspDurationMs / countWithInsp / msPerDay : 0;
    const avgInspToCert = countWithInsp > 0 ? inspToCertDurationMs / countWithInsp / msPerDay : 0;

    return {
      averageTotalDays: parseFloat(avgTotalDays.toFixed(1)),
      submissionToInspectionDays: parseFloat(avgSubToInsp.toFixed(1)),
      inspectionToCertificationDays: parseFloat(avgInspToCert.toFixed(1)),
      sampleSize: certifiedApps.length,
    };
  }

  /**
   * Pendency trends grouped by statutory aging buckets (<7d, 7-15d, 15-30d, >30d)
   * Scoped by role:
   * - ADMIN: Statewide
   * - CONSUMER: User's applications
   * - LMO / GATC: Officer's assigned queue
   */
  async getPendencyTrends(userId: string, role: Role) {
    const where: any = {
      status: {
        in: [
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.SCHEDULED,
          ApplicationStatus.INSPECTED,
        ],
      },
    };

    if (role === Role.CONSUMER) {
      where.applicantId = userId;
    } else if (role === Role.LMO || role === Role.GATC_INSPECTOR || role === Role.GATC_ADMIN) {
      where.assignedOfficerId = userId;
    }

    const pendingApps = await prisma.application.findMany({
      where,
      select: {
        id: true,
        submittedAt: true,
        status: true,
      },
    });

    const now = Date.now();
    const msPerDay = 1000 * 60 * 60 * 24;

    const buckets = {
      under7Days: 0,
      between7And15Days: 0,
      between15And30Days: 0,
      over30Days: 0,
    };

    pendingApps.forEach((app) => {
      const ageDays = (now - new Date(app.submittedAt).getTime()) / msPerDay;
      if (ageDays < 7) {
        buckets.under7Days++;
      } else if (ageDays <= 15) {
        buckets.between7And15Days++;
      } else if (ageDays <= 30) {
        buckets.between15And30Days++;
      } else {
        buckets.over30Days++;
      }
    });

    return [
      { bucket: "< 7 days", count: buckets.under7Days, label: "Immediate (< 7d)" },
      { bucket: "7-15 days", count: buckets.between7And15Days, label: "Normal (7-15d)" },
      { bucket: "15-30 days", count: buckets.between15And30Days, label: "Aging (15-30d)" },
      { bucket: "> 30 days", count: buckets.over30Days, label: "Critical (> 30d)" },
    ];
  }

  /**
   * Officer workload, performance, and rejection rate matrix
   * Scoped by role:
   * - ADMIN: All officers
   * - LMO / GATC: Only the requesting officer's performance
   * - CONSUMER: Empty (not applicable to trader)
   */
  async getOfficerWorkload(userId: string, role: Role) {
    const where: any = {};
    if (role === Role.ADMIN) {
      where.role = { in: [Role.LMO, Role.GATC_ADMIN, Role.GATC_INSPECTOR] };
    } else if (role === Role.LMO || role === Role.GATC_ADMIN || role === Role.GATC_INSPECTOR) {
      where.id = userId;
    } else {
      return [];
    }

    const officers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        inspections: {
          select: { result: true },
        },
        assignedApplications: {
          where: {
            status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.SCHEDULED] },
          },
          select: { id: true },
        },
      },
    });

    return officers.map((off) => {
      const totalInspections = off.inspections.length;
      const passed = off.inspections.filter((i) => i.result === InspectionResult.PASSED).length;
      const failed = off.inspections.filter((i) => i.result === InspectionResult.FAILED).length;
      const rejectionRate = totalInspections > 0 ? (failed / totalInspections) * 100 : 0;

      return {
        officerId: off.id,
        officerName: off.name,
        role: off.role,
        completedInspections: totalInspections,
        passedInspections: passed,
        failedInspections: failed,
        rejectionRate: parseFloat(rejectionRate.toFixed(1)),
        pendingAssigned: off.assignedApplications.length,
      };
    });
  }

  /**
   * Regional / Category compliance breakdown
   * Scoped by role:
   * - ADMIN: Breakdown by operational districts statewide
   * - LMO: Breakdown by equipment categories in officer's jurisdiction
   * - GATC: Breakdown by tested laboratory equipment scopes
   * - CONSUMER: Breakdown by trader's registered equipment categories
   */
  async getRegionalBreakdown(userId: string, role: Role) {
    const now = new Date();

    if (role === Role.ADMIN) {
      const districts = await prisma.instrument.groupBy({
        by: ["district", "state"],
        _count: { id: true },
      });

      return await Promise.all(
        districts.map(async (d) => {
          const activeVerifiedCount = await prisma.instrument.count({
            where: {
              district: d.district,
              state: d.state,
              nextDueAt: { gte: now },
            },
          });

          const total = d._count.id;
          const complianceRate = total > 0 ? (activeVerifiedCount / total) * 100 : 0;

          return {
            district: d.district,
            state: d.state,
            totalInstruments: total,
            verifiedActive: activeVerifiedCount,
            complianceRate: parseFloat(complianceRate.toFixed(1)),
          };
        })
      );
    }

    if (role === Role.LMO) {
      const officer = await prisma.officerProfile.findUnique({ where: { userId } });
      const district = officer?.jurisdictionDistrict || "Jaipur";
      const state = officer?.jurisdictionState || "Rajasthan";

      const categories = await prisma.instrument.groupBy({
        by: ["category"],
        where: { district },
        _count: { id: true },
      });

      return await Promise.all(
        categories.map(async (c) => {
          const activeVerifiedCount = await prisma.instrument.count({
            where: {
              district,
              category: c.category,
              nextDueAt: { gte: now },
            },
          });

          const total = c._count.id;
          const complianceRate = total > 0 ? (activeVerifiedCount / total) * 100 : 0;

          return {
            district: c.category,
            state: `${district}, ${state}`,
            totalInstruments: total,
            verifiedActive: activeVerifiedCount,
            complianceRate: parseFloat(complianceRate.toFixed(1)),
          };
        })
      );
    }

    if (role === Role.GATC_ADMIN || role === Role.GATC_INSPECTOR) {
      const testedRecords = await prisma.inspectionRecord.findMany({
        where: { officerId: userId },
        include: { application: { include: { instrument: true } } },
      });

      const categoryMap = new Map<string, { total: number; passed: number }>();
      testedRecords.forEach((rec) => {
        const cat = rec.application?.instrument?.category || "General";
        const current = categoryMap.get(cat) || { total: 0, passed: 0 };
        current.total++;
        if (rec.result === InspectionResult.PASSED) {
          current.passed++;
        }
        categoryMap.set(cat, current);
      });

      if (categoryMap.size === 0) {
        const profile = await prisma.gATCProfile.findUnique({ where: { userId } });
        const scopes: string[] = profile?.authorizedScope || ["NON_AUTOMATIC_WEIGHING_INSTRUMENT", "FUEL_DISPENSER"];
        return scopes.map((scope: string) => ({
          district: scope.replace(/_/g, " "),
          state: "Accredited Lab Scope",
          totalInstruments: 0,
          verifiedActive: 0,
          complianceRate: 100,
        }));
      }

      return Array.from(categoryMap.entries()).map(([cat, stats]) => ({
        district: cat,
        state: "Laboratory Tested",
        totalInstruments: stats.total,
        verifiedActive: stats.passed,
        complianceRate: parseFloat(((stats.passed / stats.total) * 100).toFixed(1)),
      }));
    }

    // Role.CONSUMER
    const instruments = await prisma.instrument.findMany({
      where: { ownerId: userId },
    });

    const categoryMap = new Map<string, { total: number; verifiedActive: number }>();
    instruments.forEach((inst) => {
      const cat = inst.category || inst.make || "General";
      const current = categoryMap.get(cat) || { total: 0, verifiedActive: 0 };
      current.total++;
      if (inst.nextDueAt && new Date(inst.nextDueAt) >= now) {
        current.verifiedActive++;
      }
      categoryMap.set(cat, current);
    });

    return Array.from(categoryMap.entries()).map(([cat, stats]) => ({
      district: cat,
      state: "Commercial Devices",
      totalInstruments: stats.total,
      verifiedActive: stats.verifiedActive,
      complianceRate: parseFloat(((stats.verifiedActive / stats.total) * 100).toFixed(1)),
    }));
  }
}

export const analyticsService = new AnalyticsService();

