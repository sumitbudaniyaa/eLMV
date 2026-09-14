import { Request, Response } from "express";
import { gatcService } from "./gatc.service";
import { CreateGatcInspectorInput } from "@sih/shared";

export class GatcController {
  async createInspector(req: Request, res: Response) {
    const gatcAdminUserId = (req as any).user.id;
    const input = req.body as CreateGatcInspectorInput;
    const inspector = await gatcService.createInspector(gatcAdminUserId, input);
    res.status(201).json({
      success: true,
      data: inspector,
      message: "GATC Field Inspector registered successfully.",
    });
  }

  async listInspectors(req: Request, res: Response) {
    const gatcAdminUserId = (req as any).user.id;
    const inspectors = await gatcService.listInspectors(gatcAdminUserId);
    res.status(200).json({
      success: true,
      data: inspectors,
    });
  }

  async delegateApplication(req: Request, res: Response) {
    const gatcAdminUserId = (req as any).user.id;
    const { id } = req.params;
    const { inspectorId } = req.body;
    const application = await gatcService.delegateApplication(gatcAdminUserId, id, inspectorId);
    res.status(200).json({
      success: true,
      data: application,
      message: "Testing job delegated to inspector successfully.",
    });
  }
}

export const gatcController = new GatcController();
