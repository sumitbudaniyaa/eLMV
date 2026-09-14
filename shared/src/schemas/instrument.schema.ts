import { z } from "zod";
import { InstrumentType } from "../types/enums";

export const createInstrumentSchema = z.object({
  type: z.nativeEnum(InstrumentType),
  category: z.string().trim().min(2, "Category is required"),
  make: z.string().trim().min(2, "Make is required"),
  model: z.string().trim().min(1, "Model is required"),
  serialNumber: z.string().trim().min(2, "Serial number is required"),
  capacity: z.number().positive("Capacity must be greater than zero"),
  unit: z.string().trim().min(1, "Unit of measurement is required"),
  accuracyClass: z.string().trim().min(1, "Accuracy class is required"),
  verificationInterval: z.number().int().min(1).default(12),
  installationAddress: z.string().trim().min(5, "Installation address is required"),
  district: z.string().trim().min(2, "District is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit PIN code"),
});

export type CreateInstrumentInput = z.infer<typeof createInstrumentSchema>;

export const updateInstrumentSchema = createInstrumentSchema.partial();
export type UpdateInstrumentInput = z.infer<typeof updateInstrumentSchema>;

