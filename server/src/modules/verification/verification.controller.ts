import { Request, Response, NextFunction } from "express";
import { verificationService } from "./verification.service";
import { certificatesService } from "../certificates/certificates.service";
import { ApiResponse } from "@sih/shared";

export class VerificationController {
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.params;
      const result = await verificationService.verifyCertificate(identifier);
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getActivePublicKey(_req: Request, res: Response, next: NextFunction) {
    try {
      const key = await verificationService.getActivePublicKey();
      const response: ApiResponse = {
        success: true,
        data: key,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.params;
      const { pdfBuffer, certificateNumber } = await certificatesService.getCertificatePdfBuffer(identifier);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Certificate-${certificateNumber}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async track(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationNumber } = req.params;
      const result = await verificationService.trackApplication(applicationNumber);
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

export const verificationController = new VerificationController();

