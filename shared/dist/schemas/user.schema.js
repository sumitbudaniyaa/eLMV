"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateCredentialsSchema = exports.createGatcInspectorSchema = exports.updateGatcAgencySchema = exports.createGatcAgencySchema = exports.createOfficerSchema = exports.officerProfileSchema = exports.gatcProfileSchema = exports.stakeholderProfileSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.stakeholderProfileSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enums_1.StakeholderType).default(enums_1.StakeholderType.COMMERCIAL_USER),
    businessName: zod_1.z.string().trim().min(2, "Business name is required"),
    tradeLicenseNumber: zod_1.z.string().trim().optional(),
    gstin: zod_1.z
        .string()
        .trim()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
        .optional()
        .or(zod_1.z.literal("")),
    district: zod_1.z.string().trim().min(2, "District is required"),
    state: zod_1.z.string().trim().min(2, "State is required"),
    address: zod_1.z.string().trim().min(5, "Address is required"),
    pincode: zod_1.z.string().trim().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit Indian PIN code"),
});
exports.gatcProfileSchema = zod_1.z.object({
    accreditationNumber: zod_1.z.string().trim().min(3, "Accreditation number is required"),
    notificationRefNumber: zod_1.z.string().trim().optional(),
    authorizedScope: zod_1.z.array(zod_1.z.string()).min(1, "At least one scope must be selected"),
    validUntil: zod_1.z.string().datetime("Valid ISO datetime required"),
    district: zod_1.z.string().trim().min(2, "District is required"),
    state: zod_1.z.string().trim().min(2, "State is required"),
    address: zod_1.z.string().trim().min(5, "Address is required"),
});
exports.officerProfileSchema = zod_1.z.object({
    badgeNumber: zod_1.z.string().trim().min(3, "Badge number is required"),
    jurisdictionDistrict: zod_1.z.string().trim().min(2, "Jurisdiction district is required"),
    jurisdictionState: zod_1.z.string().trim().min(2, "Jurisdiction state is required"),
    jurisdictionZone: zod_1.z.string().trim().optional(),
    officeAddress: zod_1.z.string().trim().optional(),
});
// Admin creates an LMO Officer account
exports.createOfficerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Officer name is required"),
    email: zod_1.z.string().trim().email("Valid email required"),
    phone: zod_1.z.string().trim().min(10, "Valid phone required"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    badgeNumber: zod_1.z.string().trim().min(3, "Badge number is required"),
    jurisdictionDistrict: zod_1.z.string().trim().min(2, "Jurisdiction district is required"),
    jurisdictionState: zod_1.z.string().trim().min(2, "Jurisdiction state is required"),
    jurisdictionZone: zod_1.z.string().trim().optional(),
    officeAddress: zod_1.z.string().trim().optional(),
});
// Admin creates a GATC Agency account
exports.createGatcAgencySchema = zod_1.z.object({
    agencyName: zod_1.z.string().trim().min(2, "Agency / Laboratory name is required"),
    accreditationNumber: zod_1.z.string().trim().min(3, "Accreditation number is required"),
    notificationRefNumber: zod_1.z.string().trim().optional(),
    authorizedScope: zod_1.z.array(zod_1.z.string()).min(1, "At least one scope must be selected"),
    validUntil: zod_1.z.string().datetime("Valid ISO datetime required").or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    district: zod_1.z.string().trim().min(2, "District is required"),
    state: zod_1.z.string().trim().min(2, "State is required"),
    address: zod_1.z.string().trim().min(5, "Address is required"),
    adminName: zod_1.z.string().trim().min(2, "Agency Admin name is required"),
    adminEmail: zod_1.z.string().trim().email("Valid email required"),
    adminPhone: zod_1.z.string().trim().min(10, "Valid phone required"),
    adminPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
// Admin updates an existing GATC Agency
exports.updateGatcAgencySchema = zod_1.z.object({
    agencyName: zod_1.z.string().trim().min(2, "Agency / Laboratory name is required").optional(),
    notificationRefNumber: zod_1.z.string().trim().optional().nullable(),
    authorizedScope: zod_1.z.array(zod_1.z.string()).min(1, "At least one scope must be selected").optional(),
    validUntil: zod_1.z.string().datetime("Valid ISO datetime required").or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    district: zod_1.z.string().trim().min(2, "District is required").optional(),
    state: zod_1.z.string().trim().min(2, "State is required").optional(),
    address: zod_1.z.string().trim().min(5, "Address is required").optional(),
});
// GATC Agency Admin creates an in-house Field Inspector
exports.createGatcInspectorSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Inspector name is required"),
    email: zod_1.z.string().trim().email("Valid email required"),
    phone: zod_1.z.string().trim().min(10, "Valid phone required"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    employeeId: zod_1.z.string().trim().min(2, "Staff / Employee ID is required"),
    designation: zod_1.z.string().trim().optional(),
    qualificationRef: zod_1.z.string().trim().optional(),
    authorizedScope: zod_1.z.array(zod_1.z.string()).optional(),
});
// Update user credentials (name, phone) - email is forbidden from changing
exports.updateCredentialsSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    phone: zod_1.z.string().trim().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number").optional(),
    email: zod_1.z.string().trim().email("Invalid email address").optional(),
});
// Change password
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: zod_1.z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
});
//# sourceMappingURL=user.schema.js.map