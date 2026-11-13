"use client";

import { useLogin } from "@/hooks/useLogin";
import { hydrateLoggedInRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { THEME } from "./components/loginTheme";
import { LoginBackground } from "./components/LoginBackground";
import { LoginLeftPanel } from "./components/LoginLeftPanel";
import { LoginForm } from "./components/LoginForm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectDevice(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return "Mobile";
    if (/tablet/i.test(ua)) return "Tablet";
    return "Browser";
}

function detectOS(): string {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua)) return "Windows";
    if (/macintosh|mac os x/i.test(ua)) return "MacOS";
    if (/linux/i.test(ua)) return "Linux";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    return "Unknown";
}

async function fetchIP(): Promise<string> {
    try {
        const res = await fetch("/api/client-info");
        const data = await res.json();
        return data.ip ?? "0.0.0.0";
    } catch {
        return "0.0.0.0";
    }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();
    const { login, loading, error } = useLogin();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLogin = async (email: string, password: string) => {
        const ip = await fetchIP();

        const result = await login({
            email,
            password,
            device: detectDevice(),
            osdevice: detectOS(),
            ip,
        });

        if (result) {
            await hydrateLoggedInRole();
            router.replace("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden relative" style={{ background: THEME.bg }}>
            <LoginBackground />
            <LoginLeftPanel mounted={mounted} />
            <LoginForm mounted={mounted} loading={loading} error={error} onSubmit={handleLogin} />
        </div>
    );
}