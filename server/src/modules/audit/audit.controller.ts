import { Request, Response, NextFunction } from "express";
import { auditService } from "./audit.service";
import { ApiResponse, AuditAction } from "@sih/shared";

export class AuditController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { actorId, entity, action, page, limit } = req.query;
      const result = await auditService.listAuditLogs({
        actorId: actorId as string,
        entity: entity as string,
        action: action as AuditAction,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: result.logs,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();

