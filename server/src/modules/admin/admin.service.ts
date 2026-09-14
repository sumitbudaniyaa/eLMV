import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  ErrorCode,
  Role,
  CreateOfficerInput,
  CreateGatcAgencyInput,
  UpdateGatcAgencyInput,
  AuditAction,
} from "@sih/shared";

export class AdminService {
  /**
   * Provision a new Legal Metrology Officer (LMO)
   */
  async createOfficer(adminId: string, input: CreateOfficerInput) {
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

    const existingBadge = await prisma.officerProfile.findUnique({
      where: { badgeNumber: input.badgeNumber },
    });

    if (existingBadge) {
      throw new AppError(409, ErrorCode.CONFLICT, "An officer with this badge number already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const officer = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: Role.LMO,
        isVerified: true,
        isActive: true,
        officerProfile: {
          create: {
            badgeNumber: input.badgeNumber,
            jurisdictionDistrict: input.jurisdictionDistrict,
            jurisdictionState: input.jurisdictionState,
            jurisdictionZone: input.jurisdictionZone,
            officeAddress: input.officeAddress,
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
        officerProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AuditAction.CREATE,
        entity: "OfficerProfile",
        entityId: officer.id,
        changes: { badge: input.badgeNumber, district: input.jurisdictionDistrict },
      },
    });

    return officer;
  }

  /**
   * List all registered Legal Metrology Officers
   */
  async listOfficers() {
    return prisma.user.findMany({
      where: { role: Role.LMO },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        officerProfile: true,
        _count: {
          select: {
            assignedApplications: true,
            inspections: true,
          },
        },
      },
    });
  }

  /**
   * Provision a new accredited GATC Agency and its Agency Admin
   */
  async createGatcAgency(adminId: string, input: CreateGatcAgencyInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.adminEmail }, { phone: input.adminPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.adminEmail) {
        throw new AppError(409, ErrorCode.CONFLICT, "An account with this email address already exists.");
      }
      throw new AppError(409, ErrorCode.CONFLICT, "An account with this phone number already exists.");
    }

    const existingAccr = await prisma.gATCProfile.findUnique({
      where: { accreditationNumber: input.accreditationNumber },
    });

    if (existingAccr) {
      throw new AppError(409, ErrorCode.CONFLICT, "A GATC agency with this accreditation number already exists.");
    }

    const passwordHash = await bcrypt.hash(input.adminPassword, 12);

    const agencyAdmin = await prisma.user.create({
      data: {
        name: input.adminName,
        email: input.adminEmail,
        phone: input.adminPhone,
        passwordHash,
        role: Role.GATC_ADMIN,
        isVerified: true,
        isActive: true,
        gatcProfile: {
          create: {
            agencyName: input.agencyName,
            accreditationNumber: input.accreditationNumber,
            notificationRefNumber: input.notificationRefNumber,
            authorizedScope: input.authorizedScope,
            validUntil: new Date(input.validUntil),
            district: input.district,
            state: input.state,
            address: input.address,
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
        gatcProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AuditAction.CREATE,
        entity: "GATCProfile",
        entityId: agencyAdmin.id,
        changes: { agency: input.agencyName, accreditation: input.accreditationNumber },
      },
    });

    return agencyAdmin;
  }

  /**
   * List all accredited GATC Agencies with staff counts
   */
  async listGatcAgencies() {
    return prisma.gATCProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            inspectors: true,
            applications: true,
          },
        },
      },
    });
  }

  /**
   * Update an accredited GATC Agency (scopes, validity, details)
   */
  async updateGatcAgency(agencyId: string, input: UpdateGatcAgencyInput, adminId: string) {
    const existingAgency = await prisma.gATCProfile.findUnique({
      where: { id: agencyId },
    });

    if (!existingAgency) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "GATC agency not found.");
    }

    const updated = await prisma.gATCProfile.update({
      where: { id: agencyId },
      data: {
        ...(input.agencyName ? { agencyName: input.agencyName } : {}),
        ...(input.notificationRefNumber !== undefined ? { notificationRefNumber: input.notificationRefNumber } : {}),
        ...(input.authorizedScope ? { authorizedScope: input.authorizedScope } : {}),
        ...(input.validUntil ? { validUntil: new Date(input.validUntil) } : {}),
        ...(input.district ? { district: input.district } : {}),
        ...(input.state ? { state: input.state } : {}),
        ...(input.address ? { address: input.address } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            inspectors: true,
            applications: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AuditAction.UPDATE,
        entity: "GATCProfile",
        entityId: agencyId,
        changes: input,
      },
    });

    return updated;
  }
}

export const adminService = new AdminService();
