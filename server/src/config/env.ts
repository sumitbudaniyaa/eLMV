import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load from current working dir or repo root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const envSchema = z.object({
  PORT: z.string().default("5001").transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z
    .string()
    .default(
      process.env.NODE_ENV === "test"
        ? "postgresql://postgres:postgrespassword@localhost:5432/legal_metrology_test"
        : "postgresql://postgres:postgrespassword@localhost:5432/legal_metrology?schema=public"
    ),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("test-jwt-access-secret-key-32chars!!"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("test-jwt-refresh-secret-key-32chars!"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLOUDINARY_CLOUD_NAME: z.string().default("demo-cloud"),
  CLOUDINARY_API_KEY: z.string().default("123456789012345"),
  CLOUDINARY_API_SECRET: z.string().default("abcdefghijklmnopqrstuvwxyz12"),
  PKI_ACTIVE_KEY_VERSION: z.string().default("v1-2026"),
  PKI_KEY_ENCRYPTION_SECRET: z
    .string()
    .min(16)
    .default("default-pki-secret-key-32chars!"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  PUBLIC_VERIFICATION_URL: z.string().default("http://localhost:5173/verify"),
}).superRefine((data, ctx) => {
  // CRITICAL SECURITY ENFORCEMENT:
  // In production, reject known development fallback secrets, enforce cryptographic length >= 32 chars
  if (data.NODE_ENV === "production") {
    if (data.JWT_ACCESS_SECRET === "test-jwt-access-secret-key-32chars!!" || data.JWT_ACCESS_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_ACCESS_SECRET"],
        message: "CRITICAL: In production, JWT_ACCESS_SECRET must be set and contain at least 32 characters of high-entropy secret.",
      });
    }

    if (data.JWT_REFRESH_SECRET === "test-jwt-refresh-secret-key-32chars!" || data.JWT_REFRESH_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_REFRESH_SECRET"],
        message: "CRITICAL: In production, JWT_REFRESH_SECRET must be set and contain at least 32 characters of high-entropy secret.",
      });
    }

    if (data.PKI_KEY_ENCRYPTION_SECRET === "default-pki-secret-key-32chars!" || data.PKI_KEY_ENCRYPTION_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["PKI_KEY_ENCRYPTION_SECRET"],
        message: "CRITICAL: In production, PKI_KEY_ENCRYPTION_SECRET must be set and contain at least 32 characters to encrypt root ECDSA keys at rest.",
      });
    }

    if (data.DATABASE_URL.includes("postgrespassword")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "CRITICAL: Default local database password 'postgrespassword' cannot be used in production.",
      });
    }

    if (data.CLOUDINARY_API_SECRET === "abcdefghijklmnopqrstuvwxyz12") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CLOUDINARY_API_SECRET"],
        message: "CRITICAL: Demo Cloudinary API secret cannot be used in production.",
      });
    }
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("CRITICAL CONFIGURATION ERROR: Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
