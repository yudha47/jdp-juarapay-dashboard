"use client";

import { useEffect, useState } from "react";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { PaymentMethodByMerchantModel } from "@/data/models/PaymentMethodModel";
import { UserModel } from "@/data/models/UserModel";
import { Pagination } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { PaymentMethodCard } from "./PaymentMethodCard";

type MerchantUserListResponse = {
    data?:
        | UserModel[]
        | {
              items: UserModel[];
              pagination: Pagination;
          };
    pagination?: Pagination;
    status: number;
    errors?: string;
    message?: string;
    trxId?: string;
};

interface Props {
    merchant: MerchantDetailedModel;
    apiKey: string;
    handleOpenAssignModal: (
        targetType: "merchant" | "region" | "subMerchant",
        targetUid: string,
        targetLabel: string,
    ) => void;
    onRefreshApiKey: () => void;
    onCopyApiKey: () => void;
    apiKeyLoading?: boolean;
    apiKeyError?: string | null;
    paymentMethods?: PaymentMethodByMerchantModel[];
}

function CallbackUrlCard({ callbackUrl, label = "Callback URL" }: { callbackUrl?: string; label?: string }) {
    const hasValue = !!callbackUrl?.trim();

    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                        {label}
                    </p>
                </div>

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasValue ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${hasValue ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {hasValue ? "Configured" : "Not Set"}
                </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-foreground/4">
                <div className="flex items-start gap-3 px-3 py-3">
                    <div className="mt-0.5 shrink-0 text-foreground/40">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-2.122 2.121a4.5 4.5 0 01-6.364-6.364l1.757-1.757m3.182-1.061a4.5 4.5 0 016.364 6.364l-1.757 1.757m-2.121-6.364l-4.243 4.243"
                            />
                        </svg>
                    </div>

                    {hasValue ? (
                        <div className="min-w-0 flex-1">
                            <a
                                href={callbackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block break-all font-mono text-xs text-blue-600 hover:underline"
                            >
                                {callbackUrl}
                            </a>
                        </div>
                    ) : (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground/50">{label} is not available</p>
                            <p className="mt-1 text-xs text-foreground/40">
                                add endpoint {label} in edit merchant
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">{label}</p>
            <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
        </div>
    );
}

function Badge({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}

export default function MerchantHeader({
    merchant,
    apiKey,
    handleOpenAssignModal,
    onRefreshApiKey,
    onCopyApiKey,
    apiKeyLoading,
    apiKeyError,
    paymentMethods,
}: Props) {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [merchantUsers, setMerchantUsers] = useState<UserModel[]>([]);
    const [userPagination, setUserPagination] = useState<Pagination | null>(null);
    const [userPage, setUserPage] = useState(1);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "—");
    const regions = merchant.region ?? [];

    useEffect(() => {
        if (!showUserModal || !merchant.merchantUid) return;

        const controller = new AbortController();

        async function fetchMerchantUsers() {
            setUsersLoading(true);
            setUsersError(null);

            const params = new URLSearchParams({
                page: String(userPage),
                limit: "10",
                sort: "createdAt",
                order: "desc",
                searchBy: "merchantUid",
                q: merchant.merchantUid,
            });

            try {
                const response = await apiClient<MerchantUserListResponse>(`/api/user?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (response.errors) throw new Error(response.errors);

                const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
                const pagination = Array.isArray(response.data)
                    ? (response.pagination ?? null)
                    : (response.data?.pagination ?? response.pagination ?? null);

                setMerchantUsers(items);
                setUserPagination(pagination);
            } catch (error) {
                if (controller.signal.aborted) return;
                setMerchantUsers([]);
                setUserPagination(null);
                setUsersError(error instanceof Error ? error.message : "Failed to fetch merchant users");
            } finally {
                if (!controller.signal.aborted) setUsersLoading(false);
            }
        }

        void fetchMerchantUsers();

        return () => controller.abort();
    }, [merchant.merchantUid, showUserModal, userPage]);

    return (
        <div className="rounded-2xl border border-border overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 bg-primary w-full" />

            <div className="p-6 sm:p-8 space-y-8">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            {/* Back button */}
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="mr-2 p-2 rounded-full hover:bg-foreground/10 transition-colors"
                                aria-label="Kembali"
                            >
                                <svg
                                    className="w-5 h-5 text-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{merchant.merchantDesc}</h1>
                                <p className="text-sm text-foreground/50 font-mono">{merchant.merchantId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                            <Badge active={!!merchant.merchantUid} />

                            {/* Principal / Non-Principal badge */}
                            <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${merchant.status === "principal"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-blue-50 border-blue-200 text-blue-700"
                                    }`}
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    {merchant.status === "principal" ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                                        />
                                    )}
                                </svg>
                                {merchant.status === "principal" ? "Principal" : "Non-Principal"}
                            </div>

                            {/* isClient badge */}
                            <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${merchant.isClient === "N"
                                    ? "bg-violet-50 border-violet-200 text-violet-700"
                                    : "bg-orange-50 border-orange-200 text-orange-700"
                                    }`}
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    {merchant.isClient === "N" ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                        />
                                    )}
                                </svg>
                                {merchant.isClient === "Y" ? "Customer-Billed" : "Merchant-Billed"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
    <button
        type="button"
        onClick={() => {
            setUserPage(1);
            setShowUserModal(true);
        }}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
    >
        Show User
    </button>

    <button
        type="button"
        onClick={() => setShowBankModal(true)}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
    >
        Show Bank Account
    </button>

    <button
        onClick={() =>
            handleOpenAssignModal(
                "merchant",
                merchant.merchantUid,
                merchant.merchantDesc
            )
        }
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
    >
        Assign User
    </button>
    </div>

                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-2 border-t border-border">
                    <InfoItem label="Merchant ID" value={merchant.merchantId} />
                    <InfoItem label="Floating Fund" value={merchant.danaTalang === "Y" ? "Yes" : "No"} />
                    <InfoItem label="Product Name" value={merchant.productName || "-"} />
                    <InfoItem label="Registered" value={fmt(merchant.registrationDate)} />
                    <InfoItem label="Created At" value={fmt(merchant.createdAt)} />
                    <InfoItem label="Updated At" value={fmt(merchant.updatedAt)} />
                </div>

                {/* API Key */}
                <div className="rounded-xl border border-border bg-background p-4">
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                        API Key
                    </p>

                    <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-foreground/4 text-sm">
                        {/* Key icon */}
                        <div className="flex w-9 shrink-0 items-center justify-center border-r border-border text-foreground/40">
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                />
                            </svg>
                        </div>

                        {/* Key value */}
                        <code className="flex h-9 flex-1 items-center truncate px-3 font-mono text-xs text-foreground/70">
                            {apiKey || "—"}
                        </code>

                        {/* Copy button */}
                        <button
                            type="button"
                            onClick={onCopyApiKey}
                            className="flex h-9 shrink-0 items-center gap-1.5 border-l border-border px-3 text-[11px] font-medium text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground/80"
                        >
                            <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy
                        </button>

                        {/* Refresh button */}
                        <button
                            type="button"
                            onClick={onRefreshApiKey}
                            disabled={apiKeyLoading}
                            className="flex h-9 shrink-0 items-center gap-1.5 border-l border-border px-3.5 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                className={`h-3.5 w-3.5 ${apiKeyLoading ? "animate-spin" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            {apiKeyLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {/* Error */}
                    {apiKeyError && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5">
                            <svg
                                className="h-3.5 w-3.5 shrink-0 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                            <span className="text-xs text-red-600">{apiKeyError}</span>
                        </div>
                    )}
                </div>

                <CallbackUrlCard callbackUrl={merchant.callbackUrl} />
                <CallbackUrlCard callbackUrl={merchant.redirectUrl} label="Redirect URL" />

                {/* User cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { label: "Merchant User", user: merchant.userMerchant },
                        { label: "Created By", user: merchant.createdBy },
                    ].map(({ label, user }) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-foreground/2"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                                {user?.fullName?.[0] ?? "?"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5">
                                    {label}
                                </p>
                                <p className="text-sm font-semibold truncate">{user?.fullName || "—"}</p>
                                <p className="text-xs text-foreground/50 truncate">{user?.email || "—"}</p>
                            </div>
                            <div className="ml-auto shrink-0">
                                <Badge active={user?.isActive === "Y" || user?.isActive === "true"} />
                            </div>
                        </div>
                    ))}
                </div>

                                {/* Payment Methods */}
                {paymentMethods && paymentMethods.length > 0 && (
                    <div>
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                            Active Payment Methods
                        </p>

                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                            {paymentMethods
                                .filter((pm) => pm.isActive === "Y")
                                .map((pm) => (
                                    <PaymentMethodCard
                                        key={pm.paymentMethodUid}
                                        pm={pm}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Show User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    {/* Modal */}
                    <div className="w-full max-w-3xl rounded-xl border border-border bg-background shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Merchant Users
                                </h2>

                                <p className="mt-1 text-sm text-foreground/50">
                                    {merchant.merchantDesc}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                            {usersLoading ? (
                                <div className="flex min-h-[180px] items-center justify-center">
                                    <p className="text-sm text-foreground/40">Loading users...</p>
                                </div>
                            ) : usersError ? (
                                <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-red-100 bg-red-50 px-4 text-center">
                                    <p className="text-sm text-red-600">{usersError}</p>
                                </div>
                            ) : merchantUsers.length === 0 ? (
                                <div className="flex min-h-[180px] items-center justify-center">
                                    <p className="text-sm text-foreground/40">No user data available.</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-border">
                                    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-3 border-b border-border bg-foreground/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                                        <span>User</span>
                                        <span>Email</span>
                                        <span>Phone</span>
                                        <span>Status</span>
                                    </div>
                                    {merchantUsers.map((user) => (
                                        <div
                                            key={user.userUid}
                                            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{user.fullName || "—"}</p>
                                                <p className="truncate text-xs text-foreground/45">@{user.userName || "—"}</p>
                                            </div>
                                            <p className="truncate text-sm text-foreground/60" title={user.email}>{user.email || "—"}</p>
                                            <p className="truncate text-sm text-foreground/60">{user.phone || "—"}</p>
                                            <Badge active={user.isActive === "Y"} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
                            <p className="text-xs text-foreground/40">
                                {userPagination
                                    ? `Page ${userPagination.page} of ${userPagination.totalPages} · ${userPagination.total} users`
                                    : ""}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setUserPage((page) => Math.max(1, page - 1))}
                                    disabled={usersLoading || !userPagination?.hasPrev}
                                    className="rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserPage((page) => page + 1)}
                                    disabled={usersLoading || !userPagination?.hasNext}
                                    className="rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5"
                            >
                                Close
                            </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Show Bank Account Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    {/* Modal */}
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">Bank Accounts</h2>
                                <p className="mt-1 text-sm text-foreground/50">{merchant.merchantDesc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBankModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                            <div className="space-y-3">
                                {/* Merchant Bank */}
                                <div className="rounded-lg border border-border bg-foreground/4 px-4 py-3">
                                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40">
                                        Merchant Bank
                                    </p>
                                    <p className="text-sm font-medium text-foreground">{merchant.bankName || "—"}</p>
                                    <p className="mt-0.5 font-mono text-xs text-foreground/60">{merchant.bankNoRek || "—"}</p>
                                </div>

                                {/* Region Bank */}
                                {regions.length === 0 ? (
                                    <div className="rounded-lg border border-border bg-foreground/4 px-4 py-3">
                                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40">
                                            Region Bank
                                        </p>
                                        <p className="text-sm text-foreground/50 italic">No region data available</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {regions.map((region) => (
                                            <div
                                                key={region.regionUid}
                                                className="rounded-lg border border-border bg-foreground/4 px-4 py-3"
                                            >
                                                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40">
                                                    Region Bank
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {region.regionId} – {region.regionDesc}
                                                </p>
                                                <p className="mt-0.5 text-xs text-foreground/60">{region.bankName || "—"}</p>
                                                <p className="mt-0.5 font-mono text-xs text-foreground/40">{region.bankNoRek || "—"}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
