import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { BreadcrumbDrawerDetail } from "@/components/shared/BreadcrumbDrawerDetail";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { useMerchant } from "@/hooks/useMerchant";
import { formatDate } from "@/utils/formatDate";

import { MerchantModel } from "@/data/models/MerchantModel";
import { RegionDetailedModel } from "@/data/models/RegionModel";

import { useApiKeyInfo, useApiKeyRefresh } from "@/hooks/useApiKeyInfo";
import { MerchantRequest } from "@/data/request/MerchantRequest";

type DetailDrawerProps = {
    merchant: MerchantModel;
    logs?: [];
    onClose: () => void;
    onToggleStatus?: (m: MerchantRequest) => void | Promise<void>;
    canEdit: boolean;
};

type InfoItem = {
    label: string;
    value?: string | null;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-background px-4 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">{title}</p>
            </div>
            <div>{children}</div>
        </div>
    );
}

function InfoRows({ items }: { items: InfoItem[] }) {
    return (
        <div className="divide-y divide-border">
            {items.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 gap-4">
                    <span className="text-xs text-foreground/60">{label}</span>
                    <span className="text-xs font-medium text-foreground text-right max-w-[60%] wrap-break-words">
                        {value || "-"}
                    </span>
                </div>
            ))}
        </div>
    );
}

function countHierarchy(regionData: RegionDetailedModel[] = []) {
    const regionCount = regionData.length;
    let clusterCount = 0;
    let siteCount = 0;
    let subMerchantCount = 0;
    let deviceCount = 0;

    for (const region of regionData) {
        const clusters = region?.cluster ?? [];
        clusterCount += clusters.length;

        for (const cluster of clusters) {
            const sites = cluster?.site ?? [];
            siteCount += sites.length;

            for (const site of sites) {
                const subMerchants = site?.subMerchant ?? [];
                subMerchantCount += subMerchants.length;

                for (const sub of subMerchants) {
                    const devices = sub?.devices ?? [];
                    deviceCount += devices.length;
                }
            }
        }
    }

    return {
        regionCount,
        clusterCount,
        siteCount,
        subMerchantCount,
        deviceCount,
    };
}

