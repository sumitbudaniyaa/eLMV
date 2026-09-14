import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { requireAuth } from "../../middleware/auth";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", notificationsController.list);
notificationsRouter.patch("/:id/read", notificationsController.markAsRead);
notificationsRouter.patch("/read-all", notificationsController.markAllAsRead);

