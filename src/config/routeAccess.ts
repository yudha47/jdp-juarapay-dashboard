import { ROLES, type Role } from "@/constants/roles";

export type RouteAccess = {
    path: string;
    roles: Role[];
    description?: string;
};

export const routeAccessMap: RouteAccess[] = [
    {
        path: "/dashboard",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        path: "/dashboard/profile",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        path: "/dashboard/summary",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        path: "/dashboard/merchants",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HEADQUARTER],
    },
    {
        path: "/dashboard/transactions",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
    },
    {
        path: "/dashboard/settings",
        roles: [ROLES.SUPER_ADMIN],
    },
    {
        path: "/dashboard/account-management",
        roles: [ROLES.SUPER_ADMIN],
        description: "Manage headquarter accounts, access restricted to Super Admin only",
    },
    {
        path: "/dashboard/mdr-management",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER],
        description: "Manage MDRs, access restricted to Super Admin and Headquarter(read only)",
    },
    {
        path: "/dashboard/transactions",
        roles: [ROLES.SUPER_ADMIN, ROLES.HEADQUARTER, ROLES.MERCHANT],
        description:
            "Manage transactions, access restricted to Super Admin, Headquarter, and Merchant(only their own transactions)",
    },
    {
        path: "/dashboard/log-internal-activity",
        roles: [ROLES.SUPER_ADMIN],
        description: "Log internal activity, access restricted to Super Admin",
    },
    {
        path: "/dashboard/log-external-activity",
        roles: [ROLES.SUPER_ADMIN],
        description: "Log external activity, access restricted to Super Admin",
    },
];
