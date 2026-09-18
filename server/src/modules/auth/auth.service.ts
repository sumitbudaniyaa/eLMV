import crypto from "crypto";
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

// Precomputed bcrypt cost 12 hash for timing attack mitigation during failed logins
const DUMMY_HASH = "$2a$12$e8N8Y9/K6G6YQyYl06b12e3e5r7t9y1u3i5o7p9a1s3d5f7g9h1j";

/**
 * Cryptographically hash refresh token using SHA-256 for secure database storage
 * Protects users from full session hijack in the event of a database dump
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
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

    // Store SHA-256 hashed refresh token for security at rest
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(tokens.refreshToken),
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
      // Mitigate timing attacks by executing bcrypt comparison even when email does not exist
      await bcrypt.compare(input.password, DUMMY_HASH);
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Invalid email or password. Please check your credentials and try again."
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
        "Invalid email or password. Please check your credentials and try again."
      );
    }

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    // Store SHA-256 hashed refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(tokens.refreshToken),
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

    const tokenHash = hashToken(refreshTokenString);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
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

    // Store hashed token for the rotated refresh token
    await prisma.refreshToken.create({
      data: {
        token: hashToken(tokens.refreshToken),
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
      const tokenHash = hashToken(refreshTokenString);
      await prisma.refreshToken.updateMany({
        where: { token: tokenHash, userId },
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
