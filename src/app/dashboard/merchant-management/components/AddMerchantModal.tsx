import { PaymentMethodModel } from "@/data/models/PaymentMethodModel";
import { MerchantRequest } from "@/data/request/MerchantRequest";
import { UserRequest } from "@/data/request/UserRequest";
import { useCreateUser, useUsers } from "@/hooks/useUsers";
import { useRoleMap } from "@/hooks/useRole";
import { getLoggedInRole, getLoggedInUser } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { SearchSelectUser } from "@/components/shared/SearchSelectComponent";
import InfoDialog from "../../../../components/ui/InfoDialog";
import PasswordInput from "@/components/ui/PasswordInput";

type UserMode = "existing" | "new";

const infoContent: Record<string, { title: string; description: string }> = {
    danaTalang: {
        title: "floating fund",
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

export function AddMerchantModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: MerchantRequest) => void }) {
    const userLoggedIn = getLoggedInUser();
    const userLoggedInRole = getLoggedInRole();

    const { items: users, loading: userLoading } = useUsers({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const { roles } = useRoleMap();
    const { create: createUser, loading: creatingUser } = useCreateUser();

    const defaultRoleUid = useMemo(() => {
        return roles.find((r) => r.roleDesc === "Merchant")?.roleUid || "";
    }, [roles]);

    const adminRoleUid = useMemo(() => {
        return roles.find((r) => r.roleDesc === "Admin")?.roleUid || "";
    }, [roles]);

    const adminUsers = useMemo(() => {
        if (!adminRoleUid) return [];
        return users.filter((user) => user.roleUid === adminRoleUid);
    }, [users, adminRoleUid]);

    const [userMode, setUserMode] = useState<UserMode>("existing");

    const [form, setForm] = useState({
        name: "",
        paymentMethods: [] as PaymentMethodModel[],
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

    const [infoDialog, setInfoDialog] = useState<{ title: string; description: string } | null>(null);

    const [newUserForm, setNewUserForm] = useState({
        name: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        roleUid: defaultRoleUid,
    });

    useEffect(() => {
        if (userMode !== "new") return;
        if (newUserForm.roleUid) return;
        if (!roles?.length) return;

        const next = roles.find((r) => r.roleDesc === "Admin")?.roleUid;
        if (next) setNewUserForm((f) => ({ ...f, roleUid: next }));
    }, [roles, userLoggedInRole, userMode, newUserForm.roleUid]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const e: Record<string, string> = {};

        if (!form.name.trim()) e.name = "Merchant name is required";
        if (!userLoggedIn?.userUid) e.createdBy = "User must be logged in to create a merchant";
        if (!form.bankName.trim()) e.bankName = "Bank name is required";
        if (!form.bankNoRek.trim()) e.bankNoRek = "Bank account number is required";
        if (userMode === "existing") {
            if (!form.userUid) e.userUid = "User is required";
        } else {
            if (!newUserForm.name.trim()) e.newUser_name = "Fullname is required";
            if (!newUserForm.email.trim()) e.newUser_email = "Email is required";
            if (!newUserForm.username.trim()) e.newUser_username = "Username is required";
            if (!newUserForm.phone.trim()) e.newUser_phone = "Phone number is required";
            if (!newUserForm.roleUid.trim()) e.newUser_roleUid = "Account role is required";
            if (!newUserForm.password) e.newUser_password = "Password is required";
        }

        return e;
    }

    async function handleSubmit() {
        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }

        let userUidToUse = form.userUid;

        if (userMode === "new") {
            const payloadUser: UserRequest = {
                fullName: newUserForm.name,
                email: newUserForm.email,
                phone: parseInt(newUserForm.phone) || 0,
                roleUid: newUserForm.roleUid,
                userName: newUserForm.username,
                userPass: newUserForm.password,
            };

            try {
                const created = await createUser(payloadUser);
                if (!created) {
                    setErrors((er) => ({ ...er, newUser_general: "Create user failed: userUid not returned" }));
                    return;
                }
                userUidToUse = created;
            } catch (err) {
                setErrors((er) => ({ ...er, newUser_general: (err as Error)?.message || "Failed to create user" }));
                return;
            }
        }

        const newMerchant: MerchantRequest = {
            merchantDesc: form.name.trim(),
            registrationDate: new Date().toISOString(),
            userUid: userUidToUse,
            createdBy: userLoggedIn!.userUid,
            danaTalang: form.danaTalang,
            withMdr: form.withMdr,
            isClient: form.isClient,
            isActive: "Y",
            status: form.status,
            bankName: form.bankName.trim(),
            bankNoRek: form.bankNoRek.trim(),
            callbackUrl: form.callbackUrl.trim(),
            redirectUrl: form.redirectUrl.trim(),
            productName: form.productName.trim(),
        };

        onAdd(newMerchant);
    }

    const loading = userLoading || creatingUser;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="rounded-lg bg-background px-6 py-5 shadow-2xl border border-border">
                    <p className="text-sm text-foreground/70">Loading...</p>
                </div>
            </div>
        );
    }

    // tombol info reusable
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
            {/* relative agar InfoDialog absolute bisa mengikuti container ini */}
            <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl border border-border overflow-hidden">
                {/* Info Dialog overlay */}
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
                                Add New Merchant
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

                    {/* With MDR */}
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

                    {/* Tax Charged To */}
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

                    {/* Merchant Type */}
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

                    {/* User Mode */}
                    <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-semibold text-foreground/70 mb-2">User Option</p>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="userMode"
                                    checked={userMode === "existing"}
                                    onChange={() => {
                                        setUserMode("existing");
                                        setErrors((er) => ({ ...er, userUid: "", newUser_general: "" }));
                                    }}
                                />
                                Select existing user
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="userMode"
                                    checked={userMode === "new"}
                                    onChange={() => {
                                        setUserMode("new");
                                        setForm((f) => ({ ...f, userUid: "" }));
                                        setErrors((er) => ({ ...er, userUid: "", newUser_general: "" }));
                                    }}
                                />
                                Create new user
                            </label>
                        </div>
                    </div>

                    {/* Existing user select */}
                    {userMode === "existing" && (
                        <SearchSelectUser
                            label="Select User"
                            required={true}
                            users={adminUsers}
                            value={form.userUid}
                            onChange={(userUid) => {
                                setForm((f) => ({ ...f, userUid }));
                                setErrors((er) => ({ ...er, userUid: "" }));
                            }}
                        />
                    )}

                    {/* New user form */}
                    {userMode === "new" && (
                        <div className="space-y-3 rounded-lg border border-border p-4">
                            {errors.newUser_general && <p className="text-xs text-red-600">{errors.newUser_general}</p>}

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground/70">
                                    Fullname <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm"
                                    value={newUserForm.name}
                                    onChange={(e) => {
                                        setNewUserForm((f) => ({ ...f, name: e.target.value }));
                                        setErrors((er) => ({ ...er, newUser_name: "" }));
                                    }}
                                />
                                {errors.newUser_name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.newUser_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground/70">
                                    Username <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm"
                                    value={newUserForm.username}
                                    onChange={(e) => {
                                        setNewUserForm((f) => ({ ...f, username: e.target.value }));
                                        setErrors((er) => ({ ...er, newUser_username: "" }));
                                    }}
                                />
                                {errors.newUser_username && (
                                    <p className="mt-1 text-xs text-red-600">{errors.newUser_username}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground/70">
                                    Email <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm"
                                    value={newUserForm.email}
                                    onChange={(e) => {
                                        setNewUserForm((f) => ({ ...f, email: e.target.value }));
                                        setErrors((er) => ({ ...er, newUser_email: "" }));
                                    }}
                                />
                                {errors.newUser_email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.newUser_email}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground/70">
                                    Phone <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm"
                                    value={newUserForm.phone}
                                    onChange={(e) => {
                                        setNewUserForm((f) => ({ ...f, phone: e.target.value }));
                                        setErrors((er) => ({ ...er, newUser_phone: "" }));
                                    }}
                                />
                                {errors.newUser_phone && (
                                    <p className="mt-1 text-xs text-red-600">{errors.newUser_phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground/70">
                                    Password <span className="text-primary">*</span>
                                </label>
                                <PasswordInput
                                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm"
                                    value={newUserForm.password}
                                    onChange={(e) => {
                                        setNewUserForm((f) => ({ ...f, password: e.target.value }));
                                        setErrors((er) => ({ ...er, newUser_password: "" }));
                                    }}
                                />
                                {errors.newUser_password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.newUser_password}</p>
                                )}
                            </div>
                        </div>
                    )}
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
                        disabled={creatingUser}
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                    >
                        {creatingUser ? "Creating User..." : "Add Merchant"}
                    </button>
                </div>
            </div>
        </div>
    );
}
