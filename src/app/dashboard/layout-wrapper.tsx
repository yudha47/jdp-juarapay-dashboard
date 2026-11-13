"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

type LayoutWrapperProps = {
    children: React.ReactNode;
};

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-zinc-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-1 flex-col">
                <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} isSidebarOpen={sidebarOpen} />
                <main className="flex-1 overflow-y-auto p-2">{children}</main>
            </div>
        </div>
    );
}
