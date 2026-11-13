import React, { useEffect, useRef, useState } from "react";
import { PaymentMethodModel } from "../../../../data/models/PaymentMethodModel";
import { MerchantModel } from "../../../../data/models/MerchantModel";
import { usePaymentMethod } from "../../../../hooks/usePaymentMethod";
import { useCategories } from "@/hooks/useCategory";

export interface PriceFormData {
    price: number;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
    catUid?: string;
    paymentMethodUid: string;
    merchantUid: string;
}

interface EditMdrModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: PriceFormData;
    paymentMethodData: PaymentMethodModel[];
    merchantData: MerchantModel[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    fetchLoading?: boolean;
}

// ── Helpers for a nicer price input experience ──
const sanitizeNumberInput = (value: string): string => {
    let v = value.replace(/,/g, ""); // strip thousand separators
    v = v.replace(/[^0-9.]/g, ""); // digits & dot only (no e, +, -)
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
        // keep only the first dot, strip the rest
        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }
    return v;
};

const formatWithThousands = (value: string): string => {
    if (!value) return "";
    const [intPart, decPart] = value.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

export default function EditMdrModal({
    isOpen,
    onClose,
    formData,
    paymentMethodData,
    merchantData,
    onInputChange,
    onSubmit,
    loading,
    fetchLoading,
}: EditMdrModalProps) {
    const selectedUid = formData.paymentMethodUid || null;
    const { data: pmDetail, loading: pmLoading } = usePaymentMethod(selectedUid || "");
    const { items: categoryData } = useCategories({ page: 1, limit: 100 });
    const fee = pmDetail?.fee ?? null;

    // ── Set initial Price Type value from the Fee Info's Fee Type (once per fee) ──
    const syncedFeeUidRef = useRef<string | null>(null);

    useEffect(() => {
        if (!fee || pmLoading) return;
        if (syncedFeeUidRef.current !== fee.feeUid) {
            syncedFeeUidRef.current = fee.feeUid;
            if (formData.isPercentage !== fee.isPercentage) {
                onInputChange({
                    target: { name: "isPercentage", value: fee.isPercentage },
                } as React.ChangeEvent<HTMLSelectElement>);
            }
        }
    }, [fee, pmLoading, formData.isPercentage, onInputChange]);

    const [priceDisplay, setPriceDisplay] = useState("");
    const lastSentRef = useRef<number | null>(null);
    useEffect(() => {
        if (!isOpen) {
            lastSentRef.current = null;
            return;
        }
        if (fetchLoading) return;

        if (formData.price !== lastSentRef.current) {
            setPriceDisplay(formData.price ? formatWithThousands(String(formData.price)) : "");
            lastSentRef.current = formData.price;
        }
    }, [isOpen, fetchLoading, formData.price]);

    const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = sanitizeNumberInput(e.target.value);
        setPriceDisplay(formatWithThousands(cleaned));

        const numeric = cleaned === "" ? 0 : Number(cleaned);
        lastSentRef.current = numeric; // mark as "our own change" before parent updates formData.price

        onInputChange({
            target: { name: "price", value: cleaned },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    if (!isOpen) return null;

    const filteredPaymentMethods = formData.catUid
        ? paymentMethodData.filter((pm) => pm.category?.catUid === formData.catUid && pm.isActive === "Y")
        : [];

    const pricePlaceholder = formData.isPercentage === "Y" ? "e.g. 1.5" : "e.g. 3,000";

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500 backdrop-blur-sm";

    const disabledInputClass =
        "w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 py-2 text-gray-500 cursor-not-allowed";

    const SkeletonField = () => <div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                                <span className="text-base">✏️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Payment Method</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
                    {fetchLoading ? (
                        <div className="space-y-5">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {[...Array(i === 0 ? 3 : 3)].map((_, j) => (
                                            <div key={j} className="space-y-1">
                                                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                                <SkeletonField />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Assignment
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Merchant <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            name="merchantUid"
                                            value={formData.merchantUid}
                                            onChange={onInputChange}
                                            className={disabledInputClass}
                                            disabled
                                        >
                                            <option value="">Select Merchant</option>
                                            {merchantData
                                                .filter((m) => m.userMerchant?.isActive === "Y")
                                                .map((m) => (
                                                    <option key={m.merchantUid} value={m.merchantUid}>
                                                        [{m.merchantId}] {m.merchantDesc}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            name="catUid"
                                            value={formData.catUid}
                                            onChange={onInputChange}
                                            className={inputClass}
                                        >
                                            <option value="">Select Category</option>
                                            {categoryData.map((cat) => (
                                                <option key={cat.catUid} value={cat.catUid}>
                                                    {cat.catDesc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            name="paymentMethodUid"
                                            value={formData.paymentMethodUid}
                                            onChange={onInputChange}
                                            className={inputClass}
                                            disabled={!formData.catUid}
                                        >
                                            <option value="">
                                                {formData.catUid ? "Select Payment Method" : "Select Category First"}
                                            </option>
                                            {filteredPaymentMethods.map((pm) => (
                                                <option key={pm.paymentMethodUid} value={pm.paymentMethodUid}>
                                                    {pm.bank} ({pm.paymentCode})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                    ℹ️ Each combination of <span className="font-semibold">Merchant</span> and{" "}
                                    <span className="font-semibold">Payment Method</span> must be unique.
                                </p>
                            </div>

                            {selectedUid && (
                                <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                                            🏷️ Fee Info
                                        </h3>
                                        {pmLoading && (
                                            <span className="text-xs text-violet-400 animate-pulse">Loading...</span>
                                        )}
                                    </div>

                                    {pmLoading ? (
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-xl border border-gray-200/60 bg-white/70 p-4 backdrop-blur-sm"
                                                >
                                                    <div className="mb-3 h-3 w-24 rounded-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                                                    <div className="h-10 w-full rounded-lg bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : fee ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-500">
                                                        Fee Amount
                                                    </label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={fee.fee}
                                                        className={disabledInputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-500">
                                                        Fee Type
                                                    </label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            fee.isPercentage === "Y" ? "Percentage (%)" : "Fixed (Flat)"
                                                        }
                                                        className={disabledInputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-500">
                                                        Fee Status
                                                    </label>
                                                    <div className="flex items-center h-9.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${fee.isActive === "Y"
                                                                ? "bg-green-100 text-green-700 border border-green-200"
                                                                : "bg-red-100 text-red-600 border border-red-200"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${fee.isActive === "Y" ? "bg-green-500" : "bg-red-500"
                                                                    }`}
                                                            />
                                                            {fee.isActive === "Y" ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs text-violet-700 bg-violet-100 rounded-lg px-3 py-2">
                                                ℹ️ This is the <span className="font-semibold">base fee</span> for the
                                                selected payment method.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                            <span className="text-gray-400 text-base">⚠️</span>
                                            <p className="text-sm text-gray-500">
                                                No fee configured for this payment method.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-600">
                                    💰 Price Configuration
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Price Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            inputMode="decimal"
                                            name="price"
                                            value={priceDisplay}
                                            onChange={handlePriceInput}
                                            placeholder={pricePlaceholder}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Price Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="isPercentage"
                                            value={formData.isPercentage}
                                            onChange={onInputChange}
                                            disabled
                                            className={disabledInputClass}
                                        >
                                            <option value="Y">Percentage (%)</option>
                                            <option value="N">Fixed (Flat)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="isActive"
                                            value={formData.isActive}
                                            onChange={onInputChange}
                                            className={inputClass}
                                        >
                                            <option value="Y">Active</option>
                                            <option value="N">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                                    This price is applied specifically for the selected merchant.
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                <div className="sticky bottom-0 border-t border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading || fetchLoading}
                        className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}