import { z } from "zod";
import { ApplicationType } from "../types/enums";
export declare const createApplicationSchema: z.ZodObject<{
    instrumentId: z.ZodString;
    type: z.ZodDefault<z.ZodNativeEnum<typeof ApplicationType>>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: ApplicationType;
    instrumentId: string;
    remarks?: string | undefined;
}, {
    instrumentId: string;
    type?: ApplicationType | undefined;
    remarks?: string | undefined;
}>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export declare const assignOfficerSchema: z.ZodObject<{
    officerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    officerId: string;
}, {
    officerId: string;
}>;
export type AssignOfficerInput = z.infer<typeof assignOfficerSchema>;
export declare const scheduleApplicationSchema: z.ZodObject<{
    scheduledDate: z.ZodEffects<z.ZodString, string, string>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    scheduledDate: string;
    remarks?: string | undefined;
}, {
    scheduledDate: string;
    remarks?: string | undefined;
}>;
export type ScheduleApplicationInput = z.infer<typeof scheduleApplicationSchema>;
export declare const rejectApplicationSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rejectionReason: string;
}, {
    rejectionReason: string;
}>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
//# sourceMappingURL=application.schema.d.ts.map