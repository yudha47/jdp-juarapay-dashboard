"use client";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
    LayoutDashboard,
    Users,
    Store,
    CreditCard,
    Settings as SettingsIcon,
    Wallet,
    Logs,
    ShieldCheck,
    Banknote,
    Plug,
    Percent,
    GitBranch,
    Map,
    Settings2Icon,
    X,
    ChevronDown,
    DollarSign,
} from "lucide-react";

const ICON_BY_PATH: Array<{ match: (path: string) => boolean; icon: LucideIcon }> = [
    { match: (p) => p.startsWith("/dashboard/summary") || p === "/dashboard", icon: LayoutDashboard },
    { match: (p) => p.startsWith("/dashboard/account-management"), icon: Users },
    { match: (p) => p.startsWith("/dashboard/mdr-management"), icon: Wallet },
    { match: (p) => p.startsWith("/dashboard/merchant-management"), icon: Store },
    { match: (p) => p.startsWith("/dashboard/transactions"), icon: CreditCard },
    { match: (p) => p.startsWith("/dashboard/request-settlement"), icon: Wallet },
    { match: (p) => p.startsWith("/dashboard/log-internal-activity"), icon: Logs },
    { match: (p) => p.startsWith("/dashboard/log-external-activity"), icon: Logs },

    // Settings group + children
    { match: (p) => p === "/dashboard/settings", icon: SettingsIcon },
    { match: (p) => p.startsWith("/dashboard/settings/category-management"), icon: SettingsIcon },
    { match: (p) => p.startsWith("/dashboard/settings/role-management"), icon: ShieldCheck },
    { match: (p) => p.startsWith("/dashboard/settings/mapping-role"), icon: GitBranch },
    { match: (p) => p.startsWith("/dashboard/settings/menu-service"), icon: Settings2Icon },
    { match: (p) => p.startsWith("/dashboard/settings/payment-method"), icon: Banknote },
    { match: (p) => p.startsWith("/dashboard/settings/payment-gateway"), icon: Plug },
    { match: (p) => p.startsWith("/dashboard/settings/ppn"), icon: Percent },
    { match: (p) => p.startsWith("/dashboard/settings/region"), icon: Map },
    { match: (p) => p.startsWith("/dashboard/settings/price-management"), icon: DollarSign },
    { match: (p) => p.startsWith("/dashboard/settings/service-management"), icon: SettingsIcon },
];

function getIconForPath(path: string): LucideIcon | null {
    const found = ICON_BY_PATH.find((x) => x.match(path));
    return found?.icon ?? null;
}

const ORDER_PREFIXES: string[] = [
    "/dashboard/summary",
    "/dashboard/account-management",
    "/dashboard/mdr-management",
    "/dashboard/merchant-management",
    "/dashboard/transactions",
    "/dashboard/request-settlement",
    "/dashboard/log-internal-activity",
    "/dashboard/log-external-activity",
    "/dashboard/settings",
];

