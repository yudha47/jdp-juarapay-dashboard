"use client";

import { useTransactionDetailList, useTransactionReport } from "@/hooks/useTransaction";
import { TransactionDetailTable } from "./transaction-detail-table";
import { TransactionDetail } from "@/data/models/TransactionDetailListModel";
import { useState } from "react";
import { DetailTransactionDLDrawer } from "./components/DetailDrawer";
import { getLoggedInRole } from "@/lib/auth";
import { ExportTransactionReportModal } from "../transaction-list/components/ExportTransactionModal";
import { exportToExcel } from "@/utils/exportToExcel";

const calculateFee = (row: TransactionDetail): string => {
    const amount = row.amountTotal ?? 0;

    const feeRaw = row.fee?.fee ?? 0;
    const feeIsPercent = row.fee?.isPercentage === "Y";
    const feeActual = feeIsPercent ? (feeRaw / 100) * amount : feeRaw;

    const priceRaw = row.price?.price ?? null;
    if (priceRaw === null) {
        return feeActual.toFixed(2);
    }

    const priceIsPercent = row.price?.isPercentage === "Y";
    const priceActual = priceIsPercent ? (priceRaw / 100) * amount : priceRaw;

    return (feeActual + priceActual).toFixed(2);
};

export default function ReportTransactionPage() {
    const role = getLoggedInRole();
    const {
        fetchReport,
        loading: reportLoading,
    } = useTransactionReport(
        {
            page: 1,
            limit: 1000,
            sort: "createdAt",
            order: "desc",
            searchBy: "createdAt",
        },
        { manual: true }
    );

    const {
        items,
        pagination,
        loading,
        page,
        limit,
        sort,
        order,
        searchBy,
        setSearchBy,
        setPage,
        setLimit,
        setSort,
        setOrder,
        setQ,
    } = useTransactionDetailList({
        page: 1, limit: 10,
        sort: "createdAt",
        order: "desc",
        searchBy: "transactionNumber",
    });

    const tablePagination = pagination
        ? {
            page: (pagination.page ?? 1) - 1,
            totalPages: pagination.totalPages ?? 1,
            limit: pagination.limit ?? limit,
        }
        : { page: page - 1, totalPages: 1, limit: limit };

    const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);

    const handleDetailClick = (row: TransactionDetail) => {
        setSelectedTransaction(row);
        setOpenDetailDrawer(true);
    };

    const [openExportModal, setOpenExportModal] = useState(false);
    const [exportModalKey, setExportModalKey] = useState(0);

    const handleOpenExportModal = () => {
        setExportModalKey((prev) => prev + 1);
        setOpenExportModal(true);
    };

    const handleExportReport = async ({ searchBy, q, endDate }: {
        searchBy: "paymentDate" | "transactionDate" | "createdAt";
        q: string;
        endDate: string;
    }) => {
        try {
            const res = await fetchReport({ page: 1, limit: 10000000, sort: "createdAt", order: "desc", searchBy, q, endDate });
            const rows = res.data ?? [];

            const roleDesc = role?.roleDesc;
            const isSuperAdmin = roleDesc === "Super Admin" || roleDesc === "Finance";
            const isAdmin = roleDesc === "Admin" || roleDesc === "Headquarter";
            const isRegion = roleDesc === "Region";
            // isMerchant = fallback

            // --- Definisi kolom per role ---
            type Col = { header: string; value: (row: typeof rows[0]) => string };

            const colTransactionNumber: Col = { header: "Transaction Number", value: r => r.transactionNumber ?? "" };
            const colExternalTrxId: Col = { header: "External Trx ID", value: r => r.externalTrxId ?? "" };
            const colTypeTrx: Col = { header: "Type", value: r => r.typeTrx ?? "" };
            const colMerchantId: Col = { header: "Merchant ID", value: r => r.merchantId ?? "" };
            const colRegionId: Col = { header: "Region ID", value: r => r.regionId ?? "" };
            const colSubMerchantId: Col = { header: "Sub-merchant ID", value: r => r.subMerchantId ?? "" };
            const colTransactionDate: Col = { header: "Transaction Date", value: r => r.transactionDate ?? "" };
            const colPaymentDate: Col = { header: "Payment Date", value: r => r.paymentDate ?? "" };
            const colCreatedAt: Col = { header: "Created At", value: r => r.createdAt ?? "" };
            const colTransactionExp: Col = { header: "Transaction Exp", value: r => r.transactionExp ?? "" };
            const colPaymentCode: Col = { header: "Payment Code", value: r => r.paymentCode ?? "" };
            const colPgDesc: Col = { header: "Payment Gateway", value: r => r.pgDesc ?? "" };
            const colExtPaymentCode: Col = { header: "Ext Payment Code", value: r => r.extPaymentCode ?? "" };
            const colVaNumber: Col = { header: "VA Number", value: r => r.vaNumber ?? "" };
            const colAmountTotal: Col = { header: "Amount Total", value: r => String(r.amountTotal ?? "") };
            const colPrice: Col = { header: "Price", value: r => r.price?.price != null ? String(r.price.price) : "" };
            const colFeeRaw: Col = { header: "Fee", value: r => r.fee?.fee != null ? String(r.fee.fee) : "" };
            const colFeeMerged: Col = { header: "Fee", value: r => calculateFee(r) };
            const colNettProfit: Col = { header: "Nett Profit", value: r => r.nettProfit != null ? String(r.nettProfit) : "" };
            const colStatus: Col = { header: "Status", value: r => r.status ?? "" };
            const colExtStatus: Col = { header: "Ext Status", value: r => r.extStatus ?? "" };
            const colPaymentNtb: Col = { header: "Payment NTB", value: r => r.paymentNtb ?? "" };

            // Kolom yang sama untuk semua role
            const baseColumns: Col[] = [
                colTransactionNumber,
                colExternalTrxId,
                colTypeTrx,
                colTransactionDate,
                colPaymentDate,
                colCreatedAt,
                colPaymentCode,
                colPgDesc,
                colExtPaymentCode,
                colVaNumber,
                colAmountTotal,
                colStatus,
            ];

            let columns: Col[];

            if (isSuperAdmin) {
                columns = [
                    ...baseColumns,
                    colMerchantId,
                    colRegionId,
                    colSubMerchantId,
                    colTransactionExp,
                    colPrice,       // dipisah
                    colFeeRaw,      // dipisah
                    colNettProfit,
                    colExtStatus,
                    colPaymentNtb,
                ];
            } else if (isAdmin) {
                columns = [
                    ...baseColumns,
                    colMerchantId,
                    colRegionId,
                    colSubMerchantId,
                    colTransactionExp,
                    colFeeMerged,   // digabung
                    colExtStatus,
                    colPaymentNtb,
                ];
            } else if (isRegion) {
                columns = [
                    ...baseColumns,
                    colRegionId,
                    colSubMerchantId,
                    colFeeMerged,   // digabung
                    colPaymentNtb,
                ];
            } else {
                // Merchant
                columns = [
                    ...baseColumns,
                    colSubMerchantId,
                    colFeeMerged,   // digabung
                ];
            }

            // --- Build Excel ---
            exportToExcel({
                rows,
                columns,
                fileName: `transaction-report-${q}-${endDate}`,
            });
            setOpenExportModal(false);

        } catch (error) {
            console.error(error);
            alert((error as Error)?.message ?? "Failed to export report");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Report All Transactions</h1>
                    <p className="mt-2 text-slate-600">View and analyze all transactions</p>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>

                    <button
                        onClick={handleOpenExportModal}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Export Report
                    </button>

                    {loading && <span className="text-sm text-gray-500">Loading...</span>}
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <TransactionDetailTable
                        data={items}
                        pagination={tablePagination}
                        params={{ page, sort, order, searchBy }}
                        onParamsChange={({ page, sort, order, searchBy, q }) => {
                            if (page !== undefined) setPage(page);
                            if (sort) setSort(sort);
                            if (order) setOrder(order);
                            if (searchBy) setSearchBy(searchBy);
                            if (q !== undefined) setQ(q);
                        }}
                        onDetailClick={handleDetailClick}
                    />
                </div>
            </div>

            {/* Detail Drawer */}
            {openDetailDrawer && selectedTransaction && (
                <DetailTransactionDLDrawer
                    onClose={() => setOpenDetailDrawer(false)}
                    data={selectedTransaction ?? undefined}
                />
            )}
            <ExportTransactionReportModal
                key={exportModalKey}
                open={openExportModal}
                loading={reportLoading}
                onClose={() => setOpenExportModal(false)}
                onSubmit={handleExportReport}
            />
        </div>
    );
}