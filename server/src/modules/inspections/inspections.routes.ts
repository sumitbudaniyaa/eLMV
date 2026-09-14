import { Router } from "express";
import { inspectionsController } from "./inspections.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import { createInspectionSchema, Role } from "@sih/shared";

export const inspectionsRouter = Router();

inspectionsRouter.use(requireAuth);

// Record inspection results (LMO & GATC Inspector only)
inspectionsRouter.post(
  "/",
  requireRole([Role.LMO, Role.GATC_INSPECTOR, Role.GATC_ADMIN, Role.ADMIN]),
  validate({ body: createInspectionSchema }),
  inspectionsController.record
);

// Get inspection record
inspectionsRouter.get("/:id", inspectionsController.getById);

// Upload photo
inspectionsRouter.post(
  "/upload-photo",
  requireRole([Role.LMO, Role.GATC_INSPECTOR, Role.GATC_ADMIN, Role.ADMIN]),
  inspectionsController.uploadPhoto
);

