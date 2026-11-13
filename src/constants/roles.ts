// src/constants/roles.ts
export const ROLES = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "admin",
    HEADQUARTER: "headquarter",
    MERCHANT: "Merchant",
    DEV: "DEV",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
