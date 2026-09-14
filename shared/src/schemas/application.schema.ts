import { z } from "zod";
import { ApplicationType, ApplicationStatus } from "../types/enums";

export const createApplicationSchema = z.object({
  instrumentId: z.string().uuid("Invalid instrument ID"),
  type: z.nativeEnum(ApplicationType).default(ApplicationType.NEW),
  remarks: z.string().trim().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const assignOfficerSchema = z.object({
  officerId: z.string().uuid("Invalid officer ID"),
});

export type AssignOfficerInput = z.infer<typeof assignOfficerSchema>;

export const scheduleApplicationSchema = z.object({
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid scheduled datetime required",
  }),
  remarks: z.string().trim().optional(),
});

export type ScheduleApplicationInput = z.infer<typeof scheduleApplicationSchema>;

export const rejectApplicationSchema = z.object({
  rejectionReason: z.string().trim().min(5, "A descriptive rejection reason is required"),
});

export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;

