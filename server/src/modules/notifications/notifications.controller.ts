import { Request, Response, NextFunction } from "express";
import { notificationsService } from "./notifications.service";
import { ApiResponse } from "@sih/shared";

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await notificationsService.getNotifications(
        req.user!.id,
        page,
        limit
      );
      const response: ApiResponse = {
        success: true,
        data: result.notifications,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.params.id, req.user!.id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();

