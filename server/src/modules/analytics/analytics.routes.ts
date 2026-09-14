import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { Role } from "@sih/shared";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

// Analytics endpoints restricted to authorized staff & admin
analyticsRouter.get("/turnaround-time", analyticsController.getTurnaroundTime);
analyticsRouter.get("/pendency-trends", analyticsController.getPendencyTrends);
analyticsRouter.get("/officer-workload", analyticsController.getOfficerWorkload);
analyticsRouter.get("/regional", analyticsController.getRegional);

