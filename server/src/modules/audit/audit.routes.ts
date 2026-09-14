import { Router } from "express";
import { auditController } from "./audit.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { Role } from "@sih/shared";

export const auditRouter = Router();

auditRouter.use(requireAuth);
auditRouter.use(requireRole([Role.ADMIN]));

auditRouter.get("/", auditController.list);

