/* eslint-disable @next/next/no-img-element */
import { fmt, fmtDate, StatusBadge } from "../request-settlement-super-content";
import { sendToLabel } from "../request-settlement-content";
import { WithdrawModel } from "../../../../data/models/WithdrawModel";
import { useWithdraw } from "../../../../hooks/useWithdraw";

// ─── Helper Components ────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <>
            <span className="text-gray-400 text-xs">{label}</span>
            <span className="text-right text-gray-700 text-xs break-all">{value ?? "—"}</span>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">{title}</h3>
            {children}
        </div>
    );
}

function safeDate(val: string | null | undefined): React.ReactNode {
    if (!val) return "—";
    try {
        return fmtDate(val);
    } catch {
        return val;
    }
}

// ─── View Modal Super ─────────────────────────────────────────────────────────
export function ViewModalSuper({ record, onClose }: { record: WithdrawModel; onClose: () => void }) {
    const { data: detail, loading, error } = useWithdraw(record.withdrawUid, { enabled: !!record.withdrawUid });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-slate-50 to-white shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Withdrawal Details</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <svg className="h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-xs text-gray-400">Fetching withdrawal details…</span>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Detail */}
                    {!loading && detail && (
                        <>
                            {/* Amount & Status */}
                            <div className="rounded-xl bg-slate-50 p-4 border border-gray-100 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">Amount</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {detail.amount != null ? fmt(detail.amount) : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">Status</span>
                                    {detail.status ? (
                                        <StatusBadge status={detail.status} />
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </div>
                            </div>

                            {/* Withdrawal Info */}
                            <Section title="Withdrawal Information">
                                <div className="grid grid-cols-2 gap-y-3">
                                    <Row label="Request Time" value={safeDate(detail.requestTime)} />
                                    <Row label="Settlement Date" value={safeDate(detail.settlementDate)} />
                                    <Row label="SEND TO" value={sendToLabel(detail.isMerchant)} />
                                    <Row label="Created At" value={safeDate(detail.createdAt)} />
                                    <Row label="Updated At" value={safeDate(detail.updatedAt)} />
                                </div>
                            </Section>

                            {/* Merchant Info — full fields */}
                            <Section title="Merchant">
                                {!detail.merchant ? (
                                    <p className="text-xs text-gray-400">No merchant data available.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <Row label="Name" value={detail.merchant.merchantDesc ?? "—"} />
                                        <Row
                                            label="Merchant ID"
                                            value={
                                                detail.merchant.merchantId ? (
                                                    <span className="font-mono">{detail.merchant.merchantId}</span>
                                                ) : (
                                                    "—"
                                                )
                                            }
                                        />
                                        <Row
                                            label="Status"
                                            value={
                                                detail.merchant.status ? (
                                                    <span className="capitalize">{detail.merchant.status}</span>
                                                ) : (
                                                    "—"
                                                )
                                            }
                                        />
                                        <Row label="Floating Fund" value={detail.merchant.danaTalang ?? "—"} />
                                        <Row label="Is Client" value={detail.merchant.isClient ?? "—"} />
                                        <Row label="Bank Name" value={detail.merchant.bankName ?? "—"} />
                                        <Row label="Bank Account Number" value={detail.merchant.bankNoRek ?? "—"} />
                                        <Row
                                            label="Registration Date"
                                            value={detail.merchant.registrationDate ?? "—"}
                                        />

                                        <Row label="Created At" value={safeDate(detail.merchant.createdAt)} />
                                        <Row label="Updated At" value={safeDate(detail.merchant.updatedAt)} />
                                    </div>
                                )}
                            </Section>

                            {/* Region Info — full fields */}
                            <Section title="Region">
                                {!detail.region ? (
                                    <p className="text-xs text-gray-400">No region data available.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <Row label="Name" value={detail.region.regionDesc ?? "—"} />
                                        <Row
                                            label="Region ID"
                                            value={
                                                detail.region.regionId ? (
                                                    <span className="font-mono">{detail.region.regionId}</span>
                                                ) : (
                                                    "—"
                                                )
                                            }
                                        />

                                        <Row label="Bank Name" value={detail.region.bankName ?? "—"} />
                                        <Row label="Bank Account Number" value={detail.region.bankNoRek ?? "—"} />

                                        <Row label="Created At" value={safeDate(detail.region.createdAt)} />
                                        <Row label="Updated At" value={safeDate(detail.region.updatedAt)} />
                                    </div>
                                )}
                            </Section>

                            {/* Bukti — show both buktiDir and buktiTrf */}
                            <Section title="Bukti">
                                <div className="flex flex-col gap-3">

                                    {detail.buktiTrf ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-400">Bukti Transfer</span>
                                            <a
                                                href={detail.buktiTrf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative block overflow-hidden rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                                            >
                                                <img
                                                    src={detail.buktiTrf}
                                                    alt="Bukti Transfer"
                                                    className="w-full max-h-48 object-cover"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                                    }}
                                                />
                                                <div className="hidden items-center gap-2 px-3 py-2.5 text-xs text-blue-600">
                                                    <svg
                                                        className="h-3.5 w-3.5 shrink-0"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                        />
                                                    </svg>
                                                    {detail.buktiTrf}
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                                    <span className="scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow">
                                                        Open full image ↗
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    ) : (
                                        !detail.buktiDir && (
                                            <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-sm text-gray-400">
                                                Belum ada bukti transfer
                                            </div>
                                        )
                                    )}
                                </div>
                            </Section>

                            {/* Transaction List — with externalTrxId column */}
                            <Section title={`Transactions (${detail.listTrx?.length ?? 0})`}>
                                {!detail.listTrx || detail.listTrx.length === 0 ? (
                                    <p className="text-xs text-gray-400">No transactions linked.</p>
                                ) : (
                                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-120 text-xs">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                                        <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                                                            Trx Number
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                                                            External ID
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                                                            Sub Merchant
                                                        </th>
                                                        <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                                                            Nett Profit
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {detail.listTrx.map((trx, i) => (
                                                        <tr key={trx.transactionUid ?? i} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2.5 font-mono text-gray-700 whitespace-nowrap">
                                                                {trx.transactionNumber ?? "—"}
                                                            </td>
                                                            <td className="px-4 py-2.5 font-mono text-gray-500 whitespace-nowrap">
                                                                {trx.externalTrxId ?? "—"}
                                                            </td>
                                                            <td className="px-4 py-2.5 whitespace-nowrap">
                                                                {trx.subMerchantDesc ? (
                                                                    <span className="text-gray-700">
                                                                        {trx.subMerchantDesc}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                                                                {trx.nettProfit != null ? fmt(trx.nettProfit) : "—"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t border-gray-100 bg-gray-50">
                                                        <td
                                                            colSpan={3}
                                                            className="px-4 py-2.5 text-gray-500 font-medium whitespace-nowrap"
                                                        >
                                                            Total
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                                                            {fmt(
                                                                detail.listTrx.reduce(
                                                                    (sum, t) => sum + (t.nettProfit ?? 0),
                                                                    0,
                                                                ),
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </Section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end bg-white shrink-0">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
