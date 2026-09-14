import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiResponse, ErrorCode } from "@sih/shared";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      path: req.path,
      method: req.method,
    },
    "Request error handled"
  );

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "The submitted data failed validation.",
        details,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle Known AppErrors
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma Unique Constraint or Not Found errors
  if (err.code === "P2002") {
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.CONFLICT,
        message: "A record with this unique attribute already exists.",
        details: err.meta?.target
          ? [{ field: String(err.meta.target), message: "Unique constraint violated" }]
          : undefined,
      },
    };
    res.status(409).json(response);
    return;
  }

  if (err.code === "P2025") {
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: "The requested record was not found.",
      },
    };
    res.status(404).json(response);
    return;
  }

  // Fallback 500
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An internal server error occurred.",
    },
  };
  res.status(500).json(response);
}

