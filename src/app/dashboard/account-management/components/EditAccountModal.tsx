import { UserModel } from "@/data/models/UserModel";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import { useRoleMap } from "@/hooks/useRole";
import { useUser } from "@/hooks/useUsers";
import { useMerchants } from "@/hooks/useMerchant";
import { useRegions } from "@/hooks/useRegion";
import { useSubMerchants } from "@/hooks/useSubMerchant";
import { useEffect, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/shared/SearchableSelect";

type RoleScopeType = "none" | "merchant" | "region" | "subMerchant";

function getScopeByRoleDesc(roleDesc?: string): RoleScopeType {
    const normalized = roleDesc?.trim().toLowerCase();

    if (normalized === "super admin") return "none";
    if (normalized === "admin") return "merchant";
    if (normalized === "regional") return "region";
    if (normalized === "merchant") return "subMerchant";

    return "none";
}

export function EditAccountModal({
    account,
    onClose,
    onSave,
}: {
    account: UserModel;
    onClose: () => void;
    onSave: (account: UserUpdateRequest) => void;
}) {
    const { roles } = useRoleMap();
    const { data: user, loading: userLoading } = useUser(account.userUid);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState<UserUpdateRequest>({
        fullName: account.fullName ?? "",
        email: account.email ?? "",
        phone: account.phone ?? "",
        dateOfBirth: null,
        roleUid: account.roleUid ?? "",
        userDir: null,
        userImage: null,
        userName: account.userName ?? "",
        gender: null,
        isActive: "Y",
        merchantUid: undefined,
        regionUid: undefined,
        subMerchantUid: undefined,
    });

    const {
        items: merchants,
        loading: merchantLoading,
        q: merchantQ,
        setQ: setMerchantQ,
        setLimit: setMerchantLimit,
    } = useMerchants({ page: 1, limit: 10, q: "" });

    const {
        items: regions,
        loading: regionLoading,
        q: regionQ,
        setQ: setRegionQ,
        setLimit: setRegionLimit,
    } = useRegions({ page: 1, limit: 100, q: "" });

    const {
        items: subMerchants,
        loading: subMerchantLoading,
        q: subMerchantQ,
        setQ: setSubMerchantQ,
        setLimit: setSubMerchantLimit,
    } = useSubMerchants({ page: 1, limit: 100, q: "" });

    useEffect(() => {
        setMerchantLimit(100);
        setRegionLimit(100);
        setSubMerchantLimit(100);
    }, [setMerchantLimit, setRegionLimit, setSubMerchantLimit]);

    useEffect(() => {
        if (!user) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            fullName: user.fullName ?? account.fullName ?? "",
            email: user.email ?? account.email ?? "",
            phone: user.phone ?? account.phone ?? "",
            dateOfBirth: user.dateOfBirth ?? null,
            roleUid: user.role?.roleUid ?? account.roleUid ?? "",
            userDir: user.userDir ?? null,
            userImage: user.userImage ?? null,
            userName: user.userName ?? account.userName ?? "",
            gender: user.gender ?? null,
            isActive: user.isActive ?? "Y",
            merchantUid: user.merchantUid ?? undefined,
            regionUid: user.regionUid ?? undefined,
            subMerchantUid: user.subMerchantUid ?? undefined,
        });
    }, [user, account]);

    const merchantOptions = useMemo(
        () =>
            merchants.map((item) => ({
                value: item.merchantUid,
                label: `${item.merchantDesc}`,
            })),
        [merchants]
    );

    const regionOptions = useMemo(
        () =>
            regions.map((item) => ({
                value: item.regionUid,
                label: `${item.regionId} - ${item.regionDesc}`,
            })),
        [regions]
    );

    const subMerchantOptions = useMemo(
        () =>
            subMerchants.map((item) => ({
                value: item.subMerchantUid,
                label: `${item.subMerchantId} - ${item.subMerchantDesc}`,
            })),
        [subMerchants]
    );

    const selectedRole = useMemo(
        () => roles.find((role) => role.roleUid === formData.roleUid),
        [roles, formData.roleUid]
    );

    const selectedScope = useMemo(
        () => getScopeByRoleDesc(selectedRole?.roleDesc),
        [selectedRole]
    );

    const handleRoleChange = (roleUid: string) => {
        setErrorMessage("");

        setFormData((prev) => ({
            ...prev,
            roleUid,
            merchantUid: undefined,
            regionUid: undefined,
            subMerchantUid: undefined,
        }));
    };

    const validateForm = () => {
        if (!formData.fullName?.trim()) return "Fullname wajib diisi.";
        if (!formData.userName?.trim()) return "Username wajib diisi.";
        if (!formData.email?.trim()) return "Email wajib diisi.";
        if (!formData.phone?.trim()) return "Phone wajib diisi.";
        if (!formData.roleUid?.trim()) return "Role wajib dipilih.";

        if (selectedScope === "merchant" && !formData.merchantUid) {
            return "Merchant wajib dipilih untuk role Admin.";
        }

        if (selectedScope === "region" && !formData.regionUid) {
            return "Region wajib dipilih untuk role Regional.";
        }

        if (selectedScope === "subMerchant" && !formData.subMerchantUid) {
            return "Sub Merchant wajib dipilih untuk role Merchant.";
        }

        return "";
    };

    const buildSubmitPayload = (): UserUpdateRequest => {
        return {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            userDir: formData.userDir,
            userImage: formData.userImage,
            roleUid: formData.roleUid,
            userName: formData.userName,
            gender: formData.gender,
            isActive: formData.isActive,
            merchantUid: selectedScope === "merchant" ? formData.merchantUid : undefined,
            regionUid: selectedScope === "region" ? formData.regionUid : undefined,
            subMerchantUid: selectedScope === "subMerchant" ? formData.subMerchantUid : undefined,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        const validationMessage = validateForm();
        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        try {
            setLoading(true);
            onSave(buildSubmitPayload());
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                    <div className="text-sm text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Account</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">User Information</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Basic user account information.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fullName: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.userName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, userName: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="081234567890"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.dateOfBirth ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                dateOfBirth: e.target.value || null,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Gender
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.gender ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                gender: e.target.value || null,
                                            })
                                        }
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.isActive}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isActive: e.target.value,
                                            })
                                        }
                                        required
                                    >
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-semibold text-gray-900">Access Settings</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Role determines assignment of merchant, region, or sub-merchant.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Account Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.roleUid}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select a role
                                        </option>
                                        {roles.map((role) => (
                                            <option key={role.roleUid} value={role.roleUid}>
                                                {role.roleDesc.charAt(0).toUpperCase() +
                                                    role.roleDesc.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedScope === "none" && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                        Super Admin does not require assignment of merchant, region, or sub-merchant.
                                    </div>
                                )}

                                {selectedScope === "merchant" && (
                                    <SearchableSelect
                                        label="Merchant"
                                        placeholder="Search merchant..."
                                        value={formData.merchantUid}
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                merchantUid: value,
                                            }))
                                        }
                                        options={merchantOptions}
                                        loading={merchantLoading}
                                        search={merchantQ}
                                        setSearch={setMerchantQ}
                                        required
                                        emptyText="No merchant found"
                                    />
                                )}

                                {selectedScope === "region" && (
                                    <SearchableSelect
                                        label="Region"
                                        placeholder="Search region..."
                                        value={formData.regionUid}
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                regionUid: value,
                                            }))
                                        }
                                        options={regionOptions}
                                        loading={regionLoading}
                                        search={regionQ}
                                        setSearch={setRegionQ}
                                        required
                                        emptyText="No region found"
                                    />
                                )}

                                {selectedScope === "subMerchant" && (
                                    <SearchableSelect
                                        label="Sub Merchant"
                                        placeholder="Search sub merchant..."
                                        value={formData.subMerchantUid}
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subMerchantUid: value,
                                            }))
                                        }
                                        options={subMerchantOptions}
                                        loading={subMerchantLoading}
                                        search={subMerchantQ}
                                        setSearch={setSubMerchantQ}
                                        required
                                        emptyText="No sub merchant found"
                                    />
                                )}
                            </div>

                            {errorMessage && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}