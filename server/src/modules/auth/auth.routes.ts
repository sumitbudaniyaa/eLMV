import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { registerSchema, loginSchema, refreshTokenSchema } from "@sih/shared";

export const authRouter = Router();

// Public routes
authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login
);

authRouter.post(
  "/refresh",
  authController.refresh
);

// Authenticated routes
authRouter.post(
  "/logout",
  requireAuth,
  authController.logout
);

authRouter.get(
  "/me",
  requireAuth,
  authController.getMe
);

