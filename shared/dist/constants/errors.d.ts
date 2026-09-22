export declare const ErrorCode: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly SIGNATURE_VERIFICATION_FAILED: "SIGNATURE_VERIFICATION_FAILED";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
    readonly INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
//# sourceMappingURL=errors.d.ts.map