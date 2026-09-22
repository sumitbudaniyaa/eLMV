"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalCertificatePayloadSchema = exports.issueCertificateSchema = void 0;
const zod_1 = require("zod");
exports.issueCertificateSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid("Invalid application ID"),
    validUntil: zod_1.z.string().datetime("Valid ISO datetime required").optional(),
});
exports.canonicalCertificatePayloadSchema = zod_1.z.object({
    certificateNumber: zod_1.z.string(),
    applicationId: zod_1.z.string(),
    instrumentSerialNumber: zod_1.z.string(),
    instrumentType: zod_1.z.string(),
    make: zod_1.z.string(),
    model: zod_1.z.string(),
    capacity: zod_1.z.number(),
    unit: zod_1.z.string(),
    accuracyClass: zod_1.z.string(),
    applicantName: zod_1.z.string(),
    applicantBusiness: zod_1.z.string(),
    inspectingOfficerId: zod_1.z.string(),
    inspectingOfficerName: zod_1.z.string(),
    inspectionDate: zod_1.z.string(),
    issuedAt: zod_1.z.string(),
    validUntil: zod_1.z.string(),
    maxPermissibleError: zod_1.z.number(),
    actualErrorObserved: zod_1.z.number(),
    sealNumber: zod_1.z.string().nullable().optional(),
    signingKeyVersion: zod_1.z.string(),
});
//# sourceMappingURL=certificate.schema.js.map