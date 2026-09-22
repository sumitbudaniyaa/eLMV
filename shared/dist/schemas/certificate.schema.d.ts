import { z } from "zod";
export declare const issueCertificateSchema: z.ZodObject<{
    applicationId: z.ZodString;
    validUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    applicationId: string;
    validUntil?: string | undefined;
}, {
    applicationId: string;
    validUntil?: string | undefined;
}>;
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export declare const canonicalCertificatePayloadSchema: z.ZodObject<{
    certificateNumber: z.ZodString;
    applicationId: z.ZodString;
    instrumentSerialNumber: z.ZodString;
    instrumentType: z.ZodString;
    make: z.ZodString;
    model: z.ZodString;
    capacity: z.ZodNumber;
    unit: z.ZodString;
    accuracyClass: z.ZodString;
    applicantName: z.ZodString;
    applicantBusiness: z.ZodString;
    inspectingOfficerId: z.ZodString;
    inspectingOfficerName: z.ZodString;
    inspectionDate: z.ZodString;
    issuedAt: z.ZodString;
    validUntil: z.ZodString;
    maxPermissibleError: z.ZodNumber;
    actualErrorObserved: z.ZodNumber;
    sealNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    signingKeyVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    validUntil: string;
    make: string;
    model: string;
    capacity: number;
    unit: string;
    accuracyClass: string;
    applicationId: string;
    maxPermissibleError: number;
    actualErrorObserved: number;
    certificateNumber: string;
    instrumentSerialNumber: string;
    instrumentType: string;
    applicantName: string;
    applicantBusiness: string;
    inspectingOfficerId: string;
    inspectingOfficerName: string;
    inspectionDate: string;
    issuedAt: string;
    signingKeyVersion: string;
    sealNumber?: string | null | undefined;
}, {
    validUntil: string;
    make: string;
    model: string;
    capacity: number;
    unit: string;
    accuracyClass: string;
    applicationId: string;
    maxPermissibleError: number;
    actualErrorObserved: number;
    certificateNumber: string;
    instrumentSerialNumber: string;
    instrumentType: string;
    applicantName: string;
    applicantBusiness: string;
    inspectingOfficerId: string;
    inspectingOfficerName: string;
    inspectionDate: string;
    issuedAt: string;
    signingKeyVersion: string;
    sealNumber?: string | null | undefined;
}>;
export type CanonicalCertificatePayload = z.infer<typeof canonicalCertificatePayloadSchema>;
//# sourceMappingURL=certificate.schema.d.ts.map