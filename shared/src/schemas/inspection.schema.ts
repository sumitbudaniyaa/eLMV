import { z } from "zod";
import { InspectionResult } from "../types/enums";

export const createInspectionSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  result: z.nativeEnum(InspectionResult),
  observations: z.record(z.any()), // Structured tests: repeatability, eccentricity, linearity, zero error
  standardsUsed: z.array(z.string().trim().min(1)).min(1, "At least one standard weight/measure must be documented"),
  maxPermissibleError: z.number().positive("MPE must be a positive number"),
  actualErrorObserved: z.number().nonnegative("Actual error must be non-negative"),
  photoUrls: z.array(z.string()).default([]),
  sealNumber: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

