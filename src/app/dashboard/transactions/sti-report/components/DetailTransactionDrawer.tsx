import { DetailTransactionDrawerSkeleton } from "@/components/shared/BreadcrumbDrawerDetail";
import { TransactionModel } from "@/data/models/TransactionModel";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { useTransaction } from "@/hooks/useTransaction";
import { useUser } from "@/hooks/useUsers";
import { getLoggedInRole } from "@/lib/auth";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import { UpdatePelimpahanButton } from "./UpdatePelimpahanModal";
import { PelimpahanStatus } from "../page";
import { ResetWebhookButton } from "./ResetWebhookModal";
import { ProfitBreakdown, cleanFloat, useActivePpnPercent } from "../../transaction-list/components/DetailTransactionDrawer";

function StatusBadge({ status, category }: { status: string; category?: string }) {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
        SUCCESS: {
            bg: "bg-emerald-50 border border-emerald-200",
            text: "text-emerald-700",
            dot: "bg-emerald-500",
        },
        PENDING: {
            bg: "bg-amber-50 border border-amber-200",
            text: "text-amber-700",
            dot: "bg-amber-400",
        },
        FAILED: {
            bg: "bg-red-50 border border-red-200",
            text: "text-red-700",
            dot: "bg-red-500",
        },
    };

    const key = status?.toUpperCase().trim();
    const roleDesc = getLoggedInRole()?.roleDesc?.toLowerCase();
    const showEmLabel = roleDesc === "super admin" || roleDesc === "dev";
    const isEM = showEmLabel && category?.trim().toLowerCase() === "electronic money";

    let label = status;
    if (isEM && key === "PAID") label = "Paid (Settle)";
    else if (isEM && key === "PENDING") label = "Pending (Not Settle)";
    else if (isEM && key === "PENDING-PAID") label = "Pending Paid (Not Settle)";
    else if (key === "PAID") label = "Paid";

    const s = map[key] ?? {
        bg: "bg-slate-100 border border-slate-200",
        text: "text-slate-600",
        dot: "bg-slate-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {label}
        </span>
    );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <span className={`text-sm text-slate-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>
                {value ?? <span className="text-slate-300 italic">—</span>}
            </span>
        </div>
    );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className={`px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 ${accent ?? "bg-slate-50"}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
        </div>
    );
}

function ColSpan({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="col-span-2">
            <Field label={label} value={value} mono={mono} />
        </div>
    );
}

type DetailDrawerProps = {
    onClose: () => void;
    data?: TransactionModel;
    onRefetch: () => void;
    onUpdatePelimpahan: (uids: string[], status: PelimpahanStatus) => Promise<void>;
    pelimpahanLoading?: boolean;
    onResetWebhook: (transactionUid: string) => Promise<void>;
    resetWebhookLoading?: boolean;
};

