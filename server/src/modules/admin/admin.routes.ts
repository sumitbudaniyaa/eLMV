import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import { createOfficerSchema, createGatcAgencySchema, updateGatcAgencySchema, Role } from "@sih/shared";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole([Role.ADMIN]));

// LMO Management
adminRouter.post(
  "/officers",
  validate({ body: createOfficerSchema }),
  adminController.createOfficer
);
adminRouter.get("/officers", adminController.listOfficers);

// GATC Agency Management
adminRouter.post(
  "/gatc-agencies",
  validate({ body: createGatcAgencySchema }),
  adminController.createGatcAgency
);
adminRouter.get("/gatc-agencies", adminController.listGatcAgencies);
adminRouter.patch(
  "/gatc-agencies/:id",
  validate({ body: updateGatcAgencySchema }),
  adminController.updateGatcAgency
);
