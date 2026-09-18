import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { ErrorCode, Role } from "@sih/shared";
import { logger } from "../config/logger";

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          401,
          ErrorCode.UNAUTHORIZED,
          "User authentication is required."
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Internal audit log for security monitoring
      logger.warn(
        {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.originalUrl || req.path,
        },
        "RBAC Authorization failed: Insufficient role permissions"
      );

      // Defense-in-depth: Non-leaking generic error message to external clients
      return next(
        new AppError(
          403,
          ErrorCode.FORBIDDEN,
          "Access denied. You do not have permission to perform this action."
        )
      );
    }

    next();
  };
}

