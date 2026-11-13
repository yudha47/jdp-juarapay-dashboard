"use client";

import { useState } from "react";
import { ViewModalSuper } from "./components/ViewModalSuper";
import { useUpdateWithdraw, useWithdraws } from "../../../hooks/useWithdraw";
import { useMerchants } from "../../../hooks/useMerchant";
import { WithdrawModel } from "../../../data/models/WithdrawModel";
import { sendToLabel } from "./request-settlement-content";


export type WithdrawalStatus = "request" | "approved" | "paid";


export const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const fmtDate = (iso: string) => {
    if (!iso) return "-";

    const cleanIso = iso.replace(/Z$|[+-]\d{2}:\d{2}$/, "");

    return new Date(cleanIso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};


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



function ActionModal({
    action,
    record,
    onClose,
    onConfirm,
    loading,
}: {
    action: "approve" | "paid";
    record: WithdrawModel;
    onClose: () => void;
    onConfirm: (withdrawUid: string, file?: File) => void;
    loading: boolean;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const isPaid = action === "paid";
    const canConfirm = !loading && (!isPaid || file !== null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className={`flex items-start gap-4 px-6 py-5 shrink-0 ${isPaid ? "bg-emerald-50" : "bg-blue-50"}`}>
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isPaid ? "bg-emerald-100" : "bg-blue-100"}`}
                    >
                        {isPaid ? (
                            <svg
                                className="h-5 w-5 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className={`text-base font-semibold ${isPaid ? "text-emerald-800" : "text-blue-800"}`}>
                            {isPaid ? "Mark as Paid" : "Approve Withdrawal"}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">{record.merchant.merchantDesc}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="mt-0.5 text-sm font-semibold text-gray-800">{fmt(record.amount)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">Request Time</p>
                            <p className="mt-0.5 text-xs font-semibold text-gray-800">{fmtDate(record.requestTime)}</p>
                        </div>
                    </div>

                    {isPaid && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Bukti Transfer <span className="text-red-500">*</span>
                            </label>
                            {preview && (

                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-40 rounded-xl object-contain border border-gray-100"
                                />
                            )}
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                                <span className="text-xs text-gray-500">
                                    {file ? file.name : "Click to upload image (JPG, PNG, PDF)"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    )}

                    {!isPaid && (
                        <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            Withdrawal status will be changed to <strong>Approved</strong>. Continue?
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => canConfirm && setShowConfirmDialog(true)}
                        disabled={!canConfirm}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                        {isPaid ? "Confirm Paid" : "Confirm Approve"}
                    </button>
                </div>
            </div>

            {/* Dialog konfirmasi */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${isPaid ? "bg-emerald-50" : "bg-blue-50"}`}
                            >
                                <svg
                                    className={`h-6 w-6 ${isPaid ? "text-emerald-500" : "text-blue-500"}`}
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
                            <h3 className="text-sm font-semibold text-gray-900">
                                {isPaid ? "Confirm Mark as Paid" : "Confirm Approve"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {isPaid
                                    ? "Are you sure you want to mark this withdrawal as paid?"
                                    : "Are you sure you want to approve this withdrawal request?"}
                            </p>
                            <p className="text-base font-bold text-gray-800 pt-1">{fmt(record.amount)}</p>
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
                                    onConfirm(record.withdrawUid, file ?? undefined);
                                }}
                                disabled={loading}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60 ${isPaid ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
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
                                {isPaid ? "Yes, Mark as Paid" : "Yes, Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function TableSkeleton({ rows }: { rows: number }) {
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


export default function RequestSettlementSuperContent() {
    const [viewRecord, setViewRecord] = useState<WithdrawModel | null>(null);
    const [actionModal, setActionModal] = useState<{ action: "approve" | "paid"; record: WithdrawModel } | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);


    const [selectedMerchantUid, setSelectedMerchantUid] = useState<string>("");
    const [merchantSearch] = useState<string>("");


    const { items: merchants, loading: loadingMerchants } = useMerchants({
        limit: 1000,
        sort: "createdAt",
        order: "asc",
    });


    const filteredMerchants = merchants.filter((m) => {
        const isMatchSearch = merchantSearch
            ? m.merchantDesc
                ?.toLowerCase()
                .includes(merchantSearch.toLowerCase()) ||
            m.merchantId
                ?.toLowerCase()
                .includes(merchantSearch.toLowerCase())
            : true;

        return isMatchSearch && m.isActive === "Y";
    });


    const {
        items: withdrawals,
        pagination,
        loading,
        error,
        page,
        limit,
        setPage,
        setLimit,
        setSearchBy,
        setQ,
        refetch,
    } = useWithdraws({
        sort: "createdAt",
        order: "desc",
    });


    const { update, loading: actionLoading } = useUpdateWithdraw();

    const totalPages = Math.max(1, pagination ? Math.ceil(pagination.total / limit) : 1);
    const totalEntries = pagination?.total ?? 0;
    const startEntry = totalEntries === 0 ? 0 : (page - 1) * limit + 1;
    const endEntry = Math.min(page * limit, totalEntries);


    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };


    const handleMerchantChange = (uid: string) => {
        setSelectedMerchantUid(uid);
        setSearchBy(uid ? "merchantUid" : undefined);
        setQ(uid);
        setPage(1);
    };


    const handleAction = async (withdrawUid: string, file?: File) => {
        if (!actionModal) return;
        const isPaid = actionModal.action === "paid";

        const now = new Date();

        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const parts = formatter.formatToParts(now);

        const get = (type: string) => parts.find((p) => p.type === type)?.value || "";

        const settlementDate = `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
        try {
            await update(withdrawUid, {
                file: isPaid ? file : undefined,
                settlementDate: isPaid ? settlementDate : "",
                status: isPaid ? "paid" : "approved",
                isMerchant: actionModal.record.isMerchant || "N",
            });

            setActionModal(null);
            showToast("success", `Withdrawal berhasil diubah ke status ${isPaid ? "Paid" : "Approved"}.`);
            refetch();
        } catch (e) {
            showToast("error", (e as Error)?.message ?? "Gagal mengubah status withdrawal.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
                    <p className="mt-2 text-slate-600">Manage and review withdrawal requests from merchants</p>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${toast.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-700"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <svg
                                className="h-5 w-5 shrink-0 text-emerald-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5 shrink-0 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                                />
                            </svg>
                        )}
                        {toast.message}
                    </div>
                )}

                {/* Error list fetch */}
                {error && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <svg
                            className="h-5 w-5 shrink-0 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Toolbar */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>

                    {/* Merchant filter dropdown */}
                    <div className="relative min-w-64">
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 disabled:opacity-60"
                            value={selectedMerchantUid}
                            onChange={(e) => handleMerchantChange(e.target.value)}
                            disabled={loadingMerchants}
                        >
                            <option value="">{loadingMerchants ? "Loading merchants…" : "All Merchants"}</option>
                            {filteredMerchants.map((m) => (
                                <option key={m.merchantUid} value={m.merchantUid}>
                                    {m.merchantDesc} ({m.merchantId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear filter button */}
                    {selectedMerchantUid && (
                        <button
                            onClick={() => handleMerchantChange("")}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear Filter
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-4 py-3 text-left">No</th>
                                    <th className="px-4 py-3 text-left">Merchant</th>
                                    <th className="px-4 py-3 text-left">Region</th>
                                    <th className="px-4 py-3 text-left">Request Time</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">SEND TO</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <TableSkeleton rows={limit} />
                                        </td>
                                    </tr>
                                ) : withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                                            No withdrawal requests found
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((row, idx) => (
                                        <tr key={row.withdrawUid} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-xs text-gray-400">
                                                {(page - 1) * limit + idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {row.merchant.merchantDesc}
                                                </p>
                                                <p className="text-xs text-gray-400">{row.merchant.merchantId}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {row.region.regionDesc}
                                                </p>
                                                <p className="text-xs text-gray-400">{row.region.regionId}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {fmtDate(row.requestTime)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap text-sm">
                                                {fmt(row.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                                {sendToLabel(row.isMerchant)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setViewRecord(row)}
                                                        className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                    {row.status === "request" && (
                                                        <button
                                                            onClick={() =>
                                                                setActionModal({ action: "approve", record: row })
                                                            }
                                                            className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {row.status === "approved" && (
                                                        <button
                                                            onClick={() =>
                                                                setActionModal({ action: "paid", record: row })
                                                            }
                                                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                        <p className="text-xs text-gray-500">
                            {totalEntries === 0 ? "0 entries" : `${startEntry}–${endEntry} of ${totalEntries}`}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                ‹ Previous
                            </button>
                            <span className="px-3 text-xs text-gray-600">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewRecord && <ViewModalSuper record={viewRecord} onClose={() => setViewRecord(null)} />}

            {actionModal && (
                <ActionModal
                    action={actionModal.action}
                    record={actionModal.record}
                    onClose={() => setActionModal(null)}
                    onConfirm={handleAction}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}
