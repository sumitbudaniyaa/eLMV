import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  ErrorCode,
  Role,
  StakeholderProfileInput,
  GATCProfileInput,
  OfficerProfileInput,
  UpdateCredentialsInput,
  ChangePasswordInput,
  AuditAction,
} from "@sih/shared";

export class UsersService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        stakeholderProfile: true,
        gatcProfile: true,
        officerProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "User not found.");
    }
    return user;
  }

  async listUsers(options: {
    role?: Role;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.role) {
      where.role = options.role;
    }
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { email: { contains: options.search, mode: "insensitive" } },
        { phone: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          stakeholderProfile: {
            select: { businessName: true, type: true, district: true, state: true },
          },
        },
      }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async upsertStakeholderProfile(
    userId: string,
    input: StakeholderProfileInput
  ) {
    const profile = await prisma.stakeholderProfile.upsert({
      where: { userId },
      update: {
        ...input,
      },
      create: {
        userId,
        ...input,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "StakeholderProfile",
        entityId: profile.id,
        changes: input,
      },
    });

    return profile;
  }

  async upsertGatcProfile(userId: string, input: GATCProfileInput) {
    const profile = await prisma.gATCProfile.upsert({
      where: { userId },
      update: {
        ...input,
        validUntil: new Date(input.validUntil),
      },
      create: {
        userId,
        ...input,
        validUntil: new Date(input.validUntil),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "GATCProfile",
        entityId: profile.id,
        changes: input,
      },
    });

    return profile;
  }

  async upsertOfficerProfile(userId: string, input: OfficerProfileInput) {
    const profile = await prisma.officerProfile.upsert({
      where: { userId },
      update: {
        ...input,
      },
      create: {
        userId,
        ...input,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "OfficerProfile",
        entityId: profile.id,
        changes: input,
      },
    });

    return profile;
  }

  /**
   * Update user credentials (name, phone). Email is strictly non-changeable.
   */
  async updateCredentials(userId: string, input: UpdateCredentialsInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "User not found.");
    }

    // STRICT STATUTORY REQUIREMENT: Email address cannot be modified
    if (input.email && input.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Email address is statutory and cannot be modified."
      );
    }

    // Check phone uniqueness if phone is changed
    if (input.phone && input.phone !== user.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: input.phone, id: { not: userId } },
      });
      if (existingPhone) {
        throw new AppError(
          409,
          ErrorCode.CONFLICT,
          "This phone number is already registered to another account."
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        updatedAt: true,
        stakeholderProfile: true,
        gatcProfile: true,
        officerProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: userId,
        changes: {
          name: input.name ? { from: user.name, to: input.name } : undefined,
          phone: input.phone ? { from: user.phone, to: input.phone } : undefined,
        },
      },
    });

    return updatedUser;
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "User not found.");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError(
        400,
        ErrorCode.UNAUTHORIZED,
        "Current password is incorrect. Please verify your current password."
      );
    }

    // Ensure new password is not identical to current password
    const isSame = await bcrypt.compare(input.newPassword, user.passwordHash);
    if (isSame) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "New password cannot be the same as your current password."
      );
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "User",
        entityId: userId,
        changes: { passwordChanged: true },
      },
    });

    return { message: "Password updated successfully." };
  }
}

export const usersService = new UsersService();
