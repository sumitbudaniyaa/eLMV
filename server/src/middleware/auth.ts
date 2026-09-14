import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";
import { ErrorCode, Role } from "@sih/shared";
import { prisma } from "../config/database";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Authentication required. No token provided."
      );
    }

    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new AppError(
          401,
          ErrorCode.UNAUTHORIZED,
          "Access token expired. Please refresh your session."
        );
      }
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "Invalid authentication token."
      );
    }

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(
        401,
        ErrorCode.UNAUTHORIZED,
        "User account not found or deactivated."
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

