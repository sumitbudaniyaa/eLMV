import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import {
  authLoginLimiter,
  authRegisterLimiter,
  authRefreshLimiter,
} from "../../middleware/rateLimiter";
import { registerSchema, loginSchema, refreshTokenSchema } from "@sih/shared";

export const authRouter = Router();

// Public routes with dedicated rate limiting
authRouter.post(
  "/register",
  authRegisterLimiter,
  validate({ body: registerSchema }),
  authController.register
);

authRouter.post(
  "/login",
  authLoginLimiter,
  validate({ body: loginSchema }),
  authController.login
);

authRouter.post(
  "/refresh",
  authRefreshLimiter,
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

