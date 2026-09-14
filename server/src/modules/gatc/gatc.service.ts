import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  ErrorCode,
  Role,
  CreateGatcInspectorInput,
  AuditAction,
  ApplicationStatus,
} from "@sih/shared";

export class GatcService {
  /**
   * Helper: Retrieve caller's GATC Profile
   */
  async getCallerAgencyProfile(gatcAdminUserId: string) {
    const profile = await prisma.gATCProfile.findUnique({
      where: { userId: gatcAdminUserId },
    });
    if (!profile) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "GATC Agency profile not found for this user.");
    }
    return profile;
  }

  /**
   * Agency Admin provisions a new in-house GATC Field Inspector
   */
  async createInspector(gatcAdminUserId: string, input: CreateGatcInspectorInput) {
    const agencyProfile = await this.getCallerAgencyProfile(gatcAdminUserId);

    // 1. Check existing credentials
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { phone: input.phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new AppError(409, ErrorCode.CONFLICT, "An account with this email address already exists.");
      }
      throw new AppError(409, ErrorCode.CONFLICT, "An account with this phone number already exists.");
    }

    // 2. Check employee ID
    const existingEmployee = await prisma.gATCInspectorProfile.findUnique({
      where: { employeeId: input.employeeId },
    });

    if (existingEmployee) {
      throw new AppError(409, ErrorCode.CONFLICT, "An inspector with this Staff/Employee ID already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const inspector = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: Role.GATC_INSPECTOR,
        isVerified: true,
        isActive: true,
        gatcInspectorProfile: {
          create: {
            gatcProfileId: agencyProfile.id,
            employeeId: input.employeeId,
            designation: input.designation || "Calibration Engineer",
            qualificationRef: input.qualificationRef,
            authorizedScope: input.authorizedScope || agencyProfile.authorizedScope,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        gatcInspectorProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: gatcAdminUserId,
        action: AuditAction.CREATE,
        entity: "GATCInspectorProfile",
        entityId: inspector.id,
        changes: { employeeId: input.employeeId, agency: agencyProfile.agencyName },
      },
    });

    return inspector;
  }

  /**
   * List all in-house inspectors under caller's GATC Agency
   */
  async listInspectors(gatcAdminUserId: string) {
    const agencyProfile = await this.getCallerAgencyProfile(gatcAdminUserId);

    return prisma.gATCInspectorProfile.findMany({
      where: { gatcProfileId: agencyProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                assignedApplications: true,
                inspections: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delegate testing application to an in-house GATC Inspector
   */
  async delegateApplication(gatcAdminUserId: string, applicationId: string, inspectorId: string) {
    const agencyProfile = await this.getCallerAgencyProfile(gatcAdminUserId);

    // Verify inspector belongs to this agency
    const inspectorProfile = await prisma.gATCInspectorProfile.findFirst({
      where: {
        userId: inspectorId,
        gatcProfileId: agencyProfile.id,
      },
    });

    if (!inspectorProfile) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "Selected inspector does not belong to your agency.");
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { instrument: true },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    const agencyScopes = agencyProfile.authorizedScope.length > 0
      ? agencyProfile.authorizedScope
      : ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"];

    if (!agencyScopes.includes(application.instrument.type)) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        `Application instrument type (${application.instrument.type}) is outside your agency's authorized scopes.`
      );
    }

    const inspectorScopes = (inspectorProfile.authorizedScope && inspectorProfile.authorizedScope.length > 0)
      ? inspectorProfile.authorizedScope
      : agencyScopes;

    if (!inspectorScopes.includes(application.instrument.type)) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        `Selected inspector does not have authorized scope for instrument type (${application.instrument.type}).`
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        assignedOfficerId: inspectorId,
        assignedGatcProfileId: agencyProfile.id,
        status: ApplicationStatus.SCHEDULED,
      },
      include: {
        assignedOfficer: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: gatcAdminUserId,
        action: AuditAction.STATUS_CHANGE,
        entity: "Application",
        entityId: applicationId,
        changes: { delegatedTo: inspectorId, status: ApplicationStatus.SCHEDULED },
      },
    });

    return updated;
  }
}

export const gatcService = new GatcService();
