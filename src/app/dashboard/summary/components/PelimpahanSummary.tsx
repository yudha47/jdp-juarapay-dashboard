"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ReportPelimpahanModel } from "@/data/models/ReportPelimpahanModel";

type StatusKey = "pending" | "done" | "failed";

type GroupedStatus = {
    status: StatusKey;
    total: number;
    items: {
        bank: string;
        categoryDesc: string;
        counts: number;
    }[];
};

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock,
        countColor: "text-amber-600",
        border: "border-amber-200",
        headerBg: "bg-gradient-to-br from-amber-50 to-orange-50",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        accent: "#f59e0b",
    },
    done: {
        label: "Done",
        icon: CheckCircle2,
        countColor: "text-emerald-600",
        border: "border-emerald-200",
        headerBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        accent: "#10b981",
    },
    failed: {
        label: "Failed",
        icon: XCircle,
        countColor: "text-red-600",
        border: "border-red-200",
        headerBg: "bg-gradient-to-br from-red-50 to-rose-50",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        accent: "#ef4444",
    },
} satisfies Record<StatusKey, object>;

const STATUS_ORDER: StatusKey[] = ["pending", "done", "failed"];

/**
 * Backend returns two kinds of rows per pelimpahan status:
 *   1. Aggregate row  → bank: "", categoryDesc: "" → use `counts` as the group total
 *   2. Detail row     → bank: "BCA", categoryDesc: "Virtual Account" → breakdown items
 *
 * When ALL counts are 0 (e.g. no filter applied yet), fall back to summing
 * detail rows so the cards still render correctly.
 */
function groupPelimpahanData(items: ReportPelimpahanModel[]): GroupedStatus[] {
    const map = new Map<StatusKey, GroupedStatus>();

    // First pass: build groups
    for (const item of items) {
        const status = item.pelimpahan as StatusKey;
        if (!STATUS_CONFIG[status]) continue;

        if (!map.has(status)) {
            map.set(status, { status, total: 0, items: [] });
        }

        const group = map.get(status)!;

        const isAggregateRow = !item.bank && !item.categoryDesc;

        if (isAggregateRow) {
            // This row carries the authoritative total from the backend
            group.total = item.counts;
        } else {
            group.items.push({
                bank: item.bank,
                categoryDesc: item.categoryDesc,
                counts: item.counts,
            });
        }
    }

    // Second pass: if aggregate row total is 0 but detail rows have data,
    // derive total from detail rows (handles edge-case where backend omits aggregate)
    for (const group of map.values()) {
        if (group.total === 0 && group.items.some((i) => i.counts > 0)) {
            group.total = group.items.reduce((sum, i) => sum + i.counts, 0);
        }
        group.items.sort((a, b) => b.counts - a.counts);
    }

    return STATUS_ORDER.filter((s) => map.has(s)).map((s) => map.get(s)!);
}


const LIMIT = 5;

function PelimpahanCard({ group }: { group: GroupedStatus }) {
    const [open, setOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const cfg = STATUS_CONFIG[group.status];
    const Icon = cfg.icon;
    const visibleItems = showAll ? group.items : group.items.slice(0, LIMIT);
    const hasMore = group.items.length > LIMIT;
    const maxCount = group.items[0]?.counts ?? 1;

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl border bg-white
                shadow-sm transition-all duration-300
                hover:shadow-md hover:-translate-y-0.5
                ${cfg.border}
            `}
        >
            {/* Accent top bar */}
            <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: cfg.accent }}
            />

            {/* Header */}
            <div className={`${cfg.headerBg} px-5 pt-5 pb-4`}>
                <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${cfg.iconColor}`} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                            {cfg.label}
                        </p>
                        <p className={`text-3xl font-bold leading-none mt-0.5 ${cfg.countColor}`}>
                            {group.total.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expand toggle — only shown when there are detail items */}
            {group.items.length > 0 ? (
                <>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                        <span className="text-xs font-medium text-slate-400">
                            {group.items.length} payment method
                        </span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {open && (
                        <div className="border-t border-slate-100">
                            {visibleItems.map((item, i) => {
                                const barPct = maxCount > 0 ? Math.round((item.counts / maxCount) * 100) : 0;
                                return (
                                    <div
                                        key={i}
                                        className="px-5 py-2.5 transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate text-sm font-semibold text-slate-700">
                                                    {item.bank || "—"}
                                                </span>
                                                <span className="text-xs text-slate-400 truncate">
                                                    {item.categoryDesc || "—"}
                                                </span>
                                            </div>
                                            <span className={`shrink-0 text-sm font-bold tabular-nums ${cfg.countColor}`}>
                                                {item.counts.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                        {/* Mini progress bar */}
                                        {/* <div className="h-1 w-full rounded-full bg-slate-100">
                                            <div
                                                className="h-1 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${barPct}%`,
                                                    background: cfg.accent,
                                                    opacity: 0.6,
                                                }}
                                            />
                                        </div> */}
                                    </div>
                                );
                            })}

                            {hasMore && (
                                <button
                                    onClick={() => setShowAll((v) => !v)}
                                    className="flex w-full items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-medium transition-colors hover:bg-slate-50 border-t border-slate-100"
                                    style={{ color: cfg.accent }}
                                >
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
                                    />
                                    {showAll
                                        ? "Sembunyikan"
                                        : `Lihat ${group.items.length - LIMIT} lainnya`}
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="px-5 py-3 border-t border-slate-100">
                    <p className="text-xs italic text-slate-400">Tidak ada detail tersedia</p>
                </div>
            )}
        </div>
    );
}

type Props = {
    data: ReportPelimpahanModel[];
    loading?: boolean;
    error?: string | null;
};

export function PelimpahanSummary({ data, loading, error }: Props) {
    const grouped = useMemo(() => groupPelimpahanData(data), [data]);

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {STATUS_ORDER.map((s) => (
                        <div key={s} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (!grouped.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                <p className="text-sm text-slate-400">Data pelimpahan tidak tersedia</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-slate-700">Summary Status Delegation</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {grouped.map((group) => (
                    <PelimpahanCard key={group.status} group={group} />
                ))}
            </div>
        </div>
    );
}