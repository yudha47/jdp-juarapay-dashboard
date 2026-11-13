"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, MapPin, Layers, Store, Building2 } from "lucide-react";
import { StatsOverview } from "./components/StatsOverview";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { useReportPaymentMethodsPerMonth, useReportPeriods, useReportTrxPerMonth } from "@/hooks/useReport";
import { aggregateStats, formatPeriodLabel } from "./helper/summaryReportUtils";
import { useSummaryIdentityResolver } from "./helper/useResolver";
import { RegionDetailedModel } from "@/data/models/RegionModel";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { UserDetailedModel } from "@/data/models/UserModel";
import { PaymentMethodList } from "./components/PaymentMethodList";
import { TransactionStatusPie } from "./components/TransactionStatusPie";

interface MerchantSummary {
    merchantId: string;
    merchantDesc: string;
    danaTalang: "Y" | "N";
    totalRegion: number;
    totalCluster: number;
    totalSubMerchant: number;
}

type ResolvedUids = {
    merchantUid?: string;
    regionUid?: string;
    subMerchantUid?: string;
};

type PaymentMethodItem = {
    method: string;
    count: number;
    total: number;
    percentage: number;
};

function countClusters(merchant?: MerchantDetailedModel | null) {
    if (!merchant?.region?.length) return 0;
    return merchant.region.reduce((total, region) => {
        return total + (region.cluster?.length ?? 0);
    }, 0);
}

function countSubMerchantsFromMerchant(merchant?: MerchantDetailedModel | null) {
    if (!merchant?.region?.length) return 0;
    return merchant.region.reduce((totalRegion, region) => {
        const regionSubMerchantCount =
            region.cluster?.reduce((totalCluster, cluster) => {
                const clusterSubMerchantCount =
                    cluster.site?.reduce((totalSite, site) => {
                        return totalSite + (site.subMerchant?.length ?? 0);
                    }, 0) ?? 0;
                return totalCluster + clusterSubMerchantCount;
            }, 0) ?? 0;
        return totalRegion + regionSubMerchantCount;
    }, 0);
}

function buildAdminMerchantCard(identity: {
    merchant: MerchantDetailedModel | null;
    region: RegionDetailedModel | null;
    subMerchant: SubMerchantDetailedModel | null;
    userDetail: UserDetailedModel | null;
    uids: ResolvedUids;
}): MerchantSummary {
    const merchant = identity?.merchant;
    return {
        merchantId: merchant?.merchantId ?? "-",
        merchantDesc: merchant?.merchantDesc ?? "-",
        danaTalang: merchant?.danaTalang === "Y" ? "Y" : "N",
        totalRegion: merchant?.region?.length ?? 0,
        totalCluster: countClusters(merchant),
        totalSubMerchant: countSubMerchantsFromMerchant(merchant),
    };
}

