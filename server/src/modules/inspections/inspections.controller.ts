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
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "imageBase64 is required as a string.",
          },
        });
      }

      // Explicitly reject SVG, HTML, or other active media MIME types to prevent Stored XSS
      if (imageBase64.startsWith("data:")) {
        const mimeMatch = imageBase64.match(/^data:(image\/(jpeg|jpg|png|webp));base64,/i);
        if (!mimeMatch) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid image format. Only JPEG, PNG, and WebP images are permitted for inspection records. Vector SVG and active scripts are strictly rejected.",
            },
          });
        }
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      // File size bounds enforcement (Max 5MB decoded)
      const MAX_BYTES = 5 * 1024 * 1024;
      if (buffer.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Decoded image data is empty or invalid.",
          },
        });
      }

      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Image file size (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum permitted limit of 5MB.`,
          },
        });
      }

      // Binary Magic Byte Header Verification
      const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isWebp = buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";

      if (!isJpeg && !isPng && !isWebp) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Binary magic byte inspection failed. Uploaded file does not have a genuine JPEG, PNG, or WebP image signature.",
          },
        });
      }

      // Sanitize filename to prevent path traversal or injection
      const safeFilename = filename && typeof filename === "string"
        ? filename.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
        : `insp-${Date.now()}`;

      const photoUrl = await uploadToCloudinary(
        buffer,
        "inspections",
        safeFilename || `insp-${Date.now()}`,
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

