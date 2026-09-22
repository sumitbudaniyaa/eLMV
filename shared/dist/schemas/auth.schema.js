"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Invalid email address"),
    phone: zod_1.z.string().trim().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters"),
    role: zod_1.z.nativeEnum(enums_1.Role).default(enums_1.Role.CONSUMER),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
//# sourceMappingURL=auth.schema.js.map