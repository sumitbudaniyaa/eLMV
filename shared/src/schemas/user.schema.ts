import { z } from "zod";
import { StakeholderType } from "../types/enums";

export const stakeholderProfileSchema = z.object({
  type: z.nativeEnum(StakeholderType).default(StakeholderType.COMMERCIAL_USER),
  businessName: z.string().trim().min(2, "Business name is required"),
  tradeLicenseNumber: z.string().trim().optional(),
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
    .optional()
    .or(z.literal("")),
  district: z.string().trim().min(2, "District is required"),
  state: z.string().trim().min(2, "State is required"),
  address: z.string().trim().min(5, "Address is required"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit Indian PIN code"),
});

export type StakeholderProfileInput = z.infer<typeof stakeholderProfileSchema>;

export const gatcProfileSchema = z.object({
  accreditationNumber: z.string().trim().min(3, "Accreditation number is required"),
  notificationRefNumber: z.string().trim().optional(),
  authorizedScope: z.array(z.string()).min(1, "At least one scope must be selected"),
  validUntil: z.string().datetime("Valid ISO datetime required"),
  district: z.string().trim().min(2, "District is required"),
  state: z.string().trim().min(2, "State is required"),
  address: z.string().trim().min(5, "Address is required"),
});

export type GATCProfileInput = z.infer<typeof gatcProfileSchema>;

export const officerProfileSchema = z.object({
  badgeNumber: z.string().trim().min(3, "Badge number is required"),
  jurisdictionDistrict: z.string().trim().min(2, "Jurisdiction district is required"),
  jurisdictionState: z.string().trim().min(2, "Jurisdiction state is required"),
  jurisdictionZone: z.string().trim().optional(),
  officeAddress: z.string().trim().optional(),
});

export type OfficerProfileInput = z.infer<typeof officerProfileSchema>;

// Admin creates an LMO Officer account
export const createOfficerSchema = z.object({
  name: z.string().trim().min(2, "Officer name is required"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(10, "Valid phone required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  badgeNumber: z.string().trim().min(3, "Badge number is required"),
  jurisdictionDistrict: z.string().trim().min(2, "Jurisdiction district is required"),
  jurisdictionState: z.string().trim().min(2, "Jurisdiction state is required"),
  jurisdictionZone: z.string().trim().optional(),
  officeAddress: z.string().trim().optional(),
});

export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;

// Admin creates a GATC Agency account
export const createGatcAgencySchema = z.object({
  agencyName: z.string().trim().min(2, "Agency / Laboratory name is required"),
  accreditationNumber: z.string().trim().min(3, "Accreditation number is required"),
  notificationRefNumber: z.string().trim().optional(),
  authorizedScope: z.array(z.string()).min(1, "At least one scope must be selected"),
  validUntil: z.string().datetime("Valid ISO datetime required").or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  district: z.string().trim().min(2, "District is required"),
  state: z.string().trim().min(2, "State is required"),
  address: z.string().trim().min(5, "Address is required"),
  adminName: z.string().trim().min(2, "Agency Admin name is required"),
  adminEmail: z.string().trim().email("Valid email required"),
  adminPhone: z.string().trim().min(10, "Valid phone required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateGatcAgencyInput = z.infer<typeof createGatcAgencySchema>;

// GATC Agency Admin creates an in-house Field Inspector
export const createGatcInspectorSchema = z.object({
  name: z.string().trim().min(2, "Inspector name is required"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(10, "Valid phone required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  employeeId: z.string().trim().min(2, "Staff / Employee ID is required"),
  designation: z.string().trim().optional(),
  qualificationRef: z.string().trim().optional(),
  authorizedScope: z.array(z.string()).optional(),
});

export type CreateGatcInspectorInput = z.infer<typeof createGatcInspectorSchema>;

// Update user credentials (name, phone) - email is forbidden from changing
export const updateCredentialsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number").optional(),
  email: z.string().trim().email("Invalid email address").optional(),
});

export type UpdateCredentialsInput = z.infer<typeof updateCredentialsSchema>;

// Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


