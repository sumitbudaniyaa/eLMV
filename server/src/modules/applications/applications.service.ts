import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  CreateApplicationInput,
  ScheduleApplicationInput,
  RejectApplicationInput,
  ErrorCode,
  Role,
  ApplicationStatus,
  AuditAction,
  InstrumentType,
} from "@sih/shared";

// Verification fee structure under Legal Metrology Rules (in INR)
const FEE_SCHEDULE: Record<string, number> = {
  NON_AUTOMATIC_WEIGHING_INSTRUMENT: 400.0,
  AUTOMATIC_WEIGHING_INSTRUMENT: 1000.0,
  FUEL_DISPENSER: 2000.0,
  STORAGE_TANK: 5000.0,
  LENGTH_MEASURE: 100.0,
  CAPACITY_MEASURE: 150.0,
  OTHER: 500.0,
};

export class ApplicationsService {
  /**
   * Submit new verification or re-verification application
   */
  async createApplication(applicantId: string, input: CreateApplicationInput) {
    const instrument = await prisma.instrument.findUnique({
      where: { id: input.instrumentId },
    });

    if (!instrument) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Selected instrument not found.");
    }

    if (instrument.ownerId !== applicantId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You can only submit verification applications for instruments you own."
      );
    }

    // Check if there is already an active pending application for this instrument
    const activeApp = await prisma.application.findFirst({
      where: {
        instrumentId: input.instrumentId,
        status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.SCHEDULED, ApplicationStatus.INSPECTED] },
      },
    });

    if (activeApp) {
      throw new AppError(
        409,
        ErrorCode.CONFLICT,
        `There is already an active application (${activeApp.applicationNumber}) for this instrument in status ${activeApp.status}.`
      );
    }

    const count = await prisma.application.count();
    const year = new Date().getFullYear();
    const applicationNumber = `APP-${year}-${String(count + 1).padStart(6, "0")}`;

    const feeAmount = FEE_SCHEDULE[instrument.type] || 500.0;

    const application = await prisma.application.create({
      data: {
        applicationNumber,
        instrumentId: input.instrumentId,
        applicantId,
        type: input.type,
        status: ApplicationStatus.SUBMITTED,
        remarks: input.remarks,
        feeAmount,
        feePaid: true, // Auto-mark paid for initial workflow
        feeReceiptNumber: `REC-${year}-${String(count + 1).padStart(6, "0")}`,
        history: {
          create: {
            fromStatus: ApplicationStatus.SUBMITTED,
            toStatus: ApplicationStatus.SUBMITTED,
            actorId: applicantId,
            notes: "Application submitted by applicant",
          },
        },
      },
      include: {
        instrument: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: applicantId,
        action: AuditAction.CREATE,
        entity: "Application",
        entityId: application.id,
        changes: { applicationNumber, status: application.status },
      },
    });

    return application;
  }

  /**
   * List applications filtered by user role and criteria
   */
  async listApplications(
    userId: string,
    role: Role,
    options: {
      status?: ApplicationStatus;
      instrumentType?: InstrumentType;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const andClauses: any[] = [];

    if (role === Role.CONSUMER) {
      andClauses.push({ applicantId: userId });
    } else if (role === Role.LMO) {
      const officerProfile = await prisma.officerProfile.findUnique({ where: { userId } });
      const jurisdictionDistrict = officerProfile?.jurisdictionDistrict;
      andClauses.push({
        OR: [
          { assignedOfficerId: userId },
          {
            assignedOfficerId: null,
            status: ApplicationStatus.SUBMITTED,
            ...(jurisdictionDistrict ? { instrument: { district: jurisdictionDistrict } } : {}),
          },
        ],
      });
    } else if (role === Role.GATC_INSPECTOR) {
      const inspectorProfile = await prisma.gATCInspectorProfile.findUnique({
        where: { userId },
        include: { gatcAgency: true },
      });
      const rawScopes = (inspectorProfile?.authorizedScope && inspectorProfile.authorizedScope.length > 0)
        ? inspectorProfile.authorizedScope
        : inspectorProfile?.gatcAgency?.authorizedScope || [];
      const scopes = rawScopes.length > 0
        ? (rawScopes as any[])
        : [InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT];

      andClauses.push({
        instrument: {
          type: { in: scopes },
        },
        OR: [
          { assignedOfficerId: userId },
          { assignedOfficerId: null, status: ApplicationStatus.SUBMITTED },
        ],
      });
    } else if (role === Role.GATC_ADMIN) {
      const gatcProfile = await prisma.gATCProfile.findUnique({ where: { userId } });
      const scopes = (gatcProfile?.authorizedScope && gatcProfile.authorizedScope.length > 0)
        ? (gatcProfile.authorizedScope as any[])
        : [InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT];

      andClauses.push({
        instrument: {
          type: { in: scopes },
        },
        OR: [
          { assignedGatcProfileId: gatcProfile?.id || "none" },
          { assignedOfficerId: userId },
          { status: ApplicationStatus.SUBMITTED },
        ],
      });
    }

    if (options.status) {
      andClauses.push({ status: options.status });
    }

    if (options.instrumentType) {
      andClauses.push({ instrument: { type: options.instrumentType } });
    }

    if (options.search) {
      andClauses.push({
        OR: [
          { applicationNumber: { contains: options.search, mode: "insensitive" } },
          { instrument: { serialNumber: { contains: options.search, mode: "insensitive" } } },
        ],
      });
    }

    const where = andClauses.length > 0 ? { AND: andClauses } : {};

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          instrument: {
            select: {
              id: true,
              serialNumber: true,
              type: true,
              category: true,
              make: true,
              model: true,
              capacity: true,
              unit: true,
              accuracyClass: true,
              district: true,
              state: true,
            },
          },
          applicant: {
            select: { id: true, name: true, email: true, phone: true },
          },
          assignedOfficer: {
            select: { id: true, name: true, email: true },
          },
          certificate: {
            select: { id: true, certificateNumber: true, validUntil: true },
          },
          inspectionRecord: {
            include: {
              officer: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return {
      applications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single application details
   */
  async getApplicationById(id: string, userId: string, role: Role) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        instrument: true,
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            stakeholderProfile: true,
          },
        },
        assignedOfficer: {
          select: { id: true, name: true, email: true },
        },
        inspectionRecord: {
          include: {
            officer: { select: { id: true, name: true } },
          },
        },
        certificate: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    if (role === Role.CONSUMER && application.applicantId !== userId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not have access to this application."
      );
    }

    if (role === Role.GATC_ADMIN) {
      const gatcProfile = await prisma.gATCProfile.findUnique({ where: { userId } });
      const scopes = (gatcProfile?.authorizedScope && gatcProfile.authorizedScope.length > 0)
        ? (gatcProfile.authorizedScope as any[])
        : [InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT];
      if (!scopes.includes(application.instrument.type)) {
        throw new AppError(
          403,
          ErrorCode.FORBIDDEN,
          "This application's instrument type is outside your GATC agency's authorized scope."
        );
      }
    } else if (role === Role.GATC_INSPECTOR) {
      const inspectorProfile = await prisma.gATCInspectorProfile.findUnique({
        where: { userId },
        include: { gatcAgency: true },
      });
      const rawScopes = (inspectorProfile?.authorizedScope && inspectorProfile.authorizedScope.length > 0)
        ? inspectorProfile.authorizedScope
        : inspectorProfile?.gatcAgency?.authorizedScope || [];
      const scopes = rawScopes.length > 0
        ? (rawScopes as any[])
        : [InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT];
      if (!scopes.includes(application.instrument.type)) {
        throw new AppError(
          403,
          ErrorCode.FORBIDDEN,
          "This application's instrument type is outside your authorized testing scope."
        );
      }
    }

    if (
      (role === Role.LMO || role === Role.GATC_INSPECTOR) &&
      application.assignedOfficerId &&
      application.assignedOfficerId !== userId
    ) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "This application is scheduled and assigned to another verification officer."
      );
    }

    return application;
  }

  /**
   * Admin assigns application to an LMO or GATC
   */
  async assignOfficer(applicationId: string, officerId: string, adminId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    const officer = await prisma.user.findUnique({
      where: { id: officerId },
    });

    if (!officer || (officer.role !== Role.LMO && officer.role !== Role.GATC_INSPECTOR && officer.role !== Role.GATC_ADMIN)) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Officer must be a verified LMO or GATC testing officer."
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        assignedOfficerId: officerId,
      },
      include: {
        assignedOfficer: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AuditAction.UPDATE,
        entity: "Application",
        entityId: applicationId,
        changes: { assignedOfficerId: officerId },
      },
    });

    return updated;
  }

  /**
   * Officer schedules on-site or lab inspection
   */
  async scheduleInspection(
    applicationId: string,
    actorId: string,
    input: ScheduleApplicationInput
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    if (
      application.status !== ApplicationStatus.SUBMITTED &&
      application.status !== ApplicationStatus.SCHEDULED
    ) {
      throw new AppError(
        400,
        ErrorCode.INVALID_STATE_TRANSITION,
        `Cannot schedule an application in ${application.status} status.`
      );
    }

    if (
      application.status === ApplicationStatus.SCHEDULED &&
      application.assignedOfficerId &&
      application.assignedOfficerId !== actorId
    ) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "This application is already scheduled and assigned to another verification officer."
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.SCHEDULED,
        scheduledDate: new Date(input.scheduledDate),
        remarks: input.remarks || application.remarks,
        assignedOfficerId: actorId,
        history: {
          create: {
            fromStatus: application.status,
            toStatus: ApplicationStatus.SCHEDULED,
            actorId,
            notes: `Inspection scheduled for ${new Date(input.scheduledDate).toLocaleDateString()}`,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: AuditAction.STATUS_CHANGE,
        entity: "Application",
        entityId: applicationId,
        changes: {
          from: application.status,
          to: ApplicationStatus.SCHEDULED,
          scheduledDate: input.scheduledDate,
        },
      },
    });

    return updated;
  }

  /**
   * Reject application with formal reason
   */
  async rejectApplication(
    applicationId: string,
    actorId: string,
    input: RejectApplicationInput
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    if (
      application.status === ApplicationStatus.CERTIFIED ||
      application.status === ApplicationStatus.EXPIRED
    ) {
      throw new AppError(
        400,
        ErrorCode.INVALID_STATE_TRANSITION,
        `Cannot reject an application in ${application.status} status.`
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.REJECTED,
        rejectionReason: input.rejectionReason,
        history: {
          create: {
            fromStatus: application.status,
            toStatus: ApplicationStatus.REJECTED,
            actorId,
            notes: input.rejectionReason,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: AuditAction.STATUS_CHANGE,
        entity: "Application",
        entityId: applicationId,
        changes: {
          from: application.status,
          to: ApplicationStatus.REJECTED,
          reason: input.rejectionReason,
        },
      },
    });

    return updated;
  }
}

export const applicationsService = new ApplicationsService();

