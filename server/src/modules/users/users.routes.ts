import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import {
  stakeholderProfileSchema,
  gatcProfileSchema,
  updateCredentialsSchema,
  changePasswordSchema,
  Role,
} from "@sih/shared";

export const usersRouter = Router();

usersRouter.use(requireAuth);

// Update user credentials (name, phone) - Email is strictly non-changeable
usersRouter.patch(
  "/credentials",
  validate({ body: updateCredentialsSchema }),
  usersController.updateCredentials
);

// Change password
usersRouter.post(
  "/change-password",
  validate({ body: changePasswordSchema }),
  usersController.changePassword
);

// Admin listing
usersRouter.get(
  "/",
  requireRole([Role.ADMIN]),
  usersController.listUsers
);

// Get user by ID (or self)
usersRouter.get("/:id", usersController.getUser);

// Stakeholder profile update
usersRouter.post(
  "/stakeholder-profile",
  validate({ body: stakeholderProfileSchema }),
  usersController.updateStakeholderProfile
);

// GATC profile update
usersRouter.post(
  "/gatc-profile",
  requireRole([Role.GATC_ADMIN, Role.ADMIN]),
  validate({ body: gatcProfileSchema }),
  usersController.updateGatcProfile
);

