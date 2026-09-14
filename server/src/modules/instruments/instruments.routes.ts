import { Router } from "express";
import { instrumentsController } from "./instruments.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import { createInstrumentSchema, updateInstrumentSchema, Role } from "@sih/shared";

export const instrumentsRouter = Router();

instrumentsRouter.use(requireAuth);

// Register instrument (Consumers / Traders only)
instrumentsRouter.post(
  "/",
  requireRole([Role.CONSUMER]),
  validate({ body: createInstrumentSchema }),
  instrumentsController.create
);

// List instruments (role-aware filtering)
instrumentsRouter.get("/", instrumentsController.list);

// Lookup by serial number
instrumentsRouter.get("/lookup/:serialNumber", instrumentsController.lookupBySerial);

// Get instrument by ID
instrumentsRouter.get("/:id", instrumentsController.getById);

// Update instrument
instrumentsRouter.put(
  "/:id",
  validate({ body: updateInstrumentSchema }),
  instrumentsController.update
);

