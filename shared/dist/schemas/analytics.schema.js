"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsDateFilterSchema = void 0;
const zod_1 = require("zod");
exports.analyticsDateFilterSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    district: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
});
//# sourceMappingURL=analytics.schema.js.map