import React from "react";
import { PriceDetailModel } from "../../../../../data/models/PriceModel";
import { PaymentMethodModel } from "../../../../../data/models/PaymentMethodModel";

interface PriceDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    data: PriceDetailModel | null;
    loading?: boolean;
    paymentMethodMap: Record<string, PaymentMethodModel>;
}

function SkeletonLine({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) {
    return <div className={`${width} ${height} animate-pulse rounded-md bg-slate-200`} />;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-800">{value ?? "—"}</span>
        </div>
    );
}

export default function PriceDetailPanel({ isOpen, onClose, data, loading, paymentMethodMap }: PriceDetailPanelProps) {
    const pm = data?.paymentMethodUid ? paymentMethodMap[data.paymentMethodUid] : null;

    const formatDate = (dateStr: string): string => {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!match) return dateStr;

        const [, year, month, day, hour, minute, second] = match;
        return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
    };

    const formatPrice = (price: number, isPercentage: "Y" | "N") =>
        isPercentage === "Y"
            ? `${price}%`
            : new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }).format(price);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? "backdrop-blur-sm bg-black/20 pointer-events-auto" : "pointer-events-none opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-primary px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Detail Price</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-5 p-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                    <SkeletonLine width="w-24" height="h-3" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, j) => (
                                            <div key={j} className="space-y-2">
                                                <SkeletonLine width="w-16" height="h-2" />
                                                <SkeletonLine width="w-full" height="h-4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : data ? (
                        <div className="space-y-4 p-6">
                            {/* ── Status Badge ── */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                    Status
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${data.isActive === "Y"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${data.isActive === "Y" ? "bg-green-500" : "bg-red-500"
                                            }`}
                                    />
                                    {data.isActive === "Y" ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* ── Price Info ── */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Price Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow
                                        label="Price Amount"
                                        value={
                                            <span className="font-semibold text-slate-800">
                                                {formatPrice(
                                                    data.price,
                                                    (data.isPercentage === "Y" ? "Y" : "N") as "Y" | "N",
                                                )}
                                            </span>
                                        }
                                    />
                                    <DetailRow
                                        label="Price Type"
                                        value={
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${data.isPercentage === "Y"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {data.isPercentage === "Y" ? "Percentage" : "Fixed"}
                                            </span>
                                        }
                                    />
                                </div>
                            </div>

                            {/* ── Payment Method ── */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Payment Method
                                </p>
                                {pm ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailRow label="Bank Name" value={pm.bank} />
                                        <DetailRow label="Payment Code" value={pm.paymentCode} />
                                        <DetailRow label="Ext Payment Code" value={pm.extPaymentCode} />
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 font-mono">
                                        {data.paymentMethodUid?.slice(0, 16)}…
                                    </p>
                                )}
                            </div>

                            {/* ── Merchant ── */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Merchant
                                </p>
                                {data.merchantUid ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailRow label="Merchant Name" value={data.merchantUid.merchantDesc} />
                                        <DetailRow label="Merchant ID" value={data.merchantUid.merchantId} />
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No merchant assigned</p>
                                )}
                            </div>

                            {/* ── Created By ── */}
                            {data.createdBy && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Created By
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailRow label="Full Name" value={data.createdBy.fullName} />
                                        <DetailRow label="Email" value={data.createdBy.email} />
                                        <DetailRow label="Username" value={data.createdBy.userName} />
                                        <DetailRow
                                            label="Account Status"
                                            value={
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${data.createdBy.isActive === "Y"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {data.createdBy.isActive === "Y" ? "Active" : "Inactive"}
                                                </span>
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Timestamps ── */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Timestamps
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <DetailRow
                                        label="Created At"
                                        value={formatDate(data.createdAt)}
                                    />
                                    <DetailRow
                                        label="Updated At"
                                        value={formatDate(data.updatedAt)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6">
                            <p className="text-sm text-slate-400">No data available.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}
