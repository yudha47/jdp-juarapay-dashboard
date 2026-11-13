import { MerchantDetailedModel } from "../../../../data/models/MerchantModel";

interface MerchantInfoCardProps {
    merchant: MerchantDetailedModel | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MerchantInfoCard({ merchant }: MerchantInfoCardProps) {
    if (!merchant) {
        return null;
    }
    const totalRegion = merchant.region?.length || 0;

    const totalSite =
        merchant.region?.reduce(
            (acc, r) => acc + (r.cluster?.reduce((a, c) => a + (c.site?.length || 0), 0) || 0),
            0,
        ) || 0;

    const totalSubMerchant =
        merchant.region?.reduce(
            (acc, r) =>
                acc +
                (r.cluster?.reduce(
                    (a, c) => a + (c.site?.reduce((s, st) => s + (st.subMerchant?.length || 0), 0) || 0),
                    0,
                ) || 0),
            0,
        ) || 0;

    const stats = [
        { label: "Region", value: totalRegion },
        { label: "Site", value: totalSite },
        { label: "Sub Merchant", value: totalSubMerchant },
    ];

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Identity */}
                <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold capitalize text-slate-800">
                                {merchant.merchantDesc}
                            </h2>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-500">
                                ID: {merchant.merchantId}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <svg
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <span>{merchant.userMerchant.fullName}</span>
                            <span className="text-slate-300">·</span>
                            <span>{merchant.userMerchant.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span>
                                Terdaftar{" "}
                                {new Date(merchant.registrationDate).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="ml-auto flex divide-x divide-slate-100 rounded-lg border border-slate-100 bg-slate-50">
                    {stats.map((s) => (
                        <div key={s.label} className="flex flex-col items-center gap-0.5 px-5 py-3">
                            <p className="text-xl font-bold text-slate-800">{s.value}</p>
                            <p className="whitespace-nowrap text-xs text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Region breakdown ── */}
            <div className="border-t border-slate-100">
                <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                    {merchant.region?.map((region) => {
                        const regionSubMerchantCount =
                            region.cluster?.reduce(
                                (a, c) => a + (c.site?.reduce((s, st) => s + (st.subMerchant?.length || 0), 0) || 0),
                                0,
                            ) || 0;
                        const regionSiteCount = region.cluster.reduce((a, c) => a + (c.site?.length || 0), 0);

                        return (
                            <details key={region.regionUid} className="group bg-white">
                                <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                                            <svg
                                                className="h-3.5 w-3.5 text-blue-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {region.regionDesc}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span>{regionSiteCount} site</span>
                                        <span className="text-slate-200">·</span>
                                        <span>{regionSubMerchantCount} sub merchant</span>
                                        <svg
                                            className="h-4 w-4 transition-transform group-open:rotate-180"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </summary>

                                <div className="border-t border-slate-100 p-4">
                                    <div className="flex flex-col gap-2">
                                        {region.cluster?.map((cluster) => (
                                            <div
                                                key={cluster.clusterUid}
                                                className="rounded-lg border border-slate-100 bg-slate-50"
                                            >
                                                <div className="flex items-center gap-2 px-3 py-2">
                                                    <svg
                                                        className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 11H5"
                                                        />
                                                    </svg>
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {cluster.clusterDesc}
                                                    </span>
                                                </div>

                                                <div className="border-t border-slate-100">
                                                    {cluster.site?.map((site) => (
                                                        <div key={site.siteUid}>
                                                            <div className="flex items-center gap-2 px-3 py-1.5">
                                                                <span className="text-xs font-medium text-slate-700">
                                                                    {site.siteDesc}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-col gap-px px-3 pb-2">
                                                                {site.subMerchant?.map((sm) => (
                                                                    <div
                                                                        key={sm.subMerchantUid}
                                                                        className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5"
                                                                    >
                                                                        <span className="text-xs text-slate-500">
                                                                            {sm.subMerchantDesc}
                                                                        </span>
                                                                        {sm.devices && sm.devices?.length > 0 ? (
                                                                            <span className="text-xs text-slate-400">
                                                                                {sm.devices.length} device
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-xs text-slate-300">
                                                                                —
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
