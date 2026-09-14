// Tolerances under Legal Metrology (General) Rules, 2011 for Verification

export const ACCURACY_CLASS_VERIFICATION_INTERVALS: Record<string, number> = {
  "Class I": 12,    // Special Accuracy (analytical balances) - 12 months
  "Class II": 12,   // High Accuracy - 12 months
  "Class III": 12,  // Medium Accuracy (commercial scales) - 12 months
  "Class IIII": 12, // Ordinary Accuracy - 12 months
};

export const STANDARD_MEASURING_UNITS = [
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
] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