function MerchantInfoCard({ data }: { data: MerchantSummary }) {
    const initials = data.merchantDesc
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const summaryItems = [
        { label: "Region", value: data.totalRegion, icon: MapPin },
        { label: "Cluster", value: data.totalCluster, icon: Layers },
        { label: "Sub-merchant", value: data.totalSubMerchant, icon: Store },
    ];

    return (
        <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-white px-6 py-5 shadow-sm">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm">
                        {initials}
                    </div>
                    {data.danaTalang === "Y" && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                <path
                                    d="M10 3L5 8.5 2 5.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            </svg>
                        </span>
                    )}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-base leading-tight font-semibold text-slate-900">
                            {data.merchantDesc}
                        </p>
                        {data.danaTalang === "Y" && (
                            <span className="hidden items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 sm:inline-flex">
                                Floating Fund
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Merchant ID:
                        </span>{" "}
                        <span className="font-mono text-slate-500">{data.merchantId}</span>
                    </p>
                </div>
            </div>

            <div className="hidden h-10 w-px bg-slate-100 lg:block" />

            <div className="flex items-center gap-1">
                {summaryItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex flex-col items-center px-5">
                                <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="text-xs">{item.label}</span>
                                </div>
                                <p className="text-2xl leading-none font-bold text-slate-800">{item.value}</p>
                            </div>
                            {i < summaryItems.length - 1 && <div className="h-8 w-px bg-slate-100" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SummaryAdminContent() {
    const { items: periodItems, loading: periodLoading } = useReportPeriods();

    const [selectedPeriod, setSelectedPeriod] = useState("");

    const monthOptions = useMemo(() => {
        return periodItems
            .map((item) => ({
                value: String(item.period),
                label: formatPeriodLabel(item.period),
            }))
            .sort((a, b) => Number(b.value) - Number(a.value));
    }, [periodItems]);

    const currentPeriod = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        return `${year}${month}`;
    }, []);

    useEffect(() => {
        if (!selectedPeriod && monthOptions.length > 0) {
            const found = monthOptions.find((m) => m.value === currentPeriod);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPeriod(found ? currentPeriod : monthOptions[0]?.value ?? "");
        }
    }, [monthOptions, selectedPeriod, currentPeriod]);

    const {
        items,
        setSearchBy: setTrxSearchBy,
        setQ: setTrxQ,
        loading: trxLoading,
    } = useReportTrxPerMonth({
        page: 1,
        limit: 100000,
        sort: "period",
        order: "desc",
        searchBy: "period",
        q: selectedPeriod || undefined,
    });

    const {
        items: paymentMethodItems,
        loading: paymentMethodLoading,
        setSearchBy: setPaymentSearchBy,
        setQ: setPaymentQ,
    } = useReportPaymentMethodsPerMonth({
        page: 1,
        limit: 100000,
        sort: "period",
        order: "desc",
        searchBy: "period",
        q: selectedPeriod || undefined,
    });

    // Sync selectedPeriod ke kedua hook setiap kali berubah
    useEffect(() => {
        if (!selectedPeriod) return;
        setTrxSearchBy("period");
        setTrxQ(selectedPeriod);
        setPaymentSearchBy("period");
        setPaymentQ(selectedPeriod);
    }, [selectedPeriod]);

    const activeItems = useMemo(() => items, [items]);
    const activeStats = useMemo(() => aggregateStats(activeItems), [activeItems]);
    const activeReportItem = activeItems[0] ?? null;

    const { identity } = useSummaryIdentityResolver({
        role: "admin",
        activeReportItem,
    });

    const isLoading = periodLoading || trxLoading || paymentMethodLoading;

    const pieChartData = useMemo(
        () => [
            { name: "Paid", value: activeStats.totalPaid, color: "#10b981" },
            { name: "Pending", value: activeStats.pendingPaid, color: "#f59e0b" },
            { name: "Failed", value: activeStats.failedPaid, color: "#ef4444" },
        ],
        [activeStats],
    );

    const merchantCardData = useMemo(() => buildAdminMerchantCard(identity), [identity]);

    const paymentMethods = useMemo<PaymentMethodItem[]>(() => {
        const grouped = new Map<string, { method: string; total: number; count: number }>();

        paymentMethodItems
            .filter((item) => item.externalStatus?.toLowerCase().trim() === "paid")
            .forEach((item) => {
                const total = Number(item.total || 0);
                const key = item.paymentCode; // group by paymentCode saja
                const existing = grouped.get(key);

                if (existing) {
                    existing.total += total;
                    existing.count += 1;
                } else {
                    grouped.set(key, {
                        method: `${item.bank} • ${item.category}`,
                        total,
                        count: 1,
                    });
                }
            });

        const groupedItems = Array.from(grouped.values());
        const grandTotal = groupedItems.reduce((sum, item) => sum + item.total, 0);

        return groupedItems
            .map((item) => ({
                method: item.method,
                count: item.count,
                total: item.total,
                percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

    }, [paymentMethodItems]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50/80">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-slate-500">Loading data...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50/80 p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Summary</h1>
                        <p className="mt-1 text-sm text-slate-500">Overview of transactions and performance metrics</p>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            disabled={periodLoading || monthOptions.length === 0}
                        >
                            {monthOptions.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <MerchantInfoCard data={merchantCardData} />

                <StatsOverview
                    stats={{
                        totalTransaction: activeStats.totalTransaction,
                        totalAmount: activeStats.totalAmount,
                        transactionWithoutFee: activeStats.transactionWithoutFee,
                        totalPaid: activeStats.totalPaid,
                        pendingPaid: activeStats.pendingPaid,
                        failedPaid: activeStats.failedPaid,
                    }}
                    formatCurrency={formatCurrency}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TransactionStatusPie data={pieChartData} />
                    {paymentMethodLoading && paymentMethods.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
                            Loading payment method data...
                        </div>
                    ) : paymentMethods.length > 0 ? (
                        <PaymentMethodList data={paymentMethods} />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
                            Payment method data is not available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}