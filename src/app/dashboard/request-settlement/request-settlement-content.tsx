"use client";

import { useState, useEffect } from "react";
import { BalanceCard } from "./components/BalanceCard";
import { WithdrawalTable } from "./components/WithdrawalTable";
import { TarikSaldoModal } from "./components/TarikSaldoModal";
import { ViewModal } from "./components/ViewModal";
import { WithdrawModel } from "../../../data/models/WithdrawModel";
import { useWithdraws, useWithdrawSaldo, useCreateWithdraw } from "../../../hooks/useWithdraw";
import { useUser } from "../../../hooks/useUsers";
import { useMerchant } from "../../../hooks/useMerchant";
import { getLoggedInUser } from "../../../lib/auth";
import { useTransactionDetailList } from "../../../hooks/useTransaction";
import { RegionDetailedModel } from "../../../data/models/RegionModel";
import { TransactionDLFilterBy } from "../../../data/models/TransactionDetailListModel";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaldoWithdrawable {
    availableBalance: number;
}

export interface TransactionApiItem {
    transactionUid: string;
    transactionNumber: string;
    transactionDate: string;
    paymentCode: string;
    status: string;
    nettProfit: number;
}

export interface TransactionApiResponse {
    status: number;
    data: TransactionApiItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    trxId: string;
}

export interface Transaction {
    id: string;
    number: string;
    date: string;
    paymentCode: string;
    status: string;
    nettProfit: number;
}

