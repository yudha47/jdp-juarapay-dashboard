/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface Props {
    mounted: boolean;
    loading: boolean;
    error: string | null;
    onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ mounted, loading, error, onSubmit }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password);
    };

    const envLabel =
        process.env.NEXT_PUBLIC_SIMULATOR === "sandbox" ? "Sandbox Environment"
            : process.env.NEXT_PUBLIC_SIMULATOR === "normal" ? "Production Environment"
                : "Dev Environment";

    return (
        <div className="flex w-full lg:w-[38%] items-center justify-center px-6 py-12 relative">
            {/* Vertical separator */}
            <div className="hidden lg:block absolute left-0 top-12 bottom-12 w-px bg-white/10" />

            <div className={`relative z-10 w-full max-w-100 ${mounted ? "animate-[slideUp_0.6s_0.15s_cubic-bezier(0.16,1,0.3,1)_both]" : "opacity-0"}`}>
                <div className="rounded-2xl bg-white border border-pink-100 shadow-[0_32px_80px_rgba(91,46,255,0.22)] p-8">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden justify-center mb-8">
                        <img src="/assets/images/logo-juara-pay.png" alt="Juara Pay" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight" style={{ color: "#0F0F0F" }}>
                            {envLabel}
                        </h1>
                        <p className="text-sm mt-2" style={{ color: "#9B77B8" }}>Sign in to your dashboard</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                                <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
                                <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <div>
                                <p className="text-[13px] font-semibold text-red-600 mb-0.5">Login Gagal</p>
                                <p className="text-[13px] text-red-500">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[13px] font-medium mb-2" style={{ color: "#5C4A58" }}>Email Address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: emailFocused ? "#E84393" : "#C4A8C0" }}>
                                        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.8" />
                                        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    disabled={loading}
                                    required
                                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-[15px] border text-slate-900 placeholder:text-pink-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    style={{
                                        background: "#FFF5FA",
                                        borderColor: emailFocused ? "#E84393" : "#F0D4E8",
                                        boxShadow: emailFocused ? "0 0 0 3px rgba(232,67,147,0.10)" : "none",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[13px] font-medium mb-2" style={{ color: "#5C4A58" }}>Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: passFocused ? "#E84393" : "#C4A8C0" }}>
                                        <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                                        <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPassFocused(true)}
                                    onBlur={() => setPassFocused(false)}
                                    disabled={loading}
                                    required
                                    className="w-full rounded-xl py-3.5 pl-11 pr-12 text-[15px] border text-slate-900 placeholder:text-pink-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    style={{
                                        background: "#FFF5FA",
                                        borderColor: passFocused ? "#E84393" : "#F0D4E8",
                                        boxShadow: passFocused ? "0 0 0 3px rgba(232,67,147,0.10)" : "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute inset-y-0 right-4 flex items-center disabled:cursor-not-allowed transition-colors duration-200"
                                    style={{ color: "#C4A8C0" }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E84393")}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#C4A8C0")}
                                >
                                    {showPassword ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                id="remember"
                                disabled={loading}
                                className="w-4.5 h-4.5 rounded-[5px] cursor-pointer shrink-0 border appearance-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                style={{ borderColor: "#F0D4E8", background: "white" }}
                            />
                            <label htmlFor="remember" className="text-[13px] cursor-pointer select-none" style={{ color: "#9B77B8" }}>
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full mt-2 overflow-hidden rounded-xl py-3.5 text-white text-[15px] font-semibold tracking-wide hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                            style={{ background: "linear-gradient(90deg, #E84393 0%, #5B2EFF 100%)", boxShadow: "0 4px 20px rgba(232,67,147,0.35)" }}
                        >
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-in-out pointer-events-none" />
                            {loading ? (
                                <span className="relative flex items-center justify-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="relative flex items-center justify-center gap-2">
                                    Login
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform duration-200 group-hover:translate-x-1">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5" style={{ borderTop: "1px solid #F0D4E8" }}>
                        <div className="flex items-center justify-center gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#C4A8C0" strokeWidth="1.8" />
                            </svg>
                            <span className="text-[12px]" style={{ color: "#C4A8C0" }}>Secured with SSL encryption</span>
                        </div>
                        <p className="text-center text-[11px] mt-3" style={{ color: "#D4B8D0" }}>
                            © 2026 Juara Pay · Payment Aggregator Platform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}