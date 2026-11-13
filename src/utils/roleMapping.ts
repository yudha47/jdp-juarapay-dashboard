import { ROLES, type Role } from "@/constants/roles";
import { RoleMenu } from "@/data/models/RoleModel";

export function toRole(roleDesc?: string | null): Role | null {
    if (!roleDesc) return null;

    // Pastikan roleDesc persis salah satu value ROLES
    const values = Object.values(ROLES) as Role[];
    return values.includes(roleDesc as Role) ? (roleDesc as Role) : null;
}

export type UiMenu = RoleMenu & { children?: RoleMenu[] };

export function buildMenuTree(menus: RoleMenu[]): UiMenu[] {
    const allowed = menus
        .filter((m) => m.status === "Y" && m.permission === "Y")
        .filter((m) => !m.pathMenu.startsWith("/dashboard/account-settings"))
        .map((m) => ({ ...m, pathMenu: m.pathMenu.replace(/\/+$/, "") }));

    const isSandboxMode = process.env.NEXT_PUBLIC_SIMULATOR === "sandbox";

    // SETTINGS
    const settingsChildren = allowed
        .filter((m) => m.pathMenu.startsWith("/dashboard/settings/"))
        .sort((a, b) => {
            const isPaymentGatewayA = a.pathMenu === "/dashboard/settings/payment-gateway";
            const isPaymentGatewayB = b.pathMenu === "/dashboard/settings/payment-gateway";

            const isMappingA = a.pathMenu === "/dashboard/settings/mapping-role-management";
            const isMappingB = b.pathMenu === "/dashboard/settings/mapping-role-management";

            if (isPaymentGatewayA) return -1;
            if (isPaymentGatewayB) return 1;

            if (isMappingA) return 1;
            if (isMappingB) return -1;

            return a.serviceDesc.localeCompare(b.serviceDesc);
        });

    const settingsParentFromApi = allowed.find((m) => m.pathMenu === "/dashboard/settings");

    const settingsParent: UiMenu | null =
        settingsChildren.length > 0
            ? ({
                  ...(settingsParentFromApi ?? {
                      mappingUid: "virtual-settings",
                      serviceDesc: "Settings",
                      pathMenu: "/dashboard/settings",
                      iconMenu: null,
                      status: "Y",
                      permission: "Y",
                  }),
                  children: settingsChildren,
              } as UiMenu)
            : null;

    // TRANSACTIONS
    const transactionChildren = allowed
        .filter((m) => m.pathMenu.startsWith("/dashboard/transactions/"))
        .sort((a, b) => a.serviceDesc.localeCompare(b.serviceDesc));

    const transactionParentFromApi = allowed.find((m) => m.pathMenu === "/dashboard/transactions");

    const transactionParent: UiMenu | null =
        transactionChildren.length > 0
            ? ({
                  ...(transactionParentFromApi ?? {
                      mappingUid: "virtual-transactions",
                      serviceDesc: "Transactions",
                      pathMenu: "/dashboard/transactions",
                      iconMenu: null,
                      status: "Y",
                      permission: "Y",
                  }),
                  children: transactionChildren,
              } as UiMenu)
            : null;

    // OTHERS
    const others = allowed
        .filter(
            (m) =>
                m.pathMenu !== "/dashboard/settings" &&
                !m.pathMenu.startsWith("/dashboard/settings/") &&
                m.pathMenu !== "/dashboard/transactions" &&
                !m.pathMenu.startsWith("/dashboard/transactions/"),
        )
        .sort((a, b) => a.serviceDesc.localeCompare(b.serviceDesc));

    if (isSandboxMode) {
        others.push({
            mappingUid: "virtual-sandbox",
            serviceDesc: "Sandbox Simulator",
            pathMenu: "/dashboard/sandbox/simulator",
            iconMenu: null,
            status: "Y",
            permission: "Y",
        } as UiMenu);
    }

    return [...others, ...(transactionParent ? [transactionParent] : []), ...(settingsParent ? [settingsParent] : [])];
}
