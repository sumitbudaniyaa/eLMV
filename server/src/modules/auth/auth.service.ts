import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import {
  RegisterInput,
  LoginInput,
  ErrorCode,
  Role,
  AuditAction,
} from "@sih/shared";

interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

export class AuthService {
  /**
   * Generate access and refresh JWT pair
   */
  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { phone: input.phone }],
      },
    });

    if (existing) {
      if (existing.email === input.email) {
        throw new AppError(
          409,
          ErrorCode.CONFLICT,
          "An account with this email address already exists.",
          [{ field: "email", message: "Email already registered" }]
        );
      }
      throw new AppError(
        409,
        ErrorCode.CONFLICT,
        "An account with this mobile number already exists.",
        [{ field: "phone", message: "Mobile number already registered" }]
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Self-registration is only allowed for CONSUMER role.
    // ADMIN, LMO, and GATC accounts must be created by an existing admin.
    if (input.role && input.role !== Role.CONSUMER) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "Only consumer accounts can be created through self-registration. Admin, LMO, and GATC accounts are assigned by administrators."
      );
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        name: input.name,
        passwordHash,
        role: Role.CONSUMER, // Always force CONSUMER for self-registration
        isVerified: true, // auto-verified for testing; can be linked to OTP in prod
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.CREATE,
        entity: "User",
        entityId: user.id,
        changes: { email: user.email, role: user.role },
      },
    });

    return { user, tokens };
  }

  /**
   * Authenticate user with credentials
   */
  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        stakeholderProfile: true,
        gatcProfile: true,
      },
    });

    if (!user) {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "No account found with this email address. Please check your email or register."
      );
    }

    if (!user.isActive) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "This account has been deactivated. Please contact administration."
      );
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Invalid password. Please check your password and try again."
      );
    }

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Audit login
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.LOGIN,
        entity: "User",
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Refresh session using valid refresh token
   */
  async refresh(refreshTokenString: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshTokenString, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Invalid or expired refresh token."
      );
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Refresh token has been revoked or expired."
      );
    }

    // Revoke used refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = storedToken.user;
    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    const nextExpires = new Date();
    nextExpires.setDate(nextExpires.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: nextExpires,
      },
    });

    return tokens;
  }

  /**
   * Invalidate session
   */
  async logout(userId: string, refreshTokenString?: string) {
    if (refreshTokenString) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshTokenString, userId },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.LOGOUT,
        entity: "User",
        entityId: userId,
      },
    });
  }

  /**
   * Retrieve current user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        stakeholderProfile: true,
        gatcProfile: true,
        gatcInspectorProfile: {
          include: {
            gatcAgency: {
              select: {
                id: true,
                agencyName: true,
                accreditationNumber: true,
                district: true,
                state: true,
                authorizedScope: true,
              },
            },
          },
        },
        officerProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "User profile not found.");
    }

    return user;
  }
}

export const authService = new AuthService();
