"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { MonthlyTransactionList } from "./components/MonthlyTransactionList";
import { TransactionStatusCards } from "./components/TransactionStatusCards";
import { TopMerchantsList } from "./components/TopMerchantsList";
import { PaymentMethodList } from "./components/PaymentMethodList";
import { StatsOverview } from "./components/StatsOverview";
import { TransactionStatusPie } from "./components/TransactionStatusPie";
import {
  useReportPaymentMethodsPerMonth,
  useReportPelimpahan,
  useReportPeriods,
  useReportTrxPerMonth,
} from "@/hooks/useReport";
import {
  aggregateStats,
  formatPeriodLabel,
} from "./helper/summaryReportUtils";
import { PelimpahanSummary } from "./components/PelimpahanSummary";

type TopMerchantItem = {
  name: string;
  transactions: number;
  amount: number;
  status: string;
};

type PaymentMethodItem = {
  method: string;
  count: number;
  percentage: number;
};

export default function SummarySuperContent() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const {
    items: periodItems,
    loading: periodLoading,
    error: periodError,
  } = useReportPeriods();

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

  // ── All-period data (for monthly chart & top merchants) ──────────────────
  const { items: allMonthlyItems, loading: allMonthlyLoading } =
    useReportTrxPerMonth({
      page: 1,
      limit: 1000000,
      sort: "period",
      order: "asc",
    });

  // ── Filtered by selectedPeriod ────────────────────────────────────────────
  const {
    items,
    loading,
    error,
    setSearchBy,
    setQ,
  } = useReportTrxPerMonth({
    page: 1,
    limit: 100000000,
    sort: "period",
    order: "desc",
    searchBy: "period",
    q: selectedPeriod || undefined,
  });

  useEffect(() => {
    if (!selectedPeriod) return;
    setSearchBy("period");
    setQ(selectedPeriod);
  }, [selectedPeriod]);

  const {
    items: paymentMethodItems,
    loading: paymentMethodLoading,
    error: paymentMethodError,
    setSearchBy: setPaymentSearchBy,
    setQ: setPaymentQ,
  } = useReportPaymentMethodsPerMonth({
    page: 1,
    limit: 1000000,
    sort: "period",
    order: "desc",
    searchBy: "period",
    q: selectedPeriod || undefined,
  });

  useEffect(() => {
    if (!selectedPeriod) return;
    setPaymentSearchBy("period");
    setPaymentQ(selectedPeriod);
  }, [selectedPeriod]);

  // ── Pelimpahan — filtered by selectedPeriod (same as other hooks) ─────────
  const {
    items: pelimpahanItems,
    loading: pelimpahanLoading,
    error: pelimpahanError,
    setSearchBy: setPelimpahanSearchBy,
    setQ: setPelimpahanQ,
  } = useReportPelimpahan({
    page: 1,
    limit: 1000000,
    sort: "period",
    order: "desc",
    searchBy: "period",
    q: selectedPeriod || undefined,
  });

  useEffect(() => {
    if (!selectedPeriod) return;
    setPelimpahanSearchBy("period");
    setPelimpahanQ(selectedPeriod);
  }, [selectedPeriod]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeStats = useMemo(() => aggregateStats(items), [items]);

  const isLoading =
    periodLoading || loading || paymentMethodLoading || allMonthlyLoading;

  const topMerchants = useMemo<TopMerchantItem[]>(() => {
    const merchantMap = new Map<
      string,
      { name: string; transactions: number; amount: number, status: string }
    >();

    items
      .filter((item) => item.status?.toLowerCase().trim() === "paid")
      .forEach((item) => {
        const key = item.merchantId || "UNKNOWN";

        if (!merchantMap.has(key)) {
          merchantMap.set(key, {
            name: item.merchantDesc || key,
            transactions: 1,
            amount: Number(item.total || 0),
            status: item.status || "UNKNOWN",
          });
        } else {
          const existing = merchantMap.get(key)!;
          existing.transactions += 1;
          existing.amount += Number(item.total || 0);
        }
      });

    return [...merchantMap.values()]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [items]);

  const pieChartData = useMemo(
    () => [
      { name: "Paid", value: activeStats.totalPaid, color: "#10b981" },
      { name: "Pending", value: activeStats.pendingPaid, color: "#f59e0b" },
      { name: "Failed", value: activeStats.failedPaid, color: "#ef4444" },
    ],
    [activeStats]
  );

  const monthlyTransactions = useMemo(() => {
    const periodMap = new Map<string, number>();

    allMonthlyItems
      .filter((item) => item.status?.toLowerCase().trim() === "paid")
      .forEach((item) => {
        const period = String(item.period);
        const amount = Number(item.total || 0);
        periodMap.set(period, (periodMap.get(period) ?? 0) + amount);
      });

    return [...periodMap.entries()]
      .map(([period, amount]) => ({
        month: formatPeriodLabel(Number(period)),
        amount,
        _period: period,
      }))
      .sort((a, b) => Number(a._period) - Number(b._period))
      .map(({ month, amount }) => ({ month, amount }));
  }, [allMonthlyItems]);

  const paymentMethods = useMemo<PaymentMethodItem[]>(() => {
    const grouped = new Map<
      string,
      { method: string; count: number; total: number }
    >();

    paymentMethodItems
      .filter((item) => item.externalStatus?.toLowerCase().trim() === "paid")
      .forEach((item) => {
        const total = Number(item.total || 0);
        const key = item.paymentCode;
        const existing = grouped.get(key);

        if (existing) {
          existing.count += 1;
          existing.total += total;
        } else {
          grouped.set(key, {
            method: `${item.bank} ${item.category}`,
            count: 1,
            total,
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

  const isInitialLoading = loading || paymentMethodLoading || periodLoading;
  const hasError = error || paymentMethodError || periodError;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">
            Dashboard Summary
          </h1>
          <p className="text-slate-600">
            Overview of your transactions and performance metrics
          </p>
        </div>

        {hasError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || paymentMethodError || periodError}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none rounded-lg border bg-white py-2 pl-4 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={periodLoading || monthOptions.length === 0}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <StatsOverview
          stats={{
            ...activeStats,
            margin: activeStats.margin,
          }}
          formatCurrency={formatCurrency}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TransactionStatusPie data={pieChartData} />

          {paymentMethodLoading && !paymentMethods.length ? (
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

        <TransactionStatusCards stats={activeStats} />

        <PelimpahanSummary
          data={pelimpahanItems}
          loading={pelimpahanLoading}
          error={pelimpahanError}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {topMerchants.length > 0 ? (
            <TopMerchantsList
              data={topMerchants}
              formatCurrency={formatCurrency}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
              Top merchant data is not available yet.
            </div>
          )}

          {monthlyTransactions.length > 0 ? (
            <MonthlyTransactionList
              data={monthlyTransactions}
              formatCurrency={formatCurrency}
            />
          ) : isInitialLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
              Loading monthly transaction data...
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg">
              Monthly transaction data is not available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}