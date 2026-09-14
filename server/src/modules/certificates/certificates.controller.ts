import { Request, Response, NextFunction } from "express";
import { certificatesService } from "./certificates.service";
import { ApiResponse } from "@sih/shared";

export class CertificatesController {
  async issue(req: Request, res: Response, next: NextFunction) {
    try {
      const certificate = await certificatesService.issueCertificate(
        req.user!.id,
        req.user!.role,
        req.body
      );
      const response: ApiResponse = {
        success: true,
        data: certificate,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await certificatesService.listCertificates({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      const response: ApiResponse = {
        success: true,
        data: result.certificates,
        meta: result.meta,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cert = await certificatesService.getCertificateById(req.params.id);
      const response: ApiResponse = {
        success: true,
        data: cert,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const certificatesController = new CertificatesController();

