import { useEffect, useState } from "react";
import type { Transaction } from "../request-settlement-content";
import { fmt, fmtDatetime } from "../request-settlement-content";
import { Pagination } from "./Pagination";
import { RegionDetailedModel } from "../../../../data/models/RegionModel";
import { TransactionDLFilterBy } from "../../../../data/models/TransactionDetailListModel";

type DateTimeFilter = {
    fromDate: string; fromTime: string;
    toDate: string; toTime: string;
};

type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
} | null;

const toDate = (dateStr: string): Date => new Date(dateStr.replace(" ", "T"));
const displayDate = (dateStr: string): string => fmtDatetime(dateStr);

export function TarikSaldoModal({
    balance,
    transactions = [],
    txPagination,
    txPage,
    loadingTransactions = false,
    onTxPageChange,
    onFilterChange,
    onRegionFilterChange,
    onClose,
    onSubmit,
    loading,
    merchantName,
    regionData,
    bankName,
    bankNoRek,
}: {
    balance: number | null;
    transactions?: Transaction[];
    txPagination?: PaginationInfo;
    txPage?: number;
    loadingTransactions?: boolean;
    onTxPageChange?: (page: number) => void;
    onFilterChange?: (from: string, to: string) => void;
    onRegionFilterChange?: (filterBy: TransactionDLFilterBy | undefined, id: string | undefined) => void;
    onClose: () => void;
    onSubmit: (selectedIds: string[], totalAmount: number, regionUid: string, isMerchant: "Y" | "N") => void;
    loading: boolean;
    merchantName?: string;
    regionData?: RegionDetailedModel[];
    bankName?: string;
    bankNoRek?: string;
}) {
    const firstRegion = regionData?.[0] ?? null;

    const [selectedMap, setSelectedMap] = useState<Map<string, Transaction>>(new Map());
    const [dateFilter, setDateFilter] = useState<DateTimeFilter>({
        fromDate: "", fromTime: "00:00:00",
        toDate: "", toTime: "23:59:59",
    });
    const [selectedRegionId, setSelectedRegionId] = useState<string>(firstRegion?.regionId ?? "");
    const [selectedRegion, setSelectedRegion] = useState<RegionDetailedModel | null>(firstRegion);
    const [sendTo, setSendTo] = useState<"Y" | "N">("Y");
    const [step, setStep] = useState<"form" | "confirm">("form");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [confirmPage, setConfirmPage] = useState(1);
    const CONFIRM_PAGE_SIZE = 5;


    useEffect(() => {
        if (firstRegion?.regionId) {
            onRegionFilterChange?.("regionId", firstRegion.regionId);
        }

    }, []);

    const now = new Date();
    const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isToday = (tx: Transaction): boolean => {
        const d = toDate(tx.date);
        return d >= todayStart && d < new Date(todayStart.getTime() + 86400000);
    };

    const selectableTxOnPage = transactions.filter((tx) => !isToday(tx));
    const selectedTx = Array.from(selectedMap.values());
    const totalAmount = selectedTx.reduce((s, tx) => s + tx.nettProfit, 0);
    const allCheckedOnPage = selectableTxOnPage.length > 0 && selectableTxOnPage.every((tx) => selectedMap.has(tx.id));
    const confirmTotalPages = Math.ceil(selectedTx.length / CONFIRM_PAGE_SIZE);
    const pagedSelectedTx = selectedTx.slice((confirmPage - 1) * CONFIRM_PAGE_SIZE, confirmPage * CONFIRM_PAGE_SIZE);


    const activeBankName = selectedRegion?.bankName;
    const activeBankNoRek = selectedRegion?.bankNoRek;

    const hasMerchantAccount = Boolean(bankName || bankNoRek);
    const hasRegionAccount = Boolean(activeBankName || activeBankNoRek);

    const effectiveSendTo: "Y" | "N" =
        sendTo === "Y" && !hasMerchantAccount && hasRegionAccount
            ? "N"
            : sendTo === "N" && !hasRegionAccount && hasMerchantAccount
              ? "Y"
              : sendTo;

    const hasRegionData = Array.isArray(regionData) && regionData.length > 0;
    const hasActiveFilter = dateFilter.fromDate || dateFilter.toDate;
    const hasTodayInList = transactions.some((tx) => isToday(tx));







    const clearFilter = () => {
        setDateFilter({ fromDate: "", fromTime: "00:00:00", toDate: "", toTime: "23:59:59" });
        onFilterChange?.("", "");
    };

    const handleRegionChange = (regionId: string) => {
        setSelectedRegionId(regionId);
        const region = regionData?.find((r) => r.regionId === regionId) ?? null;
        setSelectedRegion(region);
        onRegionFilterChange?.("regionId", regionId);
    };

    const handleContinue = () => {
        setConfirmPage(1);
        setStep("confirm");
    };

    const toggleTx = (tx: Transaction, checked: boolean) => {
        setSelectedMap((prev) => {
            const next = new Map(prev);

            checked ? next.set(tx.id, tx) : next.delete(tx.id);
            return next;
        });
    };

    const toggleAll = (checked: boolean) => {
        setSelectedMap((prev) => {
            const next = new Map(prev);
            selectableTxOnPage.forEach((tx) => (checked ? next.set(tx.id, tx) : next.delete(tx.id)));
            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {step === "form" ? "Withdraw Balance" : "Confirm Withdrawal"}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {step === "form"
                                ? "Select transactions to disburse"
                                : "Please review the details before proceeding"}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {step === "form" ? (
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                        {/* Available Balance */}
                        {balance !== null && (
                            <div className="rounded-xl bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-500">Available Balance</p>
                                <p className="text-xl font-bold text-slate-800">{fmt(balance)}</p>
                            </div>
                        )}

                        {/* Filter by Region */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">Region/Abww</label>
                            {hasRegionData ? (
                                <select
                                    value={selectedRegionId}
                                    onChange={(e) => handleRegionChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 py-2 px-2.5 text-xs text-gray-700 bg-white"
                                >
                                    {regionData!.map((r) => (
                                        <option key={r.regionUid} value={r.regionId}>
                                            {r.regionId} – {r.regionDesc}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                                    No region data available
                                </div>
                            )}
                        </div>

                        {/* Datetime range filter */}
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                            {/* Trigger */}
                            <button
                                onClick={() => setIsFilterOpen((prev) => !prev)}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-500">Filter by date & time</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isFilterOpen && hasActiveFilter && (
                                        <span className="text-[11px] text-blue-500 bg-blue-50 rounded-full px-2 py-0.5">Active</span>
                                    )}
                                    <svg
                                        className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {isFilterOpen && (
                                <div className="border-t border-gray-100 px-3 pt-3 pb-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">                                            {hasActiveFilter && (
                                            <button
                                                onClick={clearFilter}
                                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Clear
                                            </button>
                                        )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            {/* FROM */}
                                            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    From
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.fromDate}
                                                        max={dateFilter.toDate || undefined}
                                                        onChange={(e) => {
                                                            const next = { ...dateFilter, fromDate: e.target.value };
                                                            setDateFilter(next);
                                                            if (next.fromDate) onFilterChange?.(
                                                                `${next.fromDate}T${next.fromTime}`,
                                                                next.toDate ? `${next.toDate}T${next.toTime}` : ""
                                                            );
                                                        }}
                                                        className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                                                    />
                                                </div>
                                                <div className="h-px bg-gray-100" />
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <input
                                                        type="time"
                                                        step="1"
                                                        value={dateFilter.fromTime}
                                                        onChange={(e) => {
                                                            const next = { ...dateFilter, fromTime: e.target.value };
                                                            setDateFilter(next);
                                                            if (next.fromDate) onFilterChange?.(
                                                                `${next.fromDate}T${next.fromTime}`,
                                                                next.toDate ? `${next.toDate}T${next.toTime}` : ""
                                                            );
                                                        }}
                                                        className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* TO */}
                                            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    To
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.toDate}
                                                        min={dateFilter.fromDate || undefined}
                                                        onChange={(e) => {
                                                            const next = { ...dateFilter, toDate: e.target.value };
                                                            setDateFilter(next);
                                                            if (next.toDate) onFilterChange?.(
                                                                next.fromDate ? `${next.fromDate}T${next.fromTime}` : "",
                                                                `${next.toDate}T${next.toTime}`
                                                            );
                                                        }}
                                                        className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                                                    />
                                                </div>
                                                <div className="h-px bg-gray-100" />
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <input
                                                        type="time"
                                                        step="1"
                                                        value={dateFilter.toTime}
                                                        onChange={(e) => {
                                                            const next = { ...dateFilter, toTime: e.target.value };
                                                            setDateFilter(next);
                                                            if (next.toDate) onFilterChange?.(
                                                                next.fromDate ? `${next.fromDate}T${next.fromTime}` : "",
                                                                `${next.toDate}T${next.toTime}`
                                                            );
                                                        }}
                                                        className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Select all */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allCheckedOnPage}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    disabled={selectableTxOnPage.length === 0 || loadingTransactions}
                                    className="h-3.5 w-3.5 disabled:opacity-40"
                                />
                                Select all on this page
                            </label>
                            {hasTodayInList && (
                                <span className="text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-0.5">
                                    Todays transactions cant be selected
                                </span>
                            )}
                        </div>

                        {/* Transaction list */}
                        <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                            {loadingTransactions ? (
                                <div className="py-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Loading transactions...
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="py-6 text-center text-xs text-gray-400">No transactions found</p>
                            ) : (
                                transactions.map((tx) => {
                                    const disabled = isToday(tx);
                                    return (
                                        <label
                                            key={tx.id}
                                            className={`flex items-center gap-3 px-4 py-3 ${disabled
                                                ? "opacity-45 cursor-not-allowed bg-gray-50/60"
                                                : "cursor-pointer hover:bg-slate-50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMap.has(tx.id)}
                                                disabled={disabled}
                                                onChange={(e) => !disabled && toggleTx(tx, e.target.checked)}
                                                className="h-3.5 w-3.5 shrink-0 disabled:cursor-not-allowed"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-800 truncate">
                                                    {tx.number}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[11px] text-gray-400">{displayDate(tx.date)}</p>
                                                    {disabled && (
                                                        <span className="text-[10px] text-amber-500 font-medium">
                                                            • Today
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                className={`text-sm font-semibold shrink-0 ${disabled ? "text-gray-400" : "text-gray-800"}`}
                                            >
                                                {fmt(tx.nettProfit)}
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        {/* Server-side pagination */}
                        {txPagination && txPagination.totalPages > 1 && (
                            <Pagination
                                currentPage={txPage ?? 1}
                                total={txPagination.totalPages}
                                onChange={(p) => onTxPageChange?.(p)}
                            />
                        )}

                        {/* Selected summary */}
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                {selectedMap.size} transaction{selectedMap.size !== 1 ? "s" : ""} selected
                                {selectedMap.size > 0 &&
                                    transactions.filter((tx) => selectedMap.has(tx.id)).length !== selectedMap.size && (
                                        <span className="ml-1 text-blue-500">(includes other pages)</span>
                                    )}
                            </p>
                            <p className="text-sm font-bold text-gray-800">{fmt(totalAmount)}</p>
                        </div>
                        {/* Destination Account */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Destination Account
                            </label>
                            <div className="space-y-2">
                                {/* Merchant option */}
                                <label
                                     className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                         effectiveSendTo === "Y"
                                             ? "border-blue-300 bg-blue-50/50 cursor-pointer"
                                             : hasMerchantAccount
                                               ? "border-gray-200 bg-gray-50 cursor-pointer hover:bg-slate-50"
                                               : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                     }`}
                                 >
                                     <input
                                         type="radio"
                                         name="sendTo"
                                         value="Y"
                                         checked={effectiveSendTo === "Y"}
                                         disabled={!hasMerchantAccount}
                                         onChange={() => setSendTo("Y")}
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-gray-400 mb-0.5">Rekening Merchant</p>
                                        {bankName && (
                                            <div className="text-xs font-medium text-gray-800">{bankName}</div>
                                        )}
                                        {bankNoRek && <div className="text-gray-500 text-xs">{bankNoRek}</div>}
                                        {!hasMerchantAccount && (
                                            <div className="text-[11px] text-amber-500">Belum dikonfigurasi</div>
                                        )}
                                    </div>
                                </label>

                                {/* Region option */}
                                <label
                                     className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                         effectiveSendTo === "N"
                                             ? "border-blue-300 bg-blue-50/50 cursor-pointer"
                                             : hasRegionAccount
                                               ? "border-gray-200 bg-gray-50 cursor-pointer hover:bg-slate-50"
                                               : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                     }`}
                                 >
                                     <input
                                         type="radio"
                                         name="sendTo"
                                         value="N"
                                         checked={effectiveSendTo === "N"}
                                         disabled={!hasRegionAccount}
                                         onChange={() => setSendTo("N")}
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-gray-400 mb-0.5">
                                            Rekening Region ({selectedRegionId})
                                        </p>
                                        {activeBankName && (
                                            <div className="text-xs font-medium text-gray-800">{activeBankName}</div>
                                        )}
                                        {activeBankNoRek && (
                                            <div className="text-gray-500 text-xs">{activeBankNoRek}</div>
                                        )}
                                        {!hasRegionAccount && (
                                            <div className="text-[11px] text-amber-500">Belum dikonfigurasi</div>
                                        )}
                                    </div>
                                </label>

                                {/* Fallback */}
                                {!hasMerchantAccount && !hasRegionAccount && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                                        No bank account configured for this merchant or region.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                            <p className="text-xs text-emerald-600">Total Withdrawal</p>
                            <p className="text-2xl font-bold text-emerald-700">{fmt(totalAmount)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                            {pagedSelectedTx.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between px-4 py-2.5">
                                    <div>
                                        <p className="text-xs font-medium text-gray-800">{tx.number}</p>
                                        <p className="text-[11px] text-gray-400">{displayDate(tx.date)}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600">{fmt(tx.nettProfit)}</span>
                                </div>
                            ))}
                        </div>
                        {confirmTotalPages > 1 && (
                            <Pagination currentPage={confirmPage} total={confirmTotalPages} onChange={setConfirmPage} />
                        )}
                        <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 text-sm">
                            {/* Region Row */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-gray-400">Region</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-700">{selectedRegionId}</span>
                                    {selectedRegion?.regionDesc && (
                                        <>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-xs text-gray-500">{selectedRegion.regionDesc}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Destination Account Row */}
                            <div className="px-4 py-3 space-y-1.5">
                                <span className="text-xs text-gray-400">Destination Account</span>

                                <div className="space-y-1.5 mt-1">
                                    {/* Selected destination account */}
                                    {effectiveSendTo === "Y" && (bankName || bankNoRek) && (
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                                Rekening Merchant
                                            </span>
                                            <div className="text-right">
                                                {bankName && (
                                                    <div className="text-xs font-medium text-gray-700">{bankName}</div>
                                                )}
                                                {bankNoRek && (
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{bankNoRek}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {effectiveSendTo === "N" && (activeBankName || activeBankNoRek) && (
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                                Rekening Region
                                            </span>
                                            <div className="text-right">
                                                {activeBankName && (
                                                    <div className="text-xs font-medium text-gray-700">
                                                        {activeBankName}
                                                    </div>
                                                )}
                                                {activeBankNoRek && (
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        {activeBankNoRek}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Not configured */}
                                    {((effectiveSendTo === "Y" && !bankName && !bankNoRek) ||
                                        (effectiveSendTo === "N" && !activeBankName && !activeBankNoRek)) && (
                                        <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-2">
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-amber-400 shrink-0"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span className="text-xs text-amber-600">Not configured</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2.5 border-t border-gray-100 px-6 py-4 shrink-0">
                    {step === "confirm" && (
                        <button
                            onClick={() => setStep("form")}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    {step === "form" ? (
                        <button
                            onClick={handleContinue}
                            disabled={selectedMap.size === 0 || loadingTransactions}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            Continue
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {loading && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                )}
                                Confirm & Withdraw
                            </button>

                            {/* Dialog konfirmasi */}
                            {showConfirmDialog && (
                                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
                                        {/* Icon */}
                                        <div className="flex justify-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                                                <svg
                                                    className="h-6 w-6 text-amber-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="text-center space-y-1">
                                            <h3 className="text-sm font-semibold text-gray-900">Confirm Withdrawal</h3>
                                            <p className="text-xs text-gray-500">
                                                Are you sure you want to proceed with this withdrawal?
                                            </p>
                                            <p className="text-base font-bold text-gray-800 pt-1">{fmt(totalAmount)}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2.5 pt-1">
                                            <button
                                                onClick={() => setShowConfirmDialog(false)}
                                                disabled={loading}
                                                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowConfirmDialog(false);
                                                    onSubmit(
                                                        Array.from(selectedMap.keys()),
                                                        totalAmount,
                                                        selectedRegion?.regionUid ?? "",
                                                        effectiveSendTo,
                                                    );
                                                }}
                                                disabled={loading}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-60"
                                            >
                                                {loading && (
                                                    <svg
                                                        className="h-4 w-4 animate-spin"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v8z"
                                                        />
                                                    </svg>
                                                )}
                                                Yes, Withdraw
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
