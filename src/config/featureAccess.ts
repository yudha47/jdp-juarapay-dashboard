import { ROLES, type Role } from "@/constants/roles";

export type FeatureAccess = {
    feature: string;
    roles: Role[];
};

export const featureAccessMap: FeatureAccess[] = [
    {
        feature: "PIE_CHART",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        feature: "TOP_MERCHANTS",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER],
    },
    {
        feature: "TOTAL_TRANSACTION",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        feature: "PAYMENT_METHOD",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        feature: "AMOUNT_TRANSACTION",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        feature: "MARGIN",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER],
    },
    {
        feature: "PAYMENT_STATUS",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER],
    },
];
