import { Router } from "express";
import { applicationsController } from "./applications.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import {
  createApplicationSchema,
  assignOfficerSchema,
  scheduleApplicationSchema,
  rejectApplicationSchema,
  Role,
} from "@sih/shared";

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

// Submit application
applicationsRouter.post(
  "/",
  validate({ body: createApplicationSchema }),
  applicationsController.create
);

// List applications
applicationsRouter.get("/", applicationsController.list);

// Get application by ID
applicationsRouter.get("/:id", applicationsController.getById);

// Admin assign officer
applicationsRouter.patch(
  "/:id/assign",
  requireRole([Role.ADMIN]),
  validate({ body: assignOfficerSchema }),
  applicationsController.assignOfficer
);

// Schedule inspection (LMO, GATC_INSPECTOR, GATC_ADMIN, ADMIN)
applicationsRouter.patch(
  "/:id/schedule",
  requireRole([Role.LMO, Role.GATC_INSPECTOR, Role.GATC_ADMIN, Role.ADMIN]),
  validate({ body: scheduleApplicationSchema }),
  applicationsController.schedule
);

// Reject application (LMO, GATC_INSPECTOR, GATC_ADMIN, ADMIN)
applicationsRouter.patch(
  "/:id/reject",
  requireRole([Role.LMO, Role.GATC_INSPECTOR, Role.GATC_ADMIN, Role.ADMIN]),
  validate({ body: rejectApplicationSchema }),
  applicationsController.reject
);