export function DetailTransactionDrawer({ onClose, data, onRefetch, onUpdatePelimpahan, pelimpahanLoading, onResetWebhook,
    resetWebhookLoading, }: DetailDrawerProps) {
    const role = getLoggedInRole();
    const isSuperAdmin = role?.roleDesc?.toLowerCase() === "super admin" || role?.roleDesc?.toLowerCase() === "dev";
    const isAdmin = role?.roleDesc?.toLowerCase() === "admin";

    // Tab definitions — overview is shown to everyone, the rest only to super admin
    const allTabs = [
        { key: "overview", label: "Overview" },
        { key: "fee", label: "Fee" },
        { key: "price", label: "Price" },
        { key: "system", label: "System" },
        { key: "profit", label: "Profit" },
    ] as const;

    type TabKey = (typeof allTabs)[number]["key"];

    const visibleTabs = allTabs.filter((t) => t.key === "overview" || isSuperAdmin);

    const [tab, setTab] = useState<TabKey>("overview");

    const transactionUid = data?.transactionUid;

    const { data: transactionData, loading: transactionLoading } = useTransaction(transactionUid);
    const canResetWebhook =
        isSuperAdmin || (isAdmin && transactionData?.statusWebhook?.toUpperCase() === "FAILED");

    const createdBy = transactionData?.fee?.createdBy;
    const paymentMethodUid = transactionData?.paymentMethodUid ?? "";

    const shouldLoadCreatedBy = !!createdBy;
    const shouldLoadPaymentMethod = !!paymentMethodUid;

    const { data: createdByUser, loading: createdByUserLoading } = useUser(createdBy, { enabled: shouldLoadCreatedBy });

    const { data: paymentMethod, loading: paymentMethodLoading } = usePaymentMethod(paymentMethodUid, {
        enabled: shouldLoadPaymentMethod,
    });

    const ppnPercent = useActivePpnPercent(isSuperAdmin);

    const [hasEverBeenReady, setHasEverBeenReady] = useState(false);

    const isAllDataReady =
        !transactionLoading &&
        !!transactionData &&
        (!shouldLoadCreatedBy || !createdByUserLoading) &&
        (!shouldLoadPaymentMethod || !paymentMethodLoading);

    if (isAllDataReady && !hasEverBeenReady) {
        setHasEverBeenReady(true);
    }

    if (!hasEverBeenReady) {
        return <DetailTransactionDrawerSkeleton onClose={onClose} />;
    }

    if (!transactionData) {
        return <div>Transaction tidak ditemukan</div>;
    }

    // Paylater customer info shorthand
    const paylater = transactionData.details?.paylater;
    const em = transactionData.details?.em;

    return (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">

            <div className="overlay-in absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

            <div className="drawer-in drawer-root relative w-full max-w-110 bg-slate-50 shadow-2xl flex flex-col h-full">
                {/* ── Header ── */}
                <div className="bg-white border-b border-slate-100 px-5 pt-5 pb-0 shrink-0">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                Transaction Detail
                            </p>
                            <h2 className="text-base font-bold text-slate-900 mono">
                                {transactionData.transactionNumber}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={transactionData.status} category={paymentMethod?.category?.catDesc} />

                            <button
                                onClick={onClose}
                                className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="mb-5 flex items-end justify-between gap-3">
                        <div>
                            {transactionData.pelimpahan && (
                                <PelimpahanBadge status={transactionData.pelimpahan} />
                            )}
                            <WebhookBadge status={transactionData.statusWebhook} />
                            <p className="text-[10px] mt-3 font-semibold uppercase tracking-widest text-slate-400 mb-1">
                                Total Amount
                            </p>
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">
                                {formatCurrency(cleanFloat(transactionData.amountTotal))}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* ── Pelimpahan badge ── */}

                            {isSuperAdmin && (
                                <UpdatePelimpahanButton
                                    transactionUid={transactionData.transactionUid}
                                    currentStatus={transactionData.pelimpahan}
                                    onSubmit={onUpdatePelimpahan}
                                    loading={pelimpahanLoading}
                                />
                            )}
                            {canResetWebhook && (
                                <ResetWebhookButton
                                    transactionUid={transactionData.transactionUid}
                                    onConfirm={onResetWebhook}
                                    loading={resetWebhookLoading}
                                />
                            )}
                            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                    Nett Profit
                                </p>
                                <p className="text-xl font-bold text-slate-700">
                                    {formatCurrency(cleanFloat(transactionData.nettProfit))}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="flex gap-0">
                        {visibleTabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-2.5 text-xs transition-all ${tab === t.key ? "tab-active" : "tab-inactive"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {/* ───────────────────────────────── OVERVIEW ─────────────────────────────── */}
                    {tab === "overview" && (
                        <>
                            <Section title="Payment Info">
                                <Field label="Payment Date" value={formatDate(transactionData.paymentDate)} />
                                <Field label="Type" value={transactionData.typeTrx} />
                                {/* channelId is now directly on the transaction model */}
                                <Field label="Channel" value={transactionData.channelId ?? paymentMethod?.channelId} />
                                <ColSpan label="VA Number" value={transactionData.vaNumber} mono />
                                <ColSpan label="Payment Code" value={transactionData.paymentCode} mono />
                                <ColSpan label="Payment NTB" value={transactionData.paymentNtb} mono />
                                <ColSpan label="Ext. Payment Code" value={transactionData.extPaymentCode} mono />
                                <Field label="Ext. Status" value={transactionData.extStatus} />
                                <Field label="Payment ID" value={transactionData.paymentId} mono />
                                <ColSpan label="Partner Svc" value={transactionData.partnerServiceId} mono />
                                {/* custTrxId — useful for merchant to track their own order reference */}
                                <ColSpan label="Customer Trx ID" value={transactionData.custTrxId} mono />
                            </Section>

                            <Section title="Merchant Info">
                                <Field label="Merchant ID" value={transactionData.merchantId} mono />
                                <Field label="Sub Merchant" value={transactionData.subMerchantId} mono />
                                <Field label="Region" value={transactionData.regionId} />
                                <Field label="Device ID" value={transactionData.deviceId} mono />
                            </Section>

                            <Section title="Timeline">
                                <Field label="Transaction Date" value={formatDate(transactionData.transactionDate)} />
                                <Field label="Payment ISO" value={formatDate(transactionData.datetimePaymentIso)} />
                                <Field label="Expires" value={formatDate(transactionData.transactionExp)} />
                                <Field label="Created At" value={formatDate(transactionData.createdAt)} />
                                <Field label="Updated At" value={formatDate(transactionData.updatedAt)} />
                            </Section>

                            {/* ── Paylater Customer Info — visible to all roles (merchant needs this) ── */}
                            {paylater?.customerName && (
                                <Section title="Customer Info">
                                    <Field label="Name" value={paylater.customerName} />
                                    <Field label="Email" value={paylater.customerEmail} />
                                    <Field label="Phone" value={paylater.customerPhone} />
                                    <ColSpan
                                        label="Address"
                                        value={[
                                            paylater.customerBillAddress,
                                            paylater.customerBillCity,
                                            paylater.customerBillState,
                                            paylater.customerBillZipCode,
                                            paylater.customerBillCountry,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    />
                                </Section>
                            )}

                            {/* ── Item Details — visible to all roles ── */}
                            {paylater?.itemDetails && paylater.itemDetails.length > 0 && (
                                <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                            Item Details
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {paylater.itemDetails.map((item, idx) => (
                                            <div key={idx} className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                                                <ColSpan label={`Item ${idx + 1}`} value={item.itemName} />
                                                <Field label="Item ID" value={item.itemId} mono />
                                                <Field label="Type" value={item.itemType} />
                                                <Field label="Qty" value={item.quantity} />
                                                <Field label="Price" value={formatCurrency(item.price)} />
                                                <Field label="Total" value={formatCurrency(item.totalPrice)} />
                                                {item.itemURL && (
                                                    <ColSpan
                                                        label="URL"
                                                        value={
                                                            <a
                                                                href={item.itemURL}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-600 underline underline-offset-2 text-xs"
                                                            >
                                                                {item.itemURL}
                                                            </a>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ───────────────────────────────── FEE (super admin only) ────────────────── */}
                    {tab === "fee" && isSuperAdmin && (
                        <Section title="Fee Configuration">
                            <Field
                                label="Fee Amount"
                                value={
                                    transactionData.fee.isPercentage === "Y"
                                        ? `${transactionData.fee.fee}%`
                                        : formatCurrency(transactionData.fee.fee)
                                }
                            />
                            <Field label="Is Percentage" value={transactionData.fee.isPercentage} />
                            <Field label="Is Active" value={transactionData.fee.isActive} />
                            <Field label="Created By" value={createdByUser?.email} />
                            <ColSpan label="Fee UID" value={transactionData.fee.feeUid} mono />
                            <ColSpan label="Payment Method" value={paymentMethod?.bank} mono />
                            <Field label="Category" value={paymentMethod?.category?.catDesc} mono />
                            <Field label="Payment Gateway" value={paymentMethod?.pgate?.pgDesc} mono />
                            <Field label="Created At" value={formatDate(transactionData.fee.createdAt)} />
                            <Field label="Updated At" value={formatDate(transactionData.fee.updatedAt)} />
                        </Section>
                    )}

                    {/* ───────────────────────────────── PRICE (super admin only) ──────────────── */}
                    {tab === "price" && isSuperAdmin && (
                        <Section title="Price Configuration">
                            <Field
                                label="Price"
                                value={
                                    transactionData.price.isPercentage === "Y"
                                        ? `${transactionData.price.price}%`
                                        : formatCurrency(transactionData.price.price)
                                }
                            />
                            <Field
                                label="Price History"
                                value={
                                    transactionData.price.isPercentage === "Y"
                                        ? `${transactionData.price.priceHistory}%`
                                        : formatCurrency(transactionData.price.priceHistory)
                                }
                            />
                            <Field label="Is Percentage" value={transactionData.price.isPercentage} />
                            <Field label="Is Active" value={transactionData.price.isActive} />
                            <Field label="Created By" value={transactionData.price.createdBy} />
                            <ColSpan label="Price UID" value={transactionData.price.priceUid} mono />
                            <ColSpan label="Merchant UID" value={transactionData.price.merchantUid} mono />
                            <ColSpan label="Payment Method UID" value={transactionData.price.paymentMethodUid} mono />
                            <Field label="Created At" value={formatDate(transactionData.price.createdAt)} />
                            <Field label="Updated At" value={formatDate(transactionData.price.updatedAt)} />
                        </Section>
                    )}

                    {/* ───────────────────────────────── PROFIT (super admin only) ─────────────── */}
                    {tab === "profit" && isSuperAdmin && (
                        <ProfitBreakdown transactionData={transactionData} ppnPercent={ppnPercent} />
                    )}

                    {/* ───────────────────────────────── SYSTEM (super admin only) ─────────────── */}
                    {tab === "system" && isSuperAdmin && (
                        <>
                            <Section title="Card / EDC Info">
                                <Field label="Card No" value={em?.cardNo} mono />
                                <Field label="Card Type" value={em?.cardType} />
                                <Field label="Bank MID" value={em?.bankMid} mono />
                                <Field label="Bank TID" value={em?.bankTid} mono />
                                <Field label="Trans Counter" value={em?.transCounter} mono />
                                <ColSpan label="Response" value={em?.respon} />
                            </Section>

                            <Section title="File & FTP">
                                <ColSpan label="Filename" value={em?.filename} mono />
                                <ColSpan label="Incoming FTP Path" value={em?.incomingFileFTP} mono />
                            </Section>

                            <Section title="Transaction Log">
                                <ColSpan
                                    label="Log"
                                    value={<span className="text-slate-600 leading-relaxed">{em?.transLog}</span>}
                                />
                            </Section>

                            <Section title="Raw Identifiers">
                                <ColSpan label="Transaction UID" value={transactionData.transactionUid} mono />
                                <ColSpan label="External Trx ID" value={transactionData.externalTrxId} mono />
                                <ColSpan label="Payment Method UID" value={transactionData.paymentMethodUid} mono />
                                <ColSpan label="Withdraw UID" value={transactionData.withdrawUid} mono />
                            </Section>
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="shrink-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                            Last Updated
                        </p>
                        <p className="text-xs text-slate-600 font-medium">{formatDate(transactionData.updatedAt)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    function PelimpahanBadge({ status }: { status?: string | null }) {
        if (!status) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    N/A
                </span>
            );
        }

        const map: Record<string, { bg: string; text: string; dot: string }> = {
            DONE: {
                bg: "bg-emerald-50 border border-emerald-200",
                text: "text-emerald-700",
                dot: "bg-emerald-500",
            },
            PENDING: {
                bg: "bg-amber-50 border border-amber-200",
                text: "text-amber-700",
                dot: "bg-amber-400",
            },
            FAILED: {
                bg: "bg-red-50 border border-red-200",
                text: "text-red-700",
                dot: "bg-red-500",
            },
        };

        const s = map[status?.toUpperCase()] ?? {
            bg: "bg-slate-100 border border-slate-200",
            text: "text-slate-600",
            dot: "bg-slate-400",
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                Delegation: {status}
            </span>
        );
    }

    function WebhookBadge({ status }: { status?: string | null }) {
        if (!status) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    N/A
                </span>
            );
        }

        const map: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
            SENT: {
                bg: "bg-emerald-50 border border-emerald-200",
                text: "text-emerald-700",
                dot: "bg-emerald-500",
            },
            PENDING: {
                bg: "bg-amber-50 border border-amber-200",
                text: "text-amber-700",
                dot: "bg-amber-400",
            },
            FAILED: {
                bg: "bg-red-50 border border-red-200",
                text: "text-red-700",
                dot: "bg-red-500",
            },
            APPJPAY: {
                bg: "bg-violet-50 border border-violet-200",
                text: "text-violet-700",
                dot: "bg-violet-500",
                label: "via juaraPay",
            },
        };

        const s = map[status?.toUpperCase()] ?? {
            bg: "bg-slate-100 border border-slate-200",
            text: "text-slate-600",
            dot: "bg-slate-400",
        };

        return (
            <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                Webhook: {s.label ?? status}
            </span>
        );
    }
}