export function DetailDrawer({ merchant, logs, onClose, onToggleStatus, canEdit }: DetailDrawerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();

    const { data: merchantDetailData, loading, refetch: refetchMerchant } = useMerchant(merchant.merchantId);
    const { data: apikey, loading: loadingAPIKey } = useApiKeyInfo(merchant.merchantUid, "merchant");
    const { loading: refreshLoading, error: refreshError, refreshApiKey } = useApiKeyRefresh();

    const [newKey, setNewKey] = useState<string | null>(null);

    const displayedApiKey = newKey ?? apikey ?? "—";

    const handleRefreshApiKey = async () => {
        const key = await refreshApiKey(merchant.merchantUid, "merchant");
        setNewKey(key);
    };

    const [copied, setCopied] = useState(false);

    const copyApiKeytoClipboard = () => {
        if (!displayedApiKey || displayedApiKey === "—") return;
        navigator.clipboard.writeText(displayedApiKey);
        setCopied(true);
        showToast("API Key copied to clipboard", "success");
    };

    const hierarchySummary = useMemo(() => {
        return countHierarchy(merchantDetailData?.region ?? []);
    }, [merchantDetailData?.region]);

    const merchantStatus = merchantDetailData?.isActive === "Y" ? "Active" : "Inactive";


    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const openConfirm = () => setIsConfirmOpen(true);
    const closeConfirm = () => setIsConfirmOpen(false);

    const handleToggleStatus = async () => {
        if (!onToggleStatus || !merchantDetailData) return;

        const currentStatus = merchantDetailData.isActive === "Y" ? "Y" : "N";

        const payload: MerchantRequest = {
            merchantDesc: merchantDetailData.merchantDesc,
            registrationDate: merchantDetailData.registrationDate,
            userUid: merchantDetailData.userMerchant?.userUid ?? "",
            createdBy: merchantDetailData.createdBy?.userUid ?? "",
            withMdr: merchantDetailData.withMdr,
            danaTalang: merchantDetailData.danaTalang,
            isClient: merchantDetailData.isClient,
            status: merchantDetailData.status,
            bankName: merchantDetailData.bankName,
            bankNoRek: merchantDetailData.bankNoRek,
            callbackUrl: merchantDetailData.callbackUrl,
            redirectUrl: merchantDetailData.redirectUrl,
            productName: merchantDetailData.productName,
            isActive: currentStatus === "Y" ? "N" : "Y",
        };

        await onToggleStatus(payload);
        refetchMerchant();
        closeConfirm();
    };

    if (loading || !merchantDetailData || loadingAPIKey) {
        return <BreadcrumbDrawerDetail onClose={onClose} />;
    }

    const merchantInfoItems: InfoItem[] = [
        {
            label: "Registration Date",
            value: merchantDetailData.registrationDate ? formatDate(merchantDetailData.registrationDate) : "-",
        },
        {
            label: "Created At",
            value: merchantDetailData.createdAt ? formatDate(merchantDetailData.createdAt) : "-",
        },
        {
            label: "Last Updated",
            value: merchantDetailData.updatedAt ? formatDate(merchantDetailData.updatedAt) : "-",
        },
        {
            label: "Floating Fund",
            value: merchantDetailData.danaTalang || "-",
        },
        {
            label: "Product Name",
            value: merchantDetailData.productName || "-",
        },
        {
            label: "Callback URL",
            value: merchantDetailData.callbackUrl || "-",
        },
        {
            label: "Redirect URL",
            value: merchantDetailData.redirectUrl || "-",
        },
    ];

    const picInfoItems: InfoItem[] = [
        { label: "Full Name", value: merchantDetailData.userMerchant?.fullName },
        { label: "Username", value: merchantDetailData.userMerchant?.userName },
        { label: "Email", value: merchantDetailData.userMerchant?.email },
        { label: "Phone", value: merchantDetailData.userMerchant?.phone },
        { label: "Role", value: merchantDetailData.userMerchant?.role?.roleDesc ?? "-" },
        { label: "Gender", value: merchantDetailData.userMerchant?.gender },
        {
            label: "Date of Birth",
            value: merchantDetailData.userMerchant?.dateOfBirth
                ? formatDate(merchantDetailData.userMerchant.dateOfBirth)
                : "-",
        },
    ];

    const modifiedInfoItems: InfoItem[] = [
        { label: "Name", value: merchantDetailData.createdBy?.fullName },
        { label: "Email", value: merchantDetailData.createdBy?.email },
        { label: "Role", value: merchantDetailData.createdBy?.role?.roleDesc ?? "-" },
        {
            label: "Modification Time",
            value: merchantDetailData.updatedAt ? formatDate(merchantDetailData.updatedAt) : "-",
        },
    ];

    const hierarchyInfoItems: InfoItem[] = [
        { label: "Total Regions", value: String(hierarchySummary.regionCount) },
        { label: "Total Clusters", value: String(hierarchySummary.clusterCount) },
        { label: "Total Sites", value: String(hierarchySummary.siteCount) },
        {
            label: "Total Sub Merchants",
            value: String(hierarchySummary.subMerchantCount),
        },
        { label: "Total Devices", value: String(hierarchySummary.deviceCount) },
    ];

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-md bg-background shadow-2xl flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <div className="bg-primary px-6 py-5 flex items-start justify-between shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-primary-foreground mt-0.5">
                                {merchantDetailData.merchantDesc || "-"}
                            </h2>
                            <p className="text-xs text-primary-foreground/60 mt-0.5">
                                ID: {merchantDetailData.merchantId || "-"}
                            </p>
                            <div className="mt-2">
                                <StatusBadge status={merchantStatus} />
                            </div>

                            {/* Principal / Non Principal badge */}
                            <div className="mt-2.5">
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                        merchantDetailData.status === "principal"
                                            ? "bg-amber-400/15 border-amber-400/30 text-white"
                                            : "bg-blue-400/15 border-blue-400/30 text-white"
                                    }`}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        {merchantDetailData.status === "principal" ? (
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
                                    {merchantDetailData.status === "principal" ? "Principal" : "Non Principal"}
                                </span>
                            </div>

                            {/* isClient badge */}
                            <div className="mt-1.5">
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                        merchantDetailData.isClient === "N"
                                            ? "bg-violet-400/15 border-violet-400/30 text-white"
                                            : "bg-orange-400/15 border-orange-400/30 text-white"
                                    }`}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        {merchantDetailData.isClient === "N" ? (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                                            />
                                        ) : (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                            />
                                        )}
                                    </svg>
                                    {merchantDetailData.isClient === "Y" ? "Customer-Billed" : "Merchant-Billed"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`${pathname}/${merchantDetailData.merchantUid}`)}
                                className="text-primary-foreground/70 hover:text-primary-foreground text-xs font-medium px-3 py-1.5 rounded hover:bg-primary-foreground/10 transition-colors"
                            >
                                View Detail
                            </button>
                            <button
                                onClick={onClose}
                                className="text-primary-foreground/70 hover:text-primary-foreground mt-1"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        <SectionCard title="Merchant Information">
                            <InfoRows items={merchantInfoItems} />
                        </SectionCard>

                        <SectionCard title="API Access">
                            <div className="px-4 py-3 space-y-3">
                                {/* Label */}
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                                    API Key
                                </p>

                                {/* Key bar */}
                                <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-foreground/4">
                                    {/* Icon */}
                                    <div className="flex w-9 shrink-0 items-center justify-center border-r border-border text-foreground/40">
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

                                    {/* Value */}
                                    <code className="flex h-9 flex-1 items-center truncate px-3 font-mono text-xs text-foreground/70">
                                        {displayedApiKey}
                                    </code>

                                    {/* Copy */}
                                    <button
                                        type="button"
                                        onClick={copyApiKeytoClipboard}
                                        disabled={!displayedApiKey || displayedApiKey === "—"}
                                        className="flex h-9 shrink-0 items-center gap-1.5 border-l border-border px-3 text-[11px] font-medium text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {copied ? (
                                            <>
                                                <svg
                                                    className="h-3 w-3 text-emerald-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <span className="text-emerald-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>

                                    {/* Refresh */}
                                    <button
                                        type="button"
                                        onClick={handleRefreshApiKey}
                                        disabled={refreshLoading}
                                        className="flex h-9 shrink-0 items-center gap-1.5 border-l border-border px-3.5 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg
                                            className={`h-3.5 w-3.5 ${refreshLoading ? "animate-spin" : ""}`}
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
                                        {refreshLoading ? "Refreshing..." : "Refresh"}
                                    </button>
                                </div>

                                {/* Error */}
                                {refreshError && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5">
                                        <svg
                                            className="h-3.5 w-3.5 shrink-0 text-red-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                            />
                                        </svg>
                                        <span className="text-xs text-red-600">{refreshError}</span>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        <SectionCard title="Person in Charge">
                            <InfoRows items={picInfoItems} />
                        </SectionCard>

                        <SectionCard title="Modified By">
                            <InfoRows items={modifiedInfoItems} />
                        </SectionCard>

                        <SectionCard title="Organization Summary">
                            <InfoRows items={hierarchyInfoItems} />
                        </SectionCard>

                        <SectionCard title="Region Overview">
                            <div className="px-4 py-3 space-y-3">
                                {(merchantDetailData.region ?? []).length === 0 ? (
                                    <p className="text-xs text-foreground/50 italic">No regions configured yet.</p>
                                ) : (
                                    merchantDetailData.region.map((region) => {
                                        const clusterCount = region?.cluster?.length ?? 0;
                                        const siteCount =
                                            region?.cluster?.reduce(
                                                (acc: number, cluster) => acc + (cluster?.site?.length ?? 0),
                                                0,
                                            ) ?? 0;

                                        const subMerchantCount =
                                            region?.cluster?.reduce(
                                                (acc: number, cluster) =>
                                                    acc +
                                                    (cluster?.site?.reduce(
                                                        (siteAcc: number, site) =>
                                                            siteAcc + (site?.subMerchant?.length ?? 0),
                                                        0,
                                                    ) ?? 0),
                                                0,
                                            ) ?? 0;

                                        return (
                                            <div
                                                key={region.regionUid}
                                                className="rounded-lg border border-border p-3 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {region.regionDesc || "-"}
                                                        </p>
                                                        <p className="text-xs text-foreground/50">
                                                            ID: {region.regionId || "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="rounded-md bg-muted px-2 py-2">
                                                        <p className="text-[10px] text-foreground/50">Clusters</p>
                                                        <p className="text-xs font-semibold">{clusterCount}</p>
                                                    </div>
                                                    <div className="rounded-md bg-muted px-2 py-2">
                                                        <p className="text-[10px] text-foreground/50">Sites</p>
                                                        <p className="text-xs font-semibold">{siteCount}</p>
                                                    </div>
                                                    <div className="rounded-md bg-muted px-2 py-2">
                                                        <p className="text-[10px] text-foreground/50">Sub Merchants</p>
                                                        <p className="text-xs font-semibold">{subMerchantCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </SectionCard>

                        <SectionCard title="Payment Methods">
                            <div className="px-4 py-3">
                                <p className="text-xs text-foreground/50 italic">No payment methods configured.</p>
                            </div>
                        </SectionCard>

                        {/* {merchantDetailData.userMerchant?.isActive === "N" && (
                            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 flex gap-3">
                                <svg
                                    className="h-4 w-4 text-primary mt-0.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                                <p className="text-xs text-foreground/70">
                                    Inactive merchants cannot process new transactions. Historical data remains
                                    accessible for audit purposes.
                                </p>
                            </div>
                        )} */}

                        {/* <div>
                            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                                Change History
                            </p>
                            <p className="text-xs text-foreground/50 italic">No change history recorded yet.</p>
                        </div> */}

                        {canEdit && (
                            <div className="border-t border-border px-6 py-4 bg-background shrink-0">
                                <button
                                    onClick={openConfirm}
                                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                                        merchantDetailData.isActive === "Y"
                                            ? "bg-red-500 border text-white hover:bg-red-600"
                                            : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15"
                                    }`}
                                >
                                    {merchantDetailData.isActive === "Y"
                                        ? "Deactivate Merchant"
                                        : "Activate Merchant"}
                                </button>
                            </div>
                        )}

                        {isConfirmOpen && (
                            <div className="fixed inset-0 z-60 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
                                <div className="relative bg-background rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
                                    <h3 className="text-sm font-semibold mb-3">Confirm Action</h3>
                                    <p className="text-xs text-foreground/70 mb-4">
                                        Are you sure you want to {merchantDetailData.isActive === "Y" ? "deactivate" : "activate"} this merchant?
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button className="px-3 py-2 text-sm" onClick={closeConfirm}>
                                            Cancel
                                        </button>
                                        <button
                                            className={`px-3 py-2 text-sm font-semibold rounded ${merchantDetailData.isActive === "Y" ? 'bg-red-500 text-white' : 'bg-primary text-white'}`}
                                            onClick={handleToggleStatus}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
