import { z } from "zod";
import { Role } from "../types/enums";
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodString;
    name: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof Role>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    name: string;
    password: string;
    role: Role;
}, {
    email: string;
    phone: string;
    name: string;
    password: string;
    role?: Role | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
//# sourceMappingURL=auth.schema.d.ts.map