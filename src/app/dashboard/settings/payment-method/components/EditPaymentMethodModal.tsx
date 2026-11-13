import React from "react";
import { PaymentGatewayModel } from "../../../../../data/models/PaymentGatewayModel";
import { CategoryModel } from "../../../../../data/models/CategoryModel";

interface PaymentMethodFormData {
    bank: string;
    bankDir: string;
    bankId: string;
    bankImg: string;
    catUid: string;
    channelId: string;
    extPaymentCode: string;
    isActive: "Y" | "N";
    paymentCode: string;
    pgUid: string;
    subBankId: string;
}

export interface FeeFormData {
    feeUid: string;
    fee: number;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
}

interface EditPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: PaymentMethodFormData;
    feeData: FeeFormData;
    pgData: PaymentGatewayModel[];
    categoryData: CategoryModel[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFeeInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    fetchLoading?: boolean;
}

export default function EditPaymentMethodModal({
    isOpen,
    onClose,
    formData,
    feeData,
    pgData,
    categoryData,
    onInputChange,
    onFeeInputChange,
    onSubmit,
    loading,
    fetchLoading,
}: EditPaymentMethodModalProps) {
    if (!isOpen) return null;

    const inputClass = () =>
        `w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500 backdrop-blur-sm`;

    const SkeletonField = () => <div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                                <span className="text-base">✏️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Payment Method</h2>
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
                        /* ── Skeleton while fetching detail ── */
                        <div className="space-y-5">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {[...Array(i === 3 ? 3 : 4)].map((_, j) => (
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
                            {/* Basic Information */}
                            <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Payment Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="paymentCode"
                                            value={formData.paymentCode}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Ext Payment Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="extPaymentCode"
                                            value={formData.extPaymentCode}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Bank Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="bank"
                                            value={formData.bank}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Bank ID</label>
                                        <input
                                            type="text"
                                            name="bankId"
                                            value={formData.bankId}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Sub Bank ID
                                        </label>
                                        <input
                                            type="text"
                                            name="subBankId"
                                            value={formData.subBankId}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Configuration */}
                            <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Configuration
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Payment Gateway <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            name="pgUid"
                                            value={formData.pgUid}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        >
                                            <option value="">Select Gateway</option>
                                            {pgData.map((pg) => (
                                                <option key={pg.pgUid} value={pg.pgUid}>
                                                    {pg.pgDesc}
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
                                            className={inputClass()}
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
                                            Channel ID
                                        </label>
                                        <input
                                            type="text"
                                            name="channelId"
                                            value={formData.channelId}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="isActive"
                                            value={formData.isActive}
                                            onChange={onInputChange}
                                            className={inputClass()}
                                        >
                                            <option value="Y">Active</option>
                                            <option value="N">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Additional Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Bank Image URL
                                        </label>
                                        <input
                                            type="text"
                                            name="bankImg"
                                            value={formData.bankImg}
                                            onChange={onInputChange}
                                            placeholder="https://..."
                                            className={inputClass()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fee Configuration */}
                            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-600">
                                    💰 Fee Configuration
                                </h3>
                                {feeData.feeUid ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Fee Amount <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="fee"
                                                    min={0}
                                                    step="any"
                                                    value={feeData.fee}
                                                    onChange={onFeeInputChange}
                                                    className={inputClass()}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Fee Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="isPercentage"
                                                    value={feeData.isPercentage}
                                                    onChange={onFeeInputChange}
                                                    className={inputClass()}
                                                >
                                                    <option value="Y">Percentage (%)</option>
                                                    <option value="N">Fixed (Flat)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Fee Status <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="isActive"
                                                    value={feeData.isActive}
                                                    onChange={onFeeInputChange}
                                                    className={inputClass()}
                                                >
                                                    <option value="Y">Active</option>
                                                    <option value="N">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                                            This fee is applied for the payment gateway.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        Tidak ada data fee untuk payment method ini.
                                    </p>
                                )}
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
