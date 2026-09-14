import { Request, Response, NextFunction } from "express";
import { instrumentsService } from "./instruments.service";
import { ApiResponse, Role, InstrumentType } from "@sih/shared";

export class InstrumentsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instrument = await instrumentsService.createInstrument(
        req.user!.id,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: instrument,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, type, page, limit } = req.query;
      const result = await instrumentsService.listInstruments(
        req.user!.id,
        req.user!.role,
        {
          search: search as string,
          type: type as InstrumentType,
          page: page ? parseInt(page as string, 10) : undefined,
          limit: limit ? parseInt(limit as string, 10) : undefined,
        }
      );

      const response: ApiResponse = {
        success: true,
        data: result.instruments,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const instrument = await instrumentsService.getInstrumentById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      const response: ApiResponse = {
        success: true,
        data: instrument,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async lookupBySerial(req: Request, res: Response, next: NextFunction) {
    try {
      const instrument = await instrumentsService.lookupBySerialNumber(
        req.params.serialNumber
      );
      const response: ApiResponse = {
        success: true,
        data: instrument,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await instrumentsService.updateInstrument(
        req.params.id,
        req.user!.id,
        req.user!.role,
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

export const instrumentsController = new InstrumentsController();