function getOrderIndex(path: string) {
    const i = ORDER_PREFIXES.findIndex((prefix) => path === prefix || path.startsWith(prefix + "/"));
    return i === -1 ? 999 : i;
}

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccessControl } from "@/hooks/useAccessControl";
import { buildMenuTree } from "@/utils/roleMapping";

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { menus } = useAccessControl();

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // const menuTree = useMemo(() => buildMenuTree(menus), [menus]);
    const menuTree = useMemo(() => {
        const tree = buildMenuTree(menus);

        const sorted = [...tree].sort((a, b) => getOrderIndex(a.pathMenu) - getOrderIndex(b.pathMenu));

        // sort children settings juga (kalau ada)
        return sorted.map((m) => ({
            ...m,
            children: m.children
                ? [...m.children].sort((a, b) => getOrderIndex(a.pathMenu) - getOrderIndex(b.pathMenu))
                : undefined,
        }));
    }, [menus]);

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === path;
        return pathname.startsWith(path);
    };

    const handleNavigate = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

            <aside
                className={`
          fixed left-0 top-0 z-50 flex h-screen w-65 flex-col
          bg-white border-r border-zinc-100
          shadow-[4px_0_24px_rgba(0,0,0,0.06)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
                    <Link href="/dashboard" className="flex items-center group" onClick={handleNavigate}>
                        {/* Logo full (sudah termasuk teks) */}
                        <div className="relative h-12 w-36">
                            <Image src="/assets/images/logo-juara-pay.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </Link>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-none">
                    {menuTree.map((m) => {
                        const hasChildren = !!m.children?.length;
                        const active = isActive(m.pathMenu);
                        const dropdownOpen = openDropdown === m.pathMenu;
                        const Icon = getIconForPath(m.pathMenu);

                        const IconBox = (
                            <span
                                className={`
                  flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150
                  ${active ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700"}
                `}
                            >
                                {Icon ? (
                                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                                ) : (
                                    <span className="text-[10px]">•</span>
                                )}
                            </span>
                        );

                        return (
                            <div key={m.mappingUid}>
                                {hasChildren ? (
                                    <button
                                        onClick={() => setOpenDropdown(dropdownOpen ? null : m.pathMenu)}
                                        className={`
                      group flex w-full items-center justify-between rounded-xl px-3 py-2.5
                      text-[13.5px] font-medium transition-all duration-150
                      ${active ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {IconBox}
                                            <span>{m.serviceDesc}</span>
                                        </div>

                                        <ChevronDown
                                            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                                                dropdownOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                ) : (
                                    <Link
                                        href={m.pathMenu}
                                        onClick={handleNavigate}
                                        className={`
                      group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                      text-[13.5px] font-medium transition-all duration-150
                      ${active ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}
                    `}
                                    >
                                        {IconBox}
                                        <span>{m.serviceDesc}</span>
                                        {active && <span className="ml-auto h-4 w-1 rounded-full bg-indigo-500" />}
                                    </Link>
                                )}

                                {/* Submenu */}
                                {hasChildren && (
                                    <div
                                        className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${dropdownOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                    `}
                                    >
                                        <div className="ml-5.5 mt-0.5 mb-0.5 border-l border-zinc-200 pl-4 space-y-0.5 py-1">
                                            {m.children!.map((sub) => {
                                                const subActive = isActive(sub.pathMenu);
                                                const SubIcon = getIconForPath(sub.pathMenu);

                                                return (
                                                    <Link
                                                        key={sub.mappingUid}
                                                        href={sub.pathMenu}
                                                        onClick={handleNavigate}
                                                        className={`
                              flex items-center gap-2.5 rounded-lg px-2.5 py-2
                              text-[12.5px] font-medium transition-all duration-150
                              ${subActive ? "bg-indigo-50 text-indigo-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"}
                            `}
                                                    >
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100">
                                                            {SubIcon ? (
                                                                <SubIcon
                                                                    className="h-3.5 w-3.5 text-zinc-500"
                                                                    strokeWidth={2}
                                                                />
                                                            ) : (
                                                                <span className="text-[10px]">•</span>
                                                            )}
                                                        </span>
                                                        {sub.serviceDesc}
                                                        {subActive && (
                                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                {/* <div className="px-3 pb-4 pt-2 border-t border-zinc-100">
            <div className="flex items-start gap-3 rounded-xl bg-linear-to-br from-indigo-50 via-indigo-50 to-purple-50 border border-indigo-100/70 p-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-zinc-800 leading-none">Need Help?</p>
                    <p className="mt-1 text-[11.5px] text-zinc-500 leading-snug">
                        Browse our documentation & guides
                    </p>
                    <button className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Learn more
                        <span className="text-[10px]">→</span>
                    </button>
                </div>
            </div>
        </div> */}
            </aside>

            {isOpen && <div className="hidden lg:block lg:w-65 shrink-0" />}
        </>
    );
}
