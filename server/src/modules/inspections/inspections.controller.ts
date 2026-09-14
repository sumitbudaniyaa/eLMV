import { Request, Response, NextFunction } from "express";
import { inspectionsService } from "./inspections.service";
import { uploadToCloudinary } from "../../config/cloudinary";
import { ApiResponse } from "@sih/shared";

export class InspectionsController {
  async record(req: Request, res: Response, next: NextFunction) {
    try {
      const inspection = await inspectionsService.recordInspection(
        req.user!.id,
        req.user!.role,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: inspection,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const inspection = await inspectionsService.getInspectionById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      const response: ApiResponse = {
        success: true,
        data: inspection,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "imageBase64 is required.",
          },
        });
      }

      const buffer = Buffer.from(
        imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      const photoUrl = await uploadToCloudinary(
        buffer,
        "inspections",
        filename || `insp-${Date.now()}`,
        "image"
      );

      const response: ApiResponse = {
        success: true,
        data: { url: photoUrl },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const inspectionsController = new InspectionsController();

