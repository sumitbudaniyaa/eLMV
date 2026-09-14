import { Request, Response, NextFunction } from "express";
import { applicationsService } from "./applications.service";
import { ApiResponse, ApplicationStatus } from "@sih/shared";

export class ApplicationsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await applicationsService.createApplication(
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: application,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await applicationsService.listApplications(
        req.user!.id,
        req.user!.role,
        {
          status: status as ApplicationStatus,
          search: search as string,
          page: page ? parseInt(page as string, 10) : undefined,
          limit: limit ? parseInt(limit as string, 10) : undefined,
        }
      );

      const response: ApiResponse = {
        success: true,
        data: result.applications,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await applicationsService.getApplicationById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      const response: ApiResponse = {
        success: true,
        data: application,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async assignOfficer(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await applicationsService.assignOfficer(
        req.params.id,
        req.body.officerId,
        req.user!.id
      );
      const response: ApiResponse = {
        success: true,
        data: updated,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await applicationsService.scheduleInspection(
        req.params.id,
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: updated,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await applicationsService.rejectApplication(
        req.params.id,
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: updated,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const applicationsController = new ApplicationsController();