export function mapApiTransactions(res: TransactionApiResponse): Transaction[] {
    return res.data.map((item) => ({
        id: item.transactionUid,
        number: item.transactionNumber,
        date: item.transactionDate,
        paymentCode: item.paymentCode,
        status: item.status,
        nettProfit: item.nettProfit,
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const fmtDatetime = (dateStr: string) => {
    if (!dateStr) return "-";

    const cleanStr = dateStr.replace("Z", "");
    const date = new Date(cleanStr);

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export type WithdrawalStatus = "request" | "approved" | "paid";

export const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; className: string }> = {
    request: { label: "Request", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Approved", className: "bg-blue-50 text-blue-700 border-blue-200" },
    paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status as WithdrawalStatus] ?? STATUS_CONFIG["request"];
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
};

export const sendToLabel = (isMerchant?: string): string => {
    if (isMerchant === "Y") return "Rekening Merchant";
    if (isMerchant === "N") return "Rekening Region";
    return "—";
};

// ─── Page Loading ─────────────────────────────────────────────────────────────

function PageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

// ─── Inner Content ────────────────────────────────────────────────────────────

function WithdrawalContent({
    merchantUid,
    merchant,
    regionData,
    saldoWithdrawable,
    refectSaldo,
}: {
    merchantUid: string;
    merchant: { danaTalang: string; bankName?: string; bankNoRek?: string; merchantDesc?: string; merchantId?: string } | null;
    regionData: RegionDetailedModel[];
    saldoWithdrawable: SaldoWithdrawable | null;
    setSaldoWithdrawable: React.Dispatch<React.SetStateAction<SaldoWithdrawable | null>>;
    refectSaldo: () => void;
}) {
    const [showTarikModal, setShowTarikModal] = useState(false);
    const [viewRecord, setViewRecord] = useState<WithdrawModel | null>(null);
    const [successBanner, setSuccessBanner] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { create: createWithdraw, loading: submitting } = useCreateWithdraw();

    const {
        items: withdrawals,
        pagination,
        loading: loadingWithdrawals,
        error: withdrawalError,
        page,
        limit,
        setPage,
        setLimit,
        refetch: refetchWithdrawals,
    } = useWithdraws({ searchBy: "merchantUid", q: merchantUid, sort: "createdAt" });

    const {
        items: txItems,
        pagination: txPagination,
        loading: loadingTx,
        setPage: setTxPage,
        setQ: setTxStartDate,
        setSearchBy: setTxSearchBy,
        setLimit: setTxLimit,
        refetch: refetchTx,
        page: txPage,
        setEndDate: setTxEndDate,
        setFilterBy: setTxFilterBy,
        setId: setTxId,
    } = useTransactionDetailList({
        limit: 10,
        sort: "createdAt",
        order: "desc",
        merchantId: merchant?.merchantId ?? undefined,
        isWithdraw: "Y",
    });

    const transactions: Transaction[] = txItems.map((item) => ({
        id: item.transactionUid,
        number: item.transactionNumber,
        date: item.transactionDate,
        paymentCode: item.paymentCode,
        status: item.status,
        nettProfit: item.nettProfit,
    }));

    const handleOpenModal = () => {
        refetchTx();
        setShowTarikModal(true);
    };

    const handleTxRegionFilterChange = (filterBy: TransactionDLFilterBy | undefined, id: string | undefined) => {
        setTxFilterBy(filterBy);
        setTxId(id ?? "");
    };

    const handleTxFilterChange = (from: string, to: string) => {
        const hasFilter = from || to;
        if (hasFilter) {
            setTxLimit(10);
            setTxSearchBy("transactionDate");
            setTxStartDate(from ? from.replace("T", " ") + ":00" : "");
            setTxEndDate(to ? to.replace("T", " ") + ":00" : "");
            setTxPage(1);
        } else {
            setTxLimit(10);
            setTxSearchBy("transactionNumber");
            setTxStartDate("");
            setTxEndDate("");
            setTxPage(1);
        }
    };

    const handleSubmit = async (selectedIds: string[], totalAmount: number, regionUid: string, isMerchant: "Y" | "N") => {
        setSubmitError(null);
        try {
            await createWithdraw({
                amount: totalAmount,
                merchantUid,
                regionUid,
                isMerchant,
                trxIds: selectedIds.map((id) => ({ transactionUid: id })),
            });
            setShowTarikModal(false);
            setSuccessBanner(true);
            refetchWithdrawals();
            refectSaldo();
            setTimeout(() => setSuccessBanner(false), 4000);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Withdrawal failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Withdrawal</h1>
                    <p className="text-slate-600">Withdraw your balance</p>
                </div>

                {successBanner && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                        <svg
                            className="h-4 w-4 text-emerald-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Withdrawal request submitted successfully. Status will be updated after verification.
                    </div>
                )}

                {submitError && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                        <svg
                            className="h-4 w-4 text-red-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        {submitError}
                    </div>
                )}

                <div className="bg-gray-50 rounded-2xl">
                    <div className="flex gap-6 items-start">
                        <BalanceCard saldoWithdrawable={saldoWithdrawable} onWithdraw={handleOpenModal} />
                        <WithdrawalTable
                            withdrawals={withdrawals}
                            loading={loadingWithdrawals}
                            error={withdrawalError}
                            pagination={pagination}
                            page={page}
                            limit={limit}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                            onView={setViewRecord}
                        />
                    </div>
                </div>
            </div>

            {showTarikModal && (
                <TarikSaldoModal
                    balance={saldoWithdrawable?.availableBalance ?? null}
                    transactions={transactions}
                    txPagination={txPagination}
                    txPage={txPage}
                    loadingTransactions={loadingTx}
                    onTxPageChange={setTxPage}
                    onFilterChange={handleTxFilterChange}
                    onRegionFilterChange={handleTxRegionFilterChange}
                    onClose={() => setShowTarikModal(false)}
                    onSubmit={handleSubmit}
                    loading={submitting}
                    merchantName={merchant?.merchantDesc}
                    regionData={regionData}
                    bankName={merchant?.bankName}
                    bankNoRek={merchant?.bankNoRek}
                />
            )}
            {viewRecord && <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestSettlementContent() {
    const [saldoWithdrawable, setSaldoWithdrawable] = useState<SaldoWithdrawable | null>(null);

    const userLog = getLoggedInUser();
    const { data: userData, loading: loadingUser } = useUser(userLog?.userUid);
    const merchantUid = userData?.merchantUid;
    const { data: merchant, loading: loadingMerchant } = useMerchant(merchantUid ?? "");
    const { data: saldo, loading: loadingSaldo, refetch: refectSaldo } = useWithdrawSaldo();

    useEffect(() => {
        if (saldo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSaldoWithdrawable({
                availableBalance: Number(saldo),
            });
        }
    }, [saldo]);

    const isPageLoading = loadingUser || loadingMerchant || loadingSaldo || !merchantUid;
    if (isPageLoading) return <PageLoading />;

    return (
        <WithdrawalContent
            merchantUid={merchantUid}
            merchant={merchant}
            regionData={merchant?.region ?? []}
            saldoWithdrawable={saldoWithdrawable}
            setSaldoWithdrawable={setSaldoWithdrawable}
            refectSaldo={refectSaldo}
        />
    );
}
