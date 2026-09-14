import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";
import { ApiResponse, Role } from "@sih/shared";

export class UsersController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id === "me" ? req.user!.id : req.params.id;
      const user = await usersService.getUserById(id);
      const response: ApiResponse = {
        success: true,
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search, page, limit } = req.query;
      const result = await usersService.listUsers({
        role: role as Role,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: result.users,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateStakeholderProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.upsertStakeholderProfile(
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: profile,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateGatcProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.upsertGatcProfile(
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: profile,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await usersService.updateCredentials(
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

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.changePassword(
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

