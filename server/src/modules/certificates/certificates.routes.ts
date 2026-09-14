import { Router } from "express";
import { certificatesController } from "./certificates.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import { issueCertificateSchema, Role } from "@sih/shared";

export const certificatesRouter = Router();

certificatesRouter.use(requireAuth);

// Issue digitally signed certificate (LMO, GATC_INSPECTOR, GATC_ADMIN, ADMIN)
certificatesRouter.post(
  "/issue",
  requireRole([Role.LMO, Role.GATC_INSPECTOR, Role.GATC_ADMIN, Role.ADMIN]),
  validate({ body: issueCertificateSchema }),
  certificatesController.issue
);

// List certificates
certificatesRouter.get("/", certificatesController.list);

// Get certificate by ID
certificatesRouter.get("/:id", certificatesController.getById);

