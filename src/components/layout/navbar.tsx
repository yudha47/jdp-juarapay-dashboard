"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, Menu, User } from "lucide-react";
import { clearAuthSession, getLoggedInUser } from "@/lib/auth";

type NavbarProps = {
    onMenuClick?: () => void;
    isSidebarOpen?: boolean;
};

export function Navbar({ onMenuClick, isSidebarOpen = false }: NavbarProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const userLoggedIn = useMemo(() => {
        if (typeof window === "undefined") return null;
        return getLoggedInUser();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });

        clearAuthSession();
        router.replace("/login");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left - Menu Button */}
                {isSidebarOpen ? (
                    <div className="w-10" />
                ) : (
                    <button
                        onClick={onMenuClick}
                        className="flex items-center justify-center rounded-lg p-2 text-zinc-700 hover:bg-zinc-100"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}

                {/* Spacer for desktop */}
                <div className="hidden lg:block" />

                {/* Right - User Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                        <div suppressHydrationWarning className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                            {userLoggedIn?.fullName?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="hidden sm:block text-start">
                            <p suppressHydrationWarning className="text-sm font-medium leading-tight text-zinc-700">
                                {userLoggedIn?.fullName || "User"}
                            </p>
                            <p suppressHydrationWarning className="text-xs leading-tight text-zinc-500">
                                {userLoggedIn?.email || "-"}
                            </p>
                        </div>

                        <ChevronDown
                            className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {open && (
                        <div className="absolute right-0 w-56 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                            {/* <div className="border-b border-zinc-100 px-3 py-3 text-start">
                                <p suppressHydrationWarning className="text-sm font-semibold text-zinc-900">{userLoggedIn?.fullName || "-"}</p>
                                <p suppressHydrationWarning className="text-xs text-zinc-500">{userLoggedIn?.email || "-"}</p>
                            </div> */}

                            <div>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/dashboard/account-settings");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
                                >
                                    <User className="h-4 w-4 text-zinc-500" />
                                    My Account Settings
                                </button>
                            </div>

                            <div className="border-t border-zinc-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
