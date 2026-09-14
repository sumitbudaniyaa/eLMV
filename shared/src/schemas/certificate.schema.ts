import { z } from "zod";

export const issueCertificateSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  validUntil: z.string().datetime("Valid ISO datetime required").optional(),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;

export const canonicalCertificatePayloadSchema = z.object({
  certificateNumber: z.string(),
  applicationId: z.string(),
  instrumentSerialNumber: z.string(),
  instrumentType: z.string(),
  make: z.string(),
  model: z.string(),
  capacity: z.number(),
  unit: z.string(),
  accuracyClass: z.string(),
  applicantName: z.string(),
  applicantBusiness: z.string(),
  inspectingOfficerId: z.string(),
  inspectingOfficerName: z.string(),
  inspectionDate: z.string(),
  issuedAt: z.string(),
  validUntil: z.string(),
  maxPermissibleError: z.number(),
  actualErrorObserved: z.number(),
  sealNumber: z.string().nullable().optional(),
  signingKeyVersion: z.string(),
});

export type CanonicalCertificatePayload = z.infer<typeof canonicalCertificatePayloadSchema>;

