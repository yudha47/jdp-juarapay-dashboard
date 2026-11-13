"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  MapPin,
  Store,
  Building2,
} from "lucide-react";

import { StatsOverview } from "./components/StatsOverview";

import {
  useReportPeriods,
  useReportTrxPerMonth,
} from "@/hooks/useReport";

import { useSummaryIdentityResolver } from "./helper/useResolver";

import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { RegionDetailedModel } from "@/data/models/RegionModel";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { UserDetailedModel } from "@/data/models/UserModel";

import {
  aggregateStats,
  formatPeriodLabel,
} from "./helper/summaryReportUtils";

interface MerchantSummary {
  merchantId: string;
  merchantDesc: string;
  regionDesc: string;
  subMerchantDesc: string;
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

function buildSubMerchantCard(identity: {
  merchant: MerchantDetailedModel | null;
  region: RegionDetailedModel | null;
  subMerchant: SubMerchantDetailedModel | null;
  userDetail: UserDetailedModel | null;
  uids: ResolvedUids;
}): MerchantSummary {
  const merchant = identity?.merchant;
  const region = identity?.region;
  const subMerchant = identity?.subMerchant;

  return {
    merchantId: merchant?.merchantId ?? "-",
    merchantDesc: merchant?.merchantDesc ?? "-",
    regionDesc: region?.regionDesc ?? "-",
    subMerchantDesc: subMerchant?.subMerchantDesc ?? "-",
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

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-white px-6 py-5 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-900">
              {data.merchantDesc}
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Building2 className="h-3 w-3" />
              <span className="font-mono text-slate-500">{data.merchantId}</span>
            </p>

            <div className="h-3 w-px bg-slate-200" />

            <p className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>{data.regionDesc}</span>
            </p>

            <div className="h-3 w-px bg-slate-200" />

            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Store className="h-3 w-3" />
              <span>{data.subMerchantDesc}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummarySubMerchantContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const { items: periodItems, loading: periodLoading } = useReportPeriods();

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
    loading,
    setSearchBy,
    setQ,
  } = useReportTrxPerMonth({
    page: 1,
    limit: 100000,
    sort: "period",
    order: "desc",
    searchBy: "period",
    q: selectedPeriod || undefined,
  });

  // Sync selectedPeriod ke hook setiap kali berubah
  useEffect(() => {
    if (!selectedPeriod) return;
    setSearchBy("period");
    setQ(selectedPeriod);
  }, [selectedPeriod]);

  const activeItems = useMemo(() => items, [items]);
  const activeStats = useMemo(() => aggregateStats(activeItems), [activeItems]);
  const activeReportItem = activeItems[0] ?? null;

  const { identity } = useSummaryIdentityResolver({
    role: "merchant",
    activeReportItem,
  });

  const merchantCardData = useMemo(() => buildSubMerchantCard(identity), [identity]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-slate-50/80 p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Summary</h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of transactions and performance metrics
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={loading || periodLoading || monthOptions.length === 0}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-medium shadow-sm"
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
      </div>
    </div>
  );
}