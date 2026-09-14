import { Router } from "express";
import { gatcController } from "./gatc.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import { createGatcInspectorSchema, Role } from "@sih/shared";

export const gatcRouter = Router();

gatcRouter.use(requireAuth);
gatcRouter.use(requireRole([Role.GATC_ADMIN]));

// Staff & Inspector Management
gatcRouter.post(
  "/inspectors",
  validate({ body: createGatcInspectorSchema }),
  gatcController.createInspector
);
gatcRouter.get("/inspectors", gatcController.listInspectors);

// Application Delegation
gatcRouter.post(
  "/applications/:id/delegate",
  gatcController.delegateApplication
);
