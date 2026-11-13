export function BreadcrumbDrawerDetail({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-background shadow-2xl flex flex-col h-full overflow-y-auto">
                <div className="bg-primary px-6 py-5 flex items-start justify-between shrink-0 animate-pulse">
                    <div>
                        <div className="h-4 w-32 bg-gray-400 rounded mb-1" />
                        <div className="h-3 w-20 bg-gray-300 rounded" />
                    </div>
                    <div className="h-5 w-5 bg-gray-400 rounded" />
                </div>
                <div className="p-6 space-y-6 flex-1">
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="bg-background px-4 py-2 border-b border-border">
                            <div className="h-3 w-24 bg-gray-300 rounded" />
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-3">
                                    <div className="h-3 w-20 bg-gray-300 rounded" />
                                    <div className="h-3 w-28 bg-gray-300 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="h-3 w-32 bg-gray-300 rounded mb-2" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-6 w-20 bg-gray-300 rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 flex gap-3">
                            
                        <div className="h-4 w-4 bg-gray-400 mt-0.5 shrink-0 rounded-full" />
                        <div className="h-3 w-full bg-gray-400 rounded" />
                    </div>
                    <div>
                        <div className="h-3 w-32 bg-gray-300 rounded mb-3" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 rounded-full bg-gray-300 mt-1 shrink-0" />
                                        {i < 3 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                                    </div>
                                    <div className="pb-3">
                                        <div className="h-3 w-24 bg-gray-300 rounded mb-1" />
                                        <div className="h-2 w-32 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Shimmer({ className }: { className?: string }) {
    return (
        <div
            className={`rounded ${className ?? ""}`}
            style={{
                background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
                backgroundSize: "800px 100%",
                animation: "shimmer 1.4s infinite linear",
            }}
        />
    );
}

function SkeletonSection({ rows }: { rows: Array<"half" | "full" | "pair"> }) {
    return (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 space-y-4">
            {/* Section title bar */}
            <Shimmer className="h-2.5 w-20" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {rows.map((type, i) => {
                    if (type === "full") {
                        return (
                            <div key={i} className="col-span-2 space-y-1.5">
                                <Shimmer className="h-2 w-14" />
                                <Shimmer className="h-3.5 w-full" />
                            </div>
                        );
                    }
                    if (type === "pair") {
                        return (
                            <div key={i} className="col-span-2 grid grid-cols-2 gap-x-6">
                                <div className="space-y-1.5">
                                    <Shimmer className="h-2 w-14" />
                                    <Shimmer className="h-3.5 w-28" />
                                </div>
                                <div className="space-y-1.5">
                                    <Shimmer className="h-2 w-14" />
                                    <Shimmer className="h-3.5 w-24" />
                                </div>
                            </div>
                        );
                    }
                    // "half" — single field
                    return (
                        <div key={i} className="space-y-1.5">
                            <Shimmer className="h-2 w-12" />
                            <Shimmer className="h-3.5 w-28" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function DetailTransactionDrawerSkeleton({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .drawer-root { font-family: 'DM Sans', sans-serif; }
                .drawer-in  { animation: slideIn 0.28s cubic-bezier(0.32,0.72,0,1) both; }
                .overlay-in { animation: fadeIn 0.2s ease both; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
            `}</style>

            {/* Overlay */}
            <div
                className="overlay-in absolute inset-0 bg-black/25 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="drawer-in drawer-root relative w-full max-w-110 bg-slate-50 shadow-2xl flex flex-col h-full">

                {/* ── Header ── */}
                <div className="bg-white border-b border-slate-100 px-5 pt-5 pb-0 shrink-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                            <Shimmer className="h-2.5 w-28" />  {/* "Transaction Detail" label */}
                            <Shimmer className="h-4 w-44" />    {/* transaction number */}
                        </div>
                        <div className="flex items-center gap-2">
                            <Shimmer className="h-5 w-16 rounded-full" /> {/* status badge */}
                            <button
                                onClick={onClose}
                                className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Amount hero */}
                    <div className="mb-5 flex items-end justify-between">
                        <div className="space-y-2">
                            <Shimmer className="h-2.5 w-20" />  {/* "Total Amount" label */}
                            <Shimmer className="h-8 w-48" />    {/* big number */}
                        </div>
                        <div className="mb-1 space-y-2 flex flex-col items-end">
                            <Shimmer className="h-3 w-32" />    {/* nettProfit */}
                            <Shimmer className="h-3 w-32" />    {/* balance */}
                        </div>
                    </div>

                    {/* Tabs — static placeholder, tidak shimmer */}
                    <div className="flex gap-0 mt-1">
                        {["Overview", "Fee", "Price", "System"].map((label, i) => (
                            <div
                                key={label}
                                className={`px-4 py-2.5 border-b-2 ${
                                    i === 0
                                        ? "border-slate-900"
                                        : "border-transparent"
                                }`}
                            >
                                <span className={`text-xs font-semibold ${i === 0 ? "text-slate-900" : "text-slate-300"}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {/* Payment Info */}
                    <SkeletonSection rows={["pair", "pair", "full", "full", "full", "full", "half", "half"]} />
                    {/* Merchant Info */}
                    <SkeletonSection rows={["pair", "pair", "pair"]} />
                    {/* Card & Identifiers */}
                    <SkeletonSection rows={["full", "full", "full"]} />
                </div>

                {/* ── Footer ── */}
                <div className="shrink-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between">
                    <div className="space-y-2">
                        <Shimmer className="h-2.5 w-20" />
                        <Shimmer className="h-3.5 w-36" />
                    </div>
                    <button
                        disabled
                        className="px-5 py-2 rounded-lg bg-slate-100 text-slate-300 text-sm font-semibold cursor-not-allowed select-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}