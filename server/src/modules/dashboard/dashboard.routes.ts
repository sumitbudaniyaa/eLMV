import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { requireAuth } from "../../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", dashboardController.getSummary);

