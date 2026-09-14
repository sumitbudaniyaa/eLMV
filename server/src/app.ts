import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import { ApiResponse } from "@sih/shared";

// Create Express application
export const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin === env.CLIENT_URL ||
        origin === "http://localhost:5173" ||
        origin === "http://localhost:5174" ||
        origin === "http://localhost:5175" ||
        origin === "http://localhost:3000" ||
        /^http:\/\/[a-z0-9-]+\.localhost(:[0-9]+)?$/.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/.test(origin);

      if (isAllowed || env.NODE_ENV === "development") {
        return callback(null, true);
      }

      callback(new Error("CORS policy violation: origin not permitted"));
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  logger.debug({ method: req.method, path: req.path, ip: req.ip }, "Incoming Request");
  next();
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: string; env: string }> = {
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    },
  };
  res.status(200).json(response);
});

import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { instrumentsRouter } from "./modules/instruments/instruments.routes";
import { applicationsRouter } from "./modules/applications/applications.routes";
import { inspectionsRouter } from "./modules/inspections/inspections.routes";
import { certificatesRouter } from "./modules/certificates/certificates.routes";
import { verificationRouter } from "./modules/verification/verification.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { auditRouter } from "./modules/audit/audit.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { gatcRouter } from "./modules/gatc/gatc.routes";

// Root API v1 router placeholder (will mount all feature modules)
export const apiV1Router = express.Router();

apiV1Router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: "Online Verification System for Weighing & Measuring Instruments API",
      version: "v1",
      act: "Legal Metrology Act, 2009",
    },
  });
});

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/admin", adminRouter);
apiV1Router.use("/gatc", gatcRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/instruments", instrumentsRouter);
apiV1Router.use("/applications", applicationsRouter);
apiV1Router.use("/inspections", inspectionsRouter);
apiV1Router.use("/certificates", certificatesRouter);
apiV1Router.use("/verification", verificationRouter);
apiV1Router.use("/dashboard", dashboardRouter);
apiV1Router.use("/analytics", analyticsRouter);
apiV1Router.use("/notifications", notificationsRouter);
apiV1Router.use("/audit", auditRouter);

app.use("/api/v1", apiV1Router);

// Centralized error handler
app.use(errorHandler);

