export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    error?: {
        code: string;
        message: string;
        details?: Array<{
            field?: string;
            message: string;
        }>;
    };
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface UserSummary {
    id: string;
    email: string;
    phone: string;
    name: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
}
//# sourceMappingURL=api.d.ts.map