/* eslint-disable @next/next/no-img-element */
import { THEME } from "./loginTheme";

const bars = [45, 72, 55, 88, 65, 94, 78];
const txs = [
    { label: "GoPay", amount: "+Rp 250K" },
    { label: "OVO", amount: "+Rp 180K" },
    { label: "DANA", amount: "+Rp 420K" },
];

interface Props {
    mounted: boolean;
}

export function LoginLeftPanel({ mounted }: Props) {
    return (
        <div className="hidden lg:flex w-[62%] relative flex-col items-center justify-center px-16 py-14 overflow-hidden">
            {/* Flowing dashed connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 900">
                <path d="M80 230 Q320 140 530 290" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="6 4" className="animate-[dashFlow_4s_linear_infinite]" />
                <path d="M120 640 Q400 530 620 680" fill="none" stroke="rgba(255,77,141,0.30)" strokeWidth="1.5" strokeDasharray="6 4" className="animate-[dashFlow_5s_linear_infinite_reverse]" />
                <path d="M660 140 Q580 400 680 640" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="8 5" className="animate-[dashFlow_6s_linear_infinite]" />
                {([[80, 230], [530, 290], [120, 640], [620, 680]] as [number, number][]).map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(255,255,255,0.4)" />
                ))}
            </svg>

            {/* Content */}
            <div className={`relative z-10 flex flex-col items-center ${mounted ? "animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" : "opacity-0"}`}>
                {/* Logo */}
                <div className="mb-12">
                    <img src="/assets/images/logo-juara-pay.png" alt="Juara Pay" className="h-14 w-auto object-contain brightness-0 invert" />
                </div>

                {/* Floating card cluster */}
                <div className="relative w-125 h-105">
                    {/* Main analytics card */}
                    <div className="absolute top-5 left-4 w-85 rounded-[22px] p-7 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.3)] animate-[floatCard_5s_ease-in-out_infinite]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[12px] text-white/55 mb-1.5 uppercase tracking-wider">Total Volume</p>
                                <p className="text-[28px] font-bold text-white tracking-tight">Rp 2.4M</p>
                            </div>
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: THEME.accentBg, border: `1px solid ${THEME.accentBorder}` }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={THEME.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        {/* Mini bar chart */}
                        <div className="flex items-end gap-1.5 h-14 mb-5">
                            {bars.map((h, i) => (
                                <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, background: i === 5 ? THEME.accentBar : "rgba(255,255,255,0.22)" }} />
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] text-white/40">Last 7 days</span>
                            <span className="text-[12px] font-semibold" style={{ color: "#4ADE80" }}>↑ 18.2%</span>
                        </div>
                    </div>

                    {/* Live transactions card */}
                    <div className="absolute bottom-0 right-0 w-72.5 rounded-[22px] p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.3)] animate-[floatCard2_6.5s_ease-in-out_infinite]">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[blinkDot_1.5s_ease-in-out_infinite]" />
                            <span className="text-[13px] text-white/65 font-medium">Live Transactions</span>
                        </div>
                        {txs.map((tx, i) => (
                            <div key={i} className={`flex justify-between items-center py-2.25 ${i < 2 ? "border-b border-white/10" : ""}`}>
                                <span className="text-[13px] text-white/55">{tx.label}</span>
                                <span className="text-[13px] font-semibold" style={{ color: "#4ADE80" }}>{tx.amount}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pulse dot */}
                    <div className="absolute top-8 left-72 w-4 h-4 rounded-full animate-[pulseRing_2s_ease-out_infinite]" style={{ background: THEME.accent }} />
                </div>

                {/* Stat pills */}
                <div className="flex gap-4 mt-14">
                    {[{ val: "99.9%", label: "Uptime" }, { val: "20+", label: "Payment Methods" }, { val: "<1s", label: "Avg. Response" }].map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                            <span className="text-[15px] font-bold text-white">{s.val}</span>
                            <span className="text-[12px] text-white/50">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Tagline */}
                <div className="text-center mt-10">
                    <h2 className="text-[30px] font-extrabold text-white leading-snug tracking-tight">
                        One Dashboard,{" "}
                        <span style={{ color: "#FF4D8D" }}>All Your Payments</span>
                    </h2>
                    <p className="text-[15px] text-white/45 mt-3">Accept, manage, and grow - seamlessly</p>
                </div>
            </div>
        </div>
    );
}