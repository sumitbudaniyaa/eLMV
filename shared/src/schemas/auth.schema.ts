import { z } from "zod";
import { Role } from "../types/enums";

export const registerSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role).default(Role.CONSUMER),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

