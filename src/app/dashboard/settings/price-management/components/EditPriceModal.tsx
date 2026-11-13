import React from "react";
import { PaymentMethodModel } from "../../../../../data/models/PaymentMethodModel";
import { MerchantModel } from "../../../../../data/models/MerchantModel";

export interface PriceFormData {
    price: number;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
    catUid?: string;
    paymentMethodUid: string;
    merchantUid: string;
}

interface EditPriceModalProps {
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

export default function EditPriceModal({
    isOpen,
    onClose,
    formData,
    paymentMethodData,
    merchantData,
    onInputChange,
    onSubmit,
    loading,
    fetchLoading,
}: EditPriceModalProps) {
    if (!isOpen) return null;

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500 backdrop-blur-sm";

    const SkeletonField = () => <div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                                <span className="text-base">✏️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Price</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
                    {fetchLoading ? (
                        <div className="space-y-5">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {[...Array(i === 0 ? 2 : 3)].map((_, j) => (
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
                            {/* Assignment */}
                            <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Assignment
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Merchant <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            disabled
                                            name="merchantUid"
                                            value={formData.merchantUid}
                                            onChange={onInputChange}
                                            className={inputClass}
                                        >
                                            <option value="">Select Merchant</option>
                                            {merchantData
                                                .filter((m) => m.userMerchant.isActive === "Y")
                                                .map((m) => (
                                                    <option key={m.merchantUid} value={m.merchantUid}>
                                                        [{m.merchantId}] {m.merchantDesc}
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
                                        >
                                            <option value="">Select Payment Method</option>

                                            {paymentMethodData
                                                .filter((pm) => pm.isActive === "Y")
                                                .map((pm) => (
                                                    <option key={pm.paymentMethodUid} value={pm.paymentMethodUid}>
                                                        {pm.bank} ({pm.paymentCode})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                {/* ── Unique pair note ── */}
                                <p className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                    ℹ️ Each combination of <span className="font-semibold">Merchant</span> and{" "}
                                    <span className="font-semibold">Payment Method</span> must be unique.
                                </p>
                            </div>

                            {/* Price Configuration */}
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
                                            type="number"
                                            name="price"
                                            min={0}
                                            step="any"
                                            value={formData.price}
                                            onChange={onInputChange}
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
                                            className={inputClass}
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

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
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
