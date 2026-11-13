import React, { useEffect, useState } from "react";
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
    fee: number;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
}

interface AddPaymentMethodModalProps {
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
}

// ── Helpers for a nicer numeric input experience ──
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

export default function AddPaymentMethodModal({
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
}: AddPaymentMethodModalProps) {
    // ── Fee display state (separate from raw numeric value sent to parent) ──
    const [feeDisplay, setFeeDisplay] = useState("");

    // Reset display whenever the modal is (re)opened, since feeData.fee
    // always starts back at the default (0) for "Add"
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFeeDisplay(feeData.fee ? formatWithThousands(String(feeData.fee)) : "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleFeeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = sanitizeNumberInput(e.target.value);
        setFeeDisplay(formatWithThousands(cleaned));
        onFeeInputChange({
            target: { name: "fee", value: cleaned },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    if (!isOpen) return null;

    const feePlaceholder = feeData.isPercentage === "Y" ? "e.g. 1.5" : "e.g. 3,000";

    const inputClass = () =>
        `w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                                <span className="text-base">💳</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Add Payment Method</h2>
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
                <form onSubmit={onSubmit} className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
                    <div className="space-y-5">
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
                                        placeholder="e.g. 012"
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
                                        placeholder="e.g. 012"
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
                                        placeholder="e.g. Bank BRI"
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
                                        placeholder="e.g. 002"
                                        className={inputClass()}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Sub Bank ID</label>
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
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Channel ID</label>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Fee Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        inputMode="decimal"
                                        name="fee"
                                        value={feeDisplay}
                                        onChange={handleFeeInput}
                                        placeholder={feePlaceholder}
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
                        </div>
                    </div>
                </form>

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
                        disabled={loading}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : "Add Payment Method"}
                    </button>
                </div>
            </div>
        </div>
    );
}