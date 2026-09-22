"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectApplicationSchema = exports.scheduleApplicationSchema = exports.assignOfficerSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.createApplicationSchema = zod_1.z.object({
    instrumentId: zod_1.z.string().uuid("Invalid instrument ID"),
    type: zod_1.z.nativeEnum(enums_1.ApplicationType).default(enums_1.ApplicationType.NEW),
    remarks: zod_1.z.string().trim().optional(),
});
exports.assignOfficerSchema = zod_1.z.object({
    officerId: zod_1.z.string().uuid("Invalid officer ID"),
});
exports.scheduleApplicationSchema = zod_1.z.object({
    scheduledDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Valid scheduled datetime required",
    }),
    remarks: zod_1.z.string().trim().optional(),
});
exports.rejectApplicationSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().trim().min(5, "A descriptive rejection reason is required"),
});
//# sourceMappingURL=application.schema.js.map