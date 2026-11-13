import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { PaymentMethodByMerchantModel } from "@/data/models/PaymentMethodModel";
import { useMemo, useState } from "react";

export function MerchantInfoCard({
    merchantData,
    paymentMethods,
    apiKey,
    apiKeyLoading,
    apiKeyError,
    onRefreshApiKey,
    onCopyApiKey,
}: {
    merchantData: MerchantDetailedModel;
    paymentMethods: PaymentMethodByMerchantModel[];
    apiKey: string;
    apiKeyLoading?: boolean;
    apiKeyError?: string | null;
    onRefreshApiKey: () => void;
    onCopyApiKey: () => void;
}) {
    const [showBankModal, setShowBankModal] = useState(false);

    const activePaymentMethods = useMemo(() => {
        const seen = new Set<string>();
        return (paymentMethods ?? [])
            .filter((pm) => pm.isActive === "Y")
            .filter((pm) => !pm.bank.toLowerCase().includes("test"))
            .filter((pm) => {
                const key = pm.bank.trim().toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }, [paymentMethods]);

    if (!merchantData) return null;

    const regions = merchantData.region ?? [];
    const totalClusters = regions.reduce((acc, r) => acc + (r.cluster?.length ?? 0), 0);
    const totalSites = regions.reduce(
        (acc, r) => acc + (r.cluster?.reduce((a, c) => a + (c.site?.length ?? 0), 0) ?? 0),
        0,
    );
    const totalSubMerchants = regions.reduce(
        (acc, r) =>
            acc +
            (r.cluster?.reduce((a, c) => a + (c.site?.reduce((b, s) => b + (s.subMerchant?.length ?? 0), 0) ?? 0), 0) ??
                0),
        0,
    );
    const totalDevices = regions.reduce(
        (acc, r) =>
            acc +
            (r.cluster?.reduce(
                (a, c) =>
                    a +
                    (c.site?.reduce(
                        (b, s) => b + (s.subMerchant?.reduce((d, sm) => d + (sm.devices?.length ?? 0), 0) ?? 0),
                        0,
                    ) ?? 0),
                0,
            ) ?? 0),
        0,
    );

    const stats = [
        { label: "Regions", value: regions.length, color: "text-slate-600" },
        { label: "Clusters", value: totalClusters, color: "text-slate-600" },
        { label: "Sites", value: totalSites, color: "text-slate-600" },
        { label: "Sub Merchants", value: totalSubMerchants, color: "text-slate-600" },
        { label: "Devices", value: totalDevices, color: "text-slate-600" },
    ];

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-6">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                        {merchantData.merchantDesc?.charAt(0) ?? "M"}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-slate-900">{merchantData.merchantDesc}</span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                ID: {merchantData.merchantId}
                            </span>
                            {merchantData.danaTalang === "Y" && (
                                <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                    Floating Fund
                                </span>
                            )}
                            <span
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${merchantData.status === "principal"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                    }`}
                            >
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    {merchantData.status === "principal" ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                                        />
                                    )}
                                </svg>
                                {merchantData.status === "principal" ? "Principal" : "Non Principal"}
                            </span>

                            {/* isClient badge */}
                            <span
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${merchantData.isClient === "N"
                                    ? "border-violet-200 bg-violet-50 text-violet-700"
                                    : "border-orange-200 bg-orange-50 text-orange-700"
                                    }`}
                            >
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    {merchantData.isClient === "N" ? (
                                        /* briefcase - biaya ditanggung merchant */
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                                        />
                                    ) : (
                                        /* user - biaya ditanggung customer */
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                        />
                                    )}
                                </svg>
                                {merchantData.isClient === "Y" ? "Customer-Billed" : "Merchant-Billed"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setShowBankModal(true)}
                        className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                    >
                        Show Bank Account
                    </button>

                    <div className="text-left">
                        <div className="text-xs font-medium text-slate-400">Product Name</div>
                        <div className="text-sm font-semibold text-slate-900">
                            {merchantData.productName ?? "-"}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <div className="text-left">
                        <div className="text-xs font-medium text-slate-400">Floating Fund</div>
                        <div className="text-sm font-semibold text-slate-900">
                            {merchantData.danaTalang === "Y"
                                ? "Yes"
                                : "No"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-5 divide-x divide-slate-100">
                {stats.map((s) => (
                    <div key={s.label} className="px-4 py-3 text-center">
                        <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* API Key */}
            <div className="border-t border-slate-100 px-6 py-4">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">API Key</p>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-sm max-w-xl">
                    <div className="flex w-8 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400">
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                            />
                        </svg>
                    </div>
                    <code className="flex h-9 flex-1 items-center truncate px-3 font-mono text-xs text-slate-500">
                        {apiKey || "—"}
                    </code>
                    <button
                        onClick={onCopyApiKey}
                        className="flex h-9 shrink-0 items-center gap-1.5 border-l border-slate-200 px-3 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                        Copy
                    </button>
                    <button
                        onClick={onRefreshApiKey}
                        disabled={apiKeyLoading}
                        className="flex h-9 shrink-0 items-center gap-1.5 border-l border-slate-200 px-3 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg
                            className={`h-3.5 w-3.5 ${apiKeyLoading ? "animate-spin" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                        </svg>
                        {apiKeyLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
                {apiKeyError && <p className="mt-2 text-xs text-red-500">{apiKeyError}</p>}
            </div>

            <CallbackUrlCard callbackUrl={merchantData.callbackUrl} />
            <CallbackUrlCard callbackUrl={merchantData.redirectUrl} label="Redirect URL" />

            {/* Payment Methods */}
            {activePaymentMethods.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Active Payment Methods
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                        {activePaymentMethods.map((pm) => (
                            <MerchantPaymentMethodCard key={pm.paymentMethodUid} pm={pm} />
                        ))}
                    </div>
                </div>
            )}

            {/* Show Bank Account Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Bank Accounts</h2>
                                <p className="mt-1 text-sm text-slate-500">{merchantData.merchantDesc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBankModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                            <div className="space-y-3">
                                {/* Merchant Bank */}
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        Merchant Bank
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">{merchantData.bankName || "—"}</p>
                                    <p className="mt-0.5 text-xs text-slate-400 font-mono">{merchantData.bankNoRek || "—"}</p>
                                </div>

                                {/* Region Bank */}
                                {regions.length === 0 ? (
                                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                            Region Bank
                                        </p>
                                        <p className="text-sm text-slate-400 italic">No region data available</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {regions.map((region) => (
                                            <div
                                                key={region.regionUid}
                                                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                                            >
                                                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                                    Region Bank
                                                </p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {region.regionId} – {region.regionDesc}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-600">{region.bankName || "—"}</p>
                                                <p className="mt-0.5 text-xs text-slate-400 font-mono">{region.bankNoRek || "—"}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MerchantPaymentMethodCard({ pm }: { pm: PaymentMethodByMerchantModel }) {
    const isPercentage = pm.price?.isPercentage === "Y";
    const priceDisplay = pm.price
        ? isPercentage
            ? `${pm.price.price} %`
            : `Rp ${pm.price.price.toLocaleString("id-ID")}`
        : "—";
    return (
        <div className="border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
            <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-700 truncate">{pm.bank}</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0 leading-tight border border-emerald-100">
                    Active
                </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-none">{priceDisplay}</p>
            <div className="border-t border-slate-100" />
            <p className="text-[10px] text-slate-400 truncate">{pm.category?.catDesc || "—"}</p>
        </div>
    );
}

function CallbackUrlCard({ callbackUrl, label = "Callback URL" }: { callbackUrl?: string; label?: string }) {
    const hasValue = !!callbackUrl?.trim();

    return (
        <div className="mb-4  px-6 flex flex-col gap-1.5 hover:bg-blue-50/40 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                        {label}
                    </p>
                </div>

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasValue ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${hasValue ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {hasValue ? "Configured" : "Not Set"}
                </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-foreground/4">
                <div className="flex items-start gap-3 px-3 py-3">
                    <div className="mt-0.5 shrink-0 text-foreground/40">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-2.122 2.121a4.5 4.5 0 01-6.364-6.364l1.757-1.757m3.182-1.061a4.5 4.5 0 016.364 6.364l-1.757 1.757m-2.121-6.364l-4.243 4.243"
                            />
                        </svg>
                    </div>

                    {hasValue ? (
                        <div className="min-w-0 flex-1">
                            <a
                                href={callbackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block break-all font-mono text-xs text-blue-600 hover:underline"
                            >
                                {callbackUrl}
                            </a>
                        </div>
                    ) : (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground/50">{label} is not available</p>
                            <p className="mt-1 text-xs text-foreground/40">
                                Please contact support to set up your callback URL.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
