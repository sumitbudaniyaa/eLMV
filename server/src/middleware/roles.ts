import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { ErrorCode, Role } from "@sih/shared";

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
      return next(
        new AppError(
          403,
          ErrorCode.FORBIDDEN,
          `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

