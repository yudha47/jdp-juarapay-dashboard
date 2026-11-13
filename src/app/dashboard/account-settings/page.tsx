"use client";

import { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../lib/auth";
import { useUser, useUpdateUser, useUpdateUserPass } from "../../../hooks/useUsers";
import { UserUpdateRequest } from "../../../data/request/UserUpdateRequest";
import PasswordInput from "../../../components/ui/PasswordInput";

interface AccountForm {
    dateOfBirth: string;
    email: string;
    fullName: string;
    gender: string;
    phone: string;
    userName: string;
}

const emptyForm: AccountForm = {
    dateOfBirth: "",
    email: "",
    fullName: "",
    gender: "",
    phone: "",
    userName: "",
};

const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

function toDateInputValue(value?: string | null) {
    if (!value) return "";
    return value.length >= 10 ? value.slice(0, 10) : value;
}

function initials(name?: string) {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

function SpinnerLabel({ label }: { label: string }) {
    return (
        <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            {label}
        </span>
    );
}

export default function AccountSettings() {
    const userData = getLoggedInUser();
    const { data: user, loading: userLoading } = useUser(userData?.userUid);
    const { update: updateUser, loading: saving } = useUpdateUser();
    const { update: updateUserPass, loading: changingPass } = useUpdateUserPass();

    const [form, setForm] = useState<AccountForm>(emptyForm);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [passwords, setPasswords] = useState({ userPass: "", confirmPass: "" });
    const [passMsg, setPassMsg] = useState<string | null>(null);
    const [passError, setPassError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            dateOfBirth: toDateInputValue(user.dateOfBirth),
            email: user.email ?? "",
            fullName: user.fullName ?? "",
            gender: user.gender ?? "",
            phone: user.phone ?? "",
            userName: user.userName ?? "",
        });
    }, [user]);

    function handleChange<K extends keyof AccountForm>(key: K, value: AccountForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSaveMsg(null);
        setSaveError(null);

        const payload: UserUpdateRequest = {
            fullName: form.fullName,
            userName: form.userName,
            email: form.email,
            phone: form.phone,
            dateOfBirth: form.dateOfBirth || null,
            gender: form.gender || null,
            isActive: user.isActive,
            roleUid: user.role?.roleUid,
            userDir: user.userDir ?? null,
            userImage: user.userImage ?? null,
            merchantUid: user.merchantUid ?? undefined,
            regionUid: user.regionUid ?? undefined,
            subMerchantUid: user.subMerchantUid ?? undefined,
        };

        try {
            await updateUser(user.userUid, payload);
            setSaveMsg("Changes saved successfully.");
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save changes. Please try again.");
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setPassError(null);
        setPassMsg(null);

        if (passwords.userPass.length < 8) {
            setPassError("Password must be at least 8 characters.");
            return;
        }
        if (passwords.userPass !== passwords.confirmPass) {
            setPassError("Password confirmation does not match.");
            return;
        }

        try {
            await updateUserPass(user.userUid, { userPass: passwords.userPass });
            setPassMsg("Password changed successfully.");
            setPasswords({ userPass: "", confirmPass: "" });
        } catch (err) {
            setPassError(err instanceof Error ? err.message : "Failed to change password. Please try again.");
        }
    }

    if (userLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-slate-500">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account information and security.
                </p>
            </div>

            {/* Profile header */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-base font-medium text-white">
                    {user?.userImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.userImage} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                        initials(user?.fullName)
                    )}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-base font-medium text-gray-900">{user?.fullName || "-"}</p>
                    <p className="truncate text-sm text-gray-500">{user?.email || "-"}</p>
                    <span
                        className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user?.isActive === "Y" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}
                    >
                        {user?.isActive === "Y" ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            {/* Profile info */}
            <form onSubmit={handleSaveProfile} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Account Information</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Personal data linked to your account.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full Name">
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Username">
                        <input
                            type="text"
                            value={form.userName}
                            onChange={(e) => handleChange("userName", e.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Email">
                        <input
                            type="email"
                            value={form.email}
                            disabled
                            readOnly
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Phone Number">
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Date of Birth">
                        <input
                            type="date"
                            value={form.dateOfBirth}
                            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Gender">
                        <select
                            value={form.gender}
                            onChange={(e) => handleChange("gender", e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
                    </Field>
                </div>

                {saveError && <p className="text-sm text-red-600">{saveError}</p>}

                <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <SpinnerLabel label="Saving..." /> : "Save Changes"}
                    </button>
                    {saveMsg && <span className="text-sm text-gray-500">{saveMsg}</span>}
                </div>
            </form>

            {/* Merchant info (read-only) */}
            {/* <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Merchant Information</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Set by the system, cannot be changed.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Merchant UID">
                        <input type="text" value={user?.merchantUid ?? "-"} disabled readOnly className={inputClass} />
                    </Field>

                    <Field label="Region UID">
                        <input type="text" value={user?.regionUid ?? "-"} disabled readOnly className={inputClass} />
                    </Field>

                    <Field label="Sub Merchant UID">
                        <input type="text" value={user?.subMerchantUid ?? "-"} disabled readOnly className={inputClass} />
                    </Field>
                </div>
            </div> */}

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Use a strong password that you haven&apos;t used before.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="New Password">
                        <PasswordInput
                            value={passwords.userPass}
                            onChange={(e) => setPasswords((p) => ({ ...p, userPass: e.target.value }))}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Confirm Password">
                        <PasswordInput
                            value={passwords.confirmPass}
                            onChange={(e) => setPasswords((p) => ({ ...p, confirmPass: e.target.value }))}
                            className={inputClass}
                            required
                        />
                    </Field>
                </div>

                {passError && <p className="text-sm text-red-600">{passError}</p>}
                {passMsg && <p className="text-sm text-green-600">{passMsg}</p>}

                <div className="border-t border-gray-100 pt-5">
                    <button
                        type="submit"
                        disabled={changingPass}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {changingPass ? <SpinnerLabel label="Saving..." /> : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {children}
        </label>
    );
}