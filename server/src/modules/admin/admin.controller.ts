import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { CreateOfficerInput, CreateGatcAgencyInput, UpdateGatcAgencyInput } from "@sih/shared";

export class AdminController {
  async createOfficer(req: Request, res: Response) {
    const adminId = (req as any).user.id;
    const input = req.body as CreateOfficerInput;
    const officer = await adminService.createOfficer(adminId, input);
    res.status(201).json({
      success: true,
      data: officer,
      message: "Legal Metrology Officer provisioned successfully.",
    });
  }

  async listOfficers(req: Request, res: Response) {
    const officers = await adminService.listOfficers();
    res.status(200).json({
      success: true,
      data: officers,
    });
  }

  async createGatcAgency(req: Request, res: Response) {
    const adminId = (req as any).user.id;
    const input = req.body as CreateGatcAgencyInput;
    const agency = await adminService.createGatcAgency(adminId, input);
    res.status(201).json({
      success: true,
      data: agency,
      message: "GATC Agency provisioned successfully.",
    });
  }

  async listGatcAgencies(req: Request, res: Response) {
    const agencies = await adminService.listGatcAgencies();
    res.status(200).json({
      success: true,
      data: agencies,
    });
  }

  async updateGatcAgency(req: Request, res: Response) {
    const adminId = (req as any).user.id;
    const agencyId = req.params.id;
    const input = req.body as UpdateGatcAgencyInput;
    const updated = await adminService.updateGatcAgency(agencyId, input, adminId);
    res.status(200).json({
      success: true,
      data: updated,
      message: "GATC Agency details and statutory scopes updated successfully.",
    });
  }
}

export const adminController = new AdminController();
