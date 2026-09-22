import { z } from "zod";
export declare const analyticsDateFilterSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    district?: string | undefined;
    state?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    district?: string | undefined;
    state?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type AnalyticsDateFilter = z.infer<typeof analyticsDateFilterSchema>;
//# sourceMappingURL=analytics.schema.d.ts.map