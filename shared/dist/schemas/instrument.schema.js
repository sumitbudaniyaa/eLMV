"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstrumentSchema = exports.createInstrumentSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
exports.createInstrumentSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enums_1.InstrumentType),
    category: zod_1.z.string().trim().min(2, "Category is required"),
    make: zod_1.z.string().trim().min(2, "Make is required"),
    model: zod_1.z.string().trim().min(1, "Model is required"),
    serialNumber: zod_1.z.string().trim().min(2, "Serial number is required"),
    capacity: zod_1.z.number().positive("Capacity must be greater than zero"),
    unit: zod_1.z.string().trim().min(1, "Unit of measurement is required"),
    accuracyClass: zod_1.z.string().trim().min(1, "Accuracy class is required"),
    verificationInterval: zod_1.z.number().int().min(1).default(12),
    installationAddress: zod_1.z.string().trim().min(5, "Installation address is required"),
    district: zod_1.z.string().trim().min(2, "District is required"),
    state: zod_1.z.string().trim().min(2, "State is required"),
    pincode: zod_1.z.string().trim().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit PIN code"),
});
exports.updateInstrumentSchema = exports.createInstrumentSchema.partial();
//# sourceMappingURL=instrument.schema.js.map