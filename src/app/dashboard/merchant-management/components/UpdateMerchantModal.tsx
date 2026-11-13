/* eslint-disable react-hooks/static-components */
import { MerchantRequest } from "@/data/request/MerchantRequest";
import { SearchSelectUser } from "@/components/shared/SearchSelectComponent";
import { MerchantModel } from "@/data/models/MerchantModel";
import { useUsers } from "@/hooks/useUsers";
import { getLoggedInUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useMerchant } from "@/hooks/useMerchant";
import InfoDialog from "../../../../components/ui/InfoDialog";

const infoContent: Record<string, { title: string; description: string }> = {
    danaTalang: {
        title: "Floating Fund",
        description: "Dana talangan untuk pencairan ditanggung JPay atau tidak",
    },
    withMdr: {
        title: "With MDR",
        description: "Pencairan beserta biaya MDR atau tidak",
    },
    taxCharged: {
        title: "MDR & Tax Charged To",
        description: "Pajak ditanggung oleh merchant atau customer",
    },
    merchantType: {
        title: "Merchant Type",
        description: "Tipe dari merchant",
    },
};

export function UpdateMerchantModal({
    onClose,
    onUpdate,
    existingData,
}: {
    onClose: () => void;
    onUpdate: (m: MerchantRequest) => void;
    existingData?: MerchantModel;
}) {
    const userLoggedIn = getLoggedInUser();

    const { items: users, loading: userLoading } = useUsers({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const { data: merchantDetailData } = useMerchant(existingData?.merchantId);
    const [infoDialog, setInfoDialog] = useState<{ title: string; description: string } | null>(null);

    const [form, setForm] = useState({
        name: "",
        userUid: "",
        danaTalang: "N",
        withMdr: "N",
        isClient: "N",
        status: "non-principal",
        bankName: "",
        bankNoRek: "",
        callbackUrl: "",
        redirectUrl: "",
        productName: "",
    });

    useEffect(() => {
        if (!merchantDetailData) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            name: merchantDetailData.merchantDesc || "",
            userUid: merchantDetailData.userMerchant?.userUid || "",
            danaTalang: merchantDetailData.danaTalang || "N",
            withMdr: merchantDetailData.withMdr || "N",
            isClient: merchantDetailData.isClient || "N",
            status: merchantDetailData.status || "non-principal",
            bankName: merchantDetailData.bankName || "",
            bankNoRek: merchantDetailData.bankNoRek || "",
            callbackUrl: merchantDetailData.callbackUrl || "",
            redirectUrl: merchantDetailData.redirectUrl || "",
            productName: merchantDetailData.productName || "",
        });
    }, [merchantDetailData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const e: Record<string, string> = {};

        if (!form.name.trim()) e.name = "Merchant name is required";

        if (!userLoggedIn?.userUid) e.createdBy = "User must be logged in to create a merchant";
        if (!form.userUid) e.userUid = "User is required";
        if (!form.bankName.trim()) e.bankName = "Bank name is required";
        if (!form.bankNoRek.trim()) e.bankNoRek = "Bank account number is required";

        return e;
    }

    async function handleSubmit() {
        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }

        const userUidToUse = form.userUid;

        const newMerchant: MerchantRequest = {
            merchantDesc: form.name.trim(),
            registrationDate: merchantDetailData?.registrationDate || new Date().toISOString(),
            userUid: userUidToUse,
            createdBy: existingData?.createdBy.userUid || userLoggedIn!.userUid,
            withMdr: form.withMdr,
            danaTalang: form.danaTalang,
            isClient: form.isClient,
            status: form.status,
            bankName: form.bankName.trim(),
            bankNoRek: form.bankNoRek.trim(),
            callbackUrl: form.callbackUrl.trim(),
            redirectUrl: form.redirectUrl.trim(),
            productName: form.productName.trim(),
            isActive: merchantDetailData?.isActive ?? "Y",
        };

        onUpdate(newMerchant);
    }

    const loading = userLoading;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="rounded-lg bg-background px-6 py-5 shadow-2xl border border-border">
                    <p className="text-sm text-foreground/70">Loading...</p>
                </div>
            </div>
        );
    }

    function InfoBtn({ infoKey }: { infoKey: string }) {
        return (
            <button
                type="button"
                onClick={() => setInfoDialog(infoContent[infoKey])}
                className="w-4 h-4 rounded-full border border-foreground/30 flex items-center justify-center text-foreground/40 hover:border-primary hover:text-primary transition-colors text-[10px] italic font-semibold leading-none"
            >
                i
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl border border-border overflow-hidden">
                {infoDialog && (
                    <InfoDialog
                        title={infoDialog.title}
                        description={infoDialog.description}
                        onClose={() => setInfoDialog(null)}
                    />
                )}
                {/* Header */}
                <div className="bg-primary px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-primary-foreground tracking-tight">
                                Update Merchant
                            </h2>
                            <p className="text-xs text-primary-foreground/70 mt-0.5">
                                Complete the merchant data accurately and thoroughly
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Form */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Merchant Name */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                            Merchant Name <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, name: e.target.value }));
                                setErrors((er) => ({ ...er, name: "" }));
                            }}
                            placeholder="e.g. Warung Barokah"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.name
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-primary">{errors.name}</p>}
                    </div>

                    {/* Bank Name */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                            Bank Name <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.bankName}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, bankName: e.target.value }));
                                setErrors((er) => ({ ...er, bankName: "" }));
                            }}
                            placeholder="e.g. Bank Central Asia"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.bankName
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.bankName && <p className="mt-1 text-xs text-primary">{errors.bankName}</p>}
                    </div>

                    {/* Bank Account Number */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                            Bank Account Number <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.bankNoRek}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, bankNoRek: e.target.value }));
                                setErrors((er) => ({ ...er, bankNoRek: "" }));
                            }}
                            placeholder="e.g. 1234567890"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.bankNoRek
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.bankNoRek && <p className="mt-1 text-xs text-primary">{errors.bankNoRek}</p>}
                    </div>

                    {/* Callback URL */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Callback URL</label>
                        <input
                            type="url"
                            value={form.callbackUrl}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, callbackUrl: e.target.value }));
                                setErrors((er) => ({ ...er, callbackUrl: "" }));
                            }}
                            placeholder="e.g. https://example.com/callback"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.callbackUrl
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.callbackUrl && <p className="mt-1 text-xs text-primary">{errors.callbackUrl}</p>}
                    </div>

                    {/* Redirect URL */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Redirect URL</label>
                        <input
                            type="url"
                            value={form.redirectUrl}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, redirectUrl: e.target.value }));
                                setErrors((er) => ({ ...er, redirectUrl: "" }));
                            }}
                            placeholder="e.g. https://example.com/redirect"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.redirectUrl
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.redirectUrl && <p className="mt-1 text-xs text-primary">{errors.redirectUrl}</p>}
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Product Name</label>
                        <input
                            type="text"
                            value={form.productName}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, productName: e.target.value }));
                                setErrors((er) => ({ ...er, productName: "" }));
                            }}
                            placeholder="e.g. My Product"
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.productName
                                    ? "border-primary/40 focus:ring-red-200"
                                    : "border-border focus:border-primary/40 focus:ring-primary/20"
                                }`}
                        />
                        {errors.productName && <p className="mt-1 text-xs text-primary">{errors.productName}</p>}
                    </div>

                    {/* Dana Talang */}
                    <div className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground/70">Floating Fund</p>
                            <InfoBtn infoKey="danaTalang" />
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="danaTalang"
                                    checked={form.danaTalang === "Y"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, danaTalang: "Y" }));
                                        setErrors((er) => ({ ...er, danaTalang: "" }));
                                    }}
                                />
                                Yes
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="danaTalang"
                                    checked={form.danaTalang === "N"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, danaTalang: "N" }));
                                        setErrors((er) => ({ ...er, danaTalang: "" }));
                                    }}
                                />
                                No
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground/70">With MDR</p>
                            <InfoBtn infoKey="withMdr" />
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="withMdr"
                                    checked={form.withMdr === "Y"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, withMdr: "Y" }));
                                        setErrors((er) => ({ ...er, withMdr: "" }));
                                    }}
                                />
                                Yes
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="withMdr"
                                    checked={form.withMdr === "N"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, withMdr: "N" }));
                                        setErrors((er) => ({ ...er, withMdr: "" }));
                                    }}
                                />
                                No
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground/70">MDR & Tax Charged To</p>
                            <InfoBtn infoKey="taxCharged" />
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="isClient"
                                    checked={form.isClient === "N"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, isClient: "N" }));
                                        setErrors((er) => ({ ...er, isClient: "" }));
                                    }}
                                />
                                Merchant-Billed
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="isClient"
                                    checked={form.isClient === "Y"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, isClient: "Y" }));
                                        setErrors((er) => ({ ...er, isClient: "" }));
                                    }}
                                />
                                Customer-Billed
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground/70">Merchant Type</p>
                            <InfoBtn infoKey="merchantType" />
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={form.status === "principal"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, status: "principal" }));
                                        setErrors((er) => ({ ...er, status: "" }));
                                    }}
                                />
                                Principal
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={form.status === "non-principal"}
                                    onChange={() => {
                                        setForm((f) => ({ ...f, status: "non-principal" }));
                                        setErrors((er) => ({ ...er, status: "" }));
                                    }}
                                />
                                Non Principal
                            </label>
                        </div>
                    </div>

                    <SearchSelectUser
                        label="Select User"
                        required={true}
                        users={users}
                        value={form.userUid}
                        onChange={(userUid) => {
                            setForm((f) => ({ ...f, userUid }));
                            setErrors((er) => ({ ...er, userUid: "" }));
                        }}
                        disabled={true}
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                    >
                        {loading ? "Updating Merchant..." : "Update Merchant"}
                    </button>
                </div>
            </div>
        </div>
    );
}
