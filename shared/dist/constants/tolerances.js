"use strict";
// Tolerances under Legal Metrology (General) Rules, 2011 for Verification
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.STANDARD_MEASURING_UNITS = exports.ACCURACY_CLASS_VERIFICATION_INTERVALS = void 0;
exports.ACCURACY_CLASS_VERIFICATION_INTERVALS = {
    "Class I": 12, // Special Accuracy (analytical balances) - 12 months
    "Class II": 12, // High Accuracy - 12 months
    "Class III": 12, // Medium Accuracy (commercial scales) - 12 months
    "Class IIII": 12, // Ordinary Accuracy - 12 months
};
exports.STANDARD_MEASURING_UNITS = [
    "mg",
    "g",
    "kg",
    "tonne",
    "mL",
    "L",
    "kL",
    "mm",
    "cm",
    "m",
];
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
//# sourceMappingURL=tolerances.js.map