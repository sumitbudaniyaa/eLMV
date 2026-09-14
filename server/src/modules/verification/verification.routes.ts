import { Router } from "express";
import { verificationController } from "./verification.controller";

export const verificationRouter = Router();

// Completely public verification endpoints (no auth required)
verificationRouter.get("/verify/:identifier", verificationController.verify);
verificationRouter.get("/track/:applicationNumber", verificationController.track);
verificationRouter.get("/pdf/:identifier", verificationController.downloadPdf);
verificationRouter.get("/keys/active-public", verificationController.getActivePublicKey);

