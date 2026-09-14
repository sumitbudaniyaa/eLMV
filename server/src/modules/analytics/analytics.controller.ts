import { Request, Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service";
import { ApiResponse } from "@sih/shared";

export class AnalyticsController {
  async getTurnaroundTime(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getTurnaroundTime(req.user!.id, req.user!.role);
      const response: ApiResponse = {
        success: true,
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPendencyTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getPendencyTrends(req.user!.id, req.user!.role);
      const response: ApiResponse = {
        success: true,
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOfficerWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getOfficerWorkload(req.user!.id, req.user!.role);
      const response: ApiResponse = {
        success: true,
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getRegional(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRegionalBreakdown(req.user!.id, req.user!.role);
      const response: ApiResponse = {
        success: true,
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

