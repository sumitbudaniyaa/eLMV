"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInspectionSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.createInspectionSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid("Invalid application ID"),
    result: zod_1.z.nativeEnum(enums_1.InspectionResult),
    observations: zod_1.z.record(zod_1.z.any()), // Structured tests: repeatability, eccentricity, linearity, zero error
    standardsUsed: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1, "At least one standard weight/measure must be documented"),
    maxPermissibleError: zod_1.z.number().positive("MPE must be a positive number"),
    actualErrorObserved: zod_1.z.number().nonnegative("Actual error must be non-negative"),
    photoUrls: zod_1.z.array(zod_1.z.string()).default([]),
    sealNumber: zod_1.z.string().trim().optional(),
    remarks: zod_1.z.string().trim().optional(),
});
//# sourceMappingURL=inspection.schema.js.map