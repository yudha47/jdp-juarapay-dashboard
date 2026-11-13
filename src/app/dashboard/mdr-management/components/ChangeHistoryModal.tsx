import React from "react";

export interface ChangeHistory {
    id: string;
    merchantId: string;
    merchantName: string;
    category: string;
    method: string;
    oldValue: number;
    newValue: number;
    isPercentage: boolean;
    changedBy: string;
    changedAt: string;
    changeType: "Price" | "PGFee" | "margin";
}

interface ChangeHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeHistory: ChangeHistory[];
}

export default function ChangeHistoryModal({ isOpen, onClose, changeHistory }: ChangeHistoryModalProps) {
    if (!isOpen) return null;

    // Format currency untuk Rupiah
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 20,
        }).format(value);
    };

    // Format persentase
    const formatPercentage = (value: number): string => {
        return `${value.toFixed(2)}%`;
    };

    // Format value untuk history
    const formatHistoryValue = (value: number, isPercentage: boolean): string => {
        return isPercentage ? formatPercentage(value) : formatCurrency(value);
    };

    // Format tanggal
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Get change type label
    const getChangeTypeLabel = (type: string): string => {
        const labels = {
            AppFee: "Application Fee",
            PGFee: "PG Fee",
            MDRTotal: "MDR Total",
        };
        return labels[type as keyof typeof labels] || type;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-100 p-2">
                                <svg
                                    className="h-6 w-6 text-amber-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Change History</h2>
                                <p className="text-sm text-gray-500">{changeHistory.length} total changes recorded</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Modal Body */}
                <div className="overflow-y-auto p-3 pb-16" style={{ maxHeight: "calc(90vh - 80px)" }}>
                    <div className="space-y-4">
                        {changeHistory.map((history, index) => (
                            <div
                                key={history.id}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-2 transition-all duration-200 hover:border-amber-300 hover:shadow-md"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-amber-400 to-amber-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                    {/* Left Section - Merchant Info */}
                                    <div className="lg:col-span-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-700">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {history.merchantName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{history.merchantId}</p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        {history.category}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                                                        {history.method}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section - Change Details */}
                                    <div className="lg:col-span-5">
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                                    {getChangeTypeLabel(history.changeType)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-gray-500">Previous Value</p>
                                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                                        {formatHistoryValue(history.oldValue, history.isPercentage)}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-gray-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-gray-500">New Value</p>
                                                    <p className="mt-1 text-sm font-semibold text-green-600">
                                                        {formatHistoryValue(history.newValue, history.isPercentage)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - User & Time Info */}
                                    <div className="lg:col-span-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="h-4 w-4 shrink-0 text-gray-400"
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
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-500">Changed by</p>
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {history.changedBy}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="h-4 w-4 shrink-0 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-500">Date & Time</p>
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {formatDate(history.changedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
