import { z } from "zod";

export const analyticsDateFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
});

export type AnalyticsDateFilter = z.infer<typeof analyticsDateFilterSchema>;

