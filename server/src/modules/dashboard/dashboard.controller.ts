import { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { ApiResponse } from "@sih/shared";

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary(
        req.user!.id,
        req.user!.role
      );
      const response: ApiResponse = {
        success: true,
        data: summary,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

