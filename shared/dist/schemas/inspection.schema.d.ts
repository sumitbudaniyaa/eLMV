import { z } from "zod";
import { InspectionResult } from "../types/enums";
export declare const createInspectionSchema: z.ZodObject<{
    applicationId: z.ZodString;
    result: z.ZodNativeEnum<typeof InspectionResult>;
    observations: z.ZodRecord<z.ZodString, z.ZodAny>;
    standardsUsed: z.ZodArray<z.ZodString, "many">;
    maxPermissibleError: z.ZodNumber;
    actualErrorObserved: z.ZodNumber;
    photoUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sealNumber: z.ZodOptional<z.ZodString>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    applicationId: string;
    result: InspectionResult;
    observations: Record<string, any>;
    standardsUsed: string[];
    maxPermissibleError: number;
    actualErrorObserved: number;
    photoUrls: string[];
    remarks?: string | undefined;
    sealNumber?: string | undefined;
}, {
    applicationId: string;
    result: InspectionResult;
    observations: Record<string, any>;
    standardsUsed: string[];
    maxPermissibleError: number;
    actualErrorObserved: number;
    remarks?: string | undefined;
    photoUrls?: string[] | undefined;
    sealNumber?: string | undefined;
}>;
export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
//# sourceMappingURL=inspection.schema.d.ts.map