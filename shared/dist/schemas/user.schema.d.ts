import { z } from "zod";
import { StakeholderType } from "../types/enums";
export declare const stakeholderProfileSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodNativeEnum<typeof StakeholderType>>;
    businessName: z.ZodString;
    tradeLicenseNumber: z.ZodOptional<z.ZodString>;
    gstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    district: z.ZodString;
    state: z.ZodString;
    address: z.ZodString;
    pincode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: StakeholderType;
    businessName: string;
    district: string;
    state: string;
    address: string;
    pincode: string;
    tradeLicenseNumber?: string | undefined;
    gstin?: string | undefined;
}, {
    businessName: string;
    district: string;
    state: string;
    address: string;
    pincode: string;
    type?: StakeholderType | undefined;
    tradeLicenseNumber?: string | undefined;
    gstin?: string | undefined;
}>;
export type StakeholderProfileInput = z.infer<typeof stakeholderProfileSchema>;
export declare const gatcProfileSchema: z.ZodObject<{
    accreditationNumber: z.ZodString;
    notificationRefNumber: z.ZodOptional<z.ZodString>;
    authorizedScope: z.ZodArray<z.ZodString, "many">;
    validUntil: z.ZodString;
    district: z.ZodString;
    state: z.ZodString;
    address: z.ZodString;
}, "strip", z.ZodTypeAny, {
    district: string;
    state: string;
    address: string;
    accreditationNumber: string;
    authorizedScope: string[];
    validUntil: string;
    notificationRefNumber?: string | undefined;
}, {
    district: string;
    state: string;
    address: string;
    accreditationNumber: string;
    authorizedScope: string[];
    validUntil: string;
    notificationRefNumber?: string | undefined;
}>;
export type GATCProfileInput = z.infer<typeof gatcProfileSchema>;
export declare const officerProfileSchema: z.ZodObject<{
    badgeNumber: z.ZodString;
    jurisdictionDistrict: z.ZodString;
    jurisdictionState: z.ZodString;
    jurisdictionZone: z.ZodOptional<z.ZodString>;
    officeAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    badgeNumber: string;
    jurisdictionDistrict: string;
    jurisdictionState: string;
    jurisdictionZone?: string | undefined;
    officeAddress?: string | undefined;
}, {
    badgeNumber: string;
    jurisdictionDistrict: string;
    jurisdictionState: string;
    jurisdictionZone?: string | undefined;
    officeAddress?: string | undefined;
}>;
export type OfficerProfileInput = z.infer<typeof officerProfileSchema>;
export declare const createOfficerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    badgeNumber: z.ZodString;
    jurisdictionDistrict: z.ZodString;
    jurisdictionState: z.ZodString;
    jurisdictionZone: z.ZodOptional<z.ZodString>;
    officeAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    name: string;
    password: string;
    badgeNumber: string;
    jurisdictionDistrict: string;
    jurisdictionState: string;
    jurisdictionZone?: string | undefined;
    officeAddress?: string | undefined;
}, {
    email: string;
    phone: string;
    name: string;
    password: string;
    badgeNumber: string;
    jurisdictionDistrict: string;
    jurisdictionState: string;
    jurisdictionZone?: string | undefined;
    officeAddress?: string | undefined;
}>;
export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;
export declare const createGatcAgencySchema: z.ZodObject<{
    agencyName: z.ZodString;
    accreditationNumber: z.ZodString;
    notificationRefNumber: z.ZodOptional<z.ZodString>;
    authorizedScope: z.ZodArray<z.ZodString, "many">;
    validUntil: z.ZodUnion<[z.ZodString, z.ZodString]>;
    district: z.ZodString;
    state: z.ZodString;
    address: z.ZodString;
    adminName: z.ZodString;
    adminEmail: z.ZodString;
    adminPhone: z.ZodString;
    adminPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    district: string;
    state: string;
    address: string;
    accreditationNumber: string;
    authorizedScope: string[];
    validUntil: string;
    agencyName: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminPassword: string;
    notificationRefNumber?: string | undefined;
}, {
    district: string;
    state: string;
    address: string;
    accreditationNumber: string;
    authorizedScope: string[];
    validUntil: string;
    agencyName: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminPassword: string;
    notificationRefNumber?: string | undefined;
}>;
export type CreateGatcAgencyInput = z.infer<typeof createGatcAgencySchema>;
export declare const updateGatcAgencySchema: z.ZodObject<{
    agencyName: z.ZodOptional<z.ZodString>;
    notificationRefNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    authorizedScope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    validUntil: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    district?: string | undefined;
    state?: string | undefined;
    address?: string | undefined;
    notificationRefNumber?: string | null | undefined;
    authorizedScope?: string[] | undefined;
    validUntil?: string | undefined;
    agencyName?: string | undefined;
}, {
    district?: string | undefined;
    state?: string | undefined;
    address?: string | undefined;
    notificationRefNumber?: string | null | undefined;
    authorizedScope?: string[] | undefined;
    validUntil?: string | undefined;
    agencyName?: string | undefined;
}>;
export type UpdateGatcAgencyInput = z.infer<typeof updateGatcAgencySchema>;
export declare const createGatcInspectorSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    employeeId: z.ZodString;
    designation: z.ZodOptional<z.ZodString>;
    qualificationRef: z.ZodOptional<z.ZodString>;
    authorizedScope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    name: string;
    password: string;
    employeeId: string;
    authorizedScope?: string[] | undefined;
    designation?: string | undefined;
    qualificationRef?: string | undefined;
}, {
    email: string;
    phone: string;
    name: string;
    password: string;
    employeeId: string;
    authorizedScope?: string[] | undefined;
    designation?: string | undefined;
    qualificationRef?: string | undefined;
}>;
export type CreateGatcInspectorInput = z.infer<typeof createGatcInspectorSchema>;
export declare const updateCredentialsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    name?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    name?: string | undefined;
}>;
export type UpdateCredentialsInput = z.infer<typeof updateCredentialsSchema>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
//# sourceMappingURL=user.schema.d.ts.map