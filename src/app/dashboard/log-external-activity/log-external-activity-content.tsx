"use client";

import { useState, useMemo } from "react";
import { DataTable } from "../../../components/shared/datatable/DataTable";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogSource = "POS App" | "Payment Gateway" | "Internal System";
type LogDirection = "Inbound" | "Outbound";
type LogEvent =
    | "Create Transaction"
    | "Update Status"
    | "Callback"
    | "Refund Request"
    | "Settlement"
    | "Auth Request"
    | "Auth Response"
    | "Webhook";
type LogStatus = "Success" | "Failed";

type LogRow = {
    id: string;
    source: LogSource;
    direction: LogDirection;
    event: LogEvent;
    internalRef: string;
    pgRef: string;
    ticketRef?: string;
    payloadSummary: string;
    merchant: string;
    paymentGateway: string;
    status: LogStatus;
    timestamp: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOGS: LogRow[] = [
    {
        id: "LOG-001",
        source: "POS App",
        direction: "Inbound",
        event: "Create Transaction",
        internalRef: "TRX-20240601-001",
        pgRef: "—",
        merchant: "PT Maju Jaya",
        paymentGateway: "PG_BAYARIND",
        payloadSummary: 'amount=150000, method="QRIS", merchant_id="M****23"',
        status: "Success",
        timestamp: "2024-06-01T09:12:34Z",
    },
    {
        id: "LOG-002",
        source: "Payment Gateway",
        direction: "Outbound",
        event: "Auth Request",
        internalRef: "TRX-20240601-001",
        pgRef: "PG-XND-8821",
        merchant: "PT Maju Jaya",
        paymentGateway: "PG_XENDIT",
        payloadSummary: 'amount=150000, currency="IDR", pg_token="***XT**"',
        status: "Success",
        timestamp: "2024-06-01T09:12:36Z",
    },
    {
        id: "LOG-003",
        source: "Payment Gateway",
        direction: "Inbound",
        event: "Auth Response",
        internalRef: "TRX-20240601-001",
        pgRef: "PG-XND-8821",
        merchant: "PT Maju Jaya",
        paymentGateway: "PG_XENDIT",
        payloadSummary: 'status="PAID", code=200, ref="XND***821"',
        status: "Success",
        timestamp: "2024-06-01T09:12:40Z",
    },
    {
        id: "LOG-004",
        source: "POS App",
        direction: "Inbound",
        event: "Create Transaction",
        internalRef: "TRX-20240601-002",
        pgRef: "—",
        merchant: "Toko Makmur",
        paymentGateway: "PG_MIDTRANS",
        payloadSummary: 'amount=75000, method="VA_BCA", merchant_id="M****97"',
        status: "Failed",
        timestamp: "2024-06-01T10:05:21Z",
    },
    {
        id: "LOG-005",
        source: "Payment Gateway",
        direction: "Outbound",
        event: "Auth Request",
        internalRef: "TRX-20240601-002",
        pgRef: "PG-MDT-3341",
        merchant: "Toko Makmur",
        paymentGateway: "PG_MIDTRANS",
        payloadSummary: 'amount=75000, currency="IDR", va="****0012"',
        status: "Failed",
        timestamp: "2024-06-01T10:05:23Z",
    },
    {
        id: "LOG-006",
        source: "Payment Gateway",
        direction: "Inbound",
        event: "Callback",
        internalRef: "TRX-20240601-002",
        pgRef: "PG-MDT-3341",
        ticketRef: "TKT-2024-0045",
        merchant: "Toko Makmur",
        paymentGateway: "PG_MIDTRANS",
        payloadSummary: 'status="TIMEOUT", code=504, retry=3',
        status: "Failed",
        timestamp: "2024-06-01T10:05:55Z",
    },
    {
        id: "LOG-007",
        source: "Internal System",
        direction: "Outbound",
        event: "Update Status",
        internalRef: "TRX-20240601-002",
        pgRef: "PG-MDT-3341",
        ticketRef: "TKT-2024-0045",
        merchant: "Toko Makmur",
        paymentGateway: "PG_MIDTRANS",
        payloadSummary: 'trx_status="FAILED", notified_merchant=true',
        status: "Success",
        timestamp: "2024-06-01T10:06:01Z",
    },
    {
        id: "LOG-008",
        source: "POS App",
        direction: "Inbound",
        event: "Refund Request",
        internalRef: "TRX-20240531-099",
        pgRef: "PG-BYR-9901",
        ticketRef: "TKT-2024-0042",
        merchant: "PT Sejahtera Abadi",
        paymentGateway: "PG_BAYARIND",
        payloadSummary: 'refund_amount=200000, reason="CUSTOMER_REQUEST"',
        status: "Success",
        timestamp: "2024-06-01T11:30:10Z",
    },
    {
        id: "LOG-009",
        source: "Payment Gateway",
        direction: "Outbound",
        event: "Settlement",
        internalRef: "SETTLE-20240601-001",
        pgRef: "PG-XND-SETTLE-001",
        merchant: "PT Maju Jaya",
        paymentGateway: "PG_XENDIT",
        payloadSummary: 'batch_id="S****01", total_trx=12, amount=1800000',
        status: "Success",
        timestamp: "2024-06-01T14:00:05Z",
    },
    {
        id: "LOG-010",
        source: "Payment Gateway",
        direction: "Inbound",
        event: "Webhook",
        internalRef: "TRX-20240601-010",
        pgRef: "PG-MDT-4420",
        merchant: "Warung Digital",
        paymentGateway: "PG_MIDTRANS",
        payloadSummary: 'event="payment.success", trx_id="MDT***420"',
        status: "Success",
        timestamp: "2024-06-01T15:22:47Z",
    },
    {
        id: "LOG-011",
        source: "POS App",
        direction: "Inbound",
        event: "Create Transaction",
        internalRef: "TRX-20240601-011",
        pgRef: "—",
        merchant: "Warung Digital",
        paymentGateway: "PG_BAYARIND",
        payloadSummary: 'amount=50000, method="DANA", merchant_id="M****55"',
        status: "Success",
        timestamp: "2024-06-01T16:00:00Z",
    },
    {
        id: "LOG-012",
        source: "Internal System",
        direction: "Outbound",
        event: "Update Status",
        internalRef: "TRX-20240601-011",
        pgRef: "PG-BYR-7712",
        merchant: "Warung Digital",
        paymentGateway: "PG_BAYARIND",
        payloadSummary: 'trx_status="SUCCESS", notified_merchant=true',
        status: "Success",
        timestamp: "2024-06-01T16:00:08Z",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<LogSource, string> = {
    "POS App": "bg-violet-100 text-violet-700 border border-violet-200",
    "Payment Gateway": "bg-blue-100 text-blue-700 border border-blue-200",
    "Internal System": "bg-amber-100 text-amber-700 border border-amber-200",
};

const DIRECTION_COLORS: Record<LogDirection, string> = {
    Inbound: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Outbound: "bg-orange-100 text-orange-700 border border-orange-200",
};

const STATUS_COLORS: Record<LogStatus, string> = {
    Success: "bg-green-100 text-green-700 border border-green-200",
    Failed: "bg-red-100 text-red-700 border border-red-200",
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
};

const Badge = ({ label, className }: { label: string; className: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${className}`}>
        {label}
    </span>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type Filters = {
    search: string;
    source: string;
    direction: string;
    paymentGateway: string;
    merchant: string;
    status: string;
    dateFrom: string;
    dateTo: string;
};

const INITIAL_FILTERS: Filters = {
    search: "",
    source: "",
    direction: "",
    paymentGateway: "",
    merchant: "",
    status: "",
    dateFrom: "",
    dateTo: "",
};

const SOURCES = ["POS App", "Payment Gateway", "Internal System"];
const DIRECTIONS = ["Inbound", "Outbound"];
const STATUSES = ["Success", "Failed"];
const PGS = ["PG_BAYARIND", "PG_XENDIT", "PG_MIDTRANS"];
const MERCHANTS = ["PT Maju Jaya", "PT Sejahtera Abadi", "Toko Makmur", "Warung Digital"];

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
                <option value="">All</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ row, onClose }: { row: LogRow; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-0.5">
                            Log Detail
                        </p>
                        <h2 className="text-xl font-bold text-slate-800">{row.id}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <Badge label={row.source} className={SOURCE_COLORS[row.source]} />
                    <Badge label={row.direction} className={DIRECTION_COLORS[row.direction]} />
                    <Badge label={row.status} className={STATUS_COLORS[row.status]} />
                </div>

                {/* Fields */}
                <div className="space-y-3 text-sm">
                    {[
                        { label: "Event", value: row.event },
                        { label: "Merchant", value: row.merchant },
                        { label: "Payment Gateway", value: row.paymentGateway },
                        { label: "Internal Ref", value: row.internalRef },
                        { label: "PG Ref", value: row.pgRef },
                        { label: "Ticket Ref", value: row.ticketRef ?? "—" },
                        { label: "Timestamp", value: formatDate(row.timestamp) },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-start gap-3">
                            <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {label}
                            </span>
                            <span className="text-slate-700 font-medium">{value}</span>
                        </div>
                    ))}

                    <div className="flex items-start gap-3">
                        <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Payload Summary
                        </span>
                        <code className="flex-1 rounded-lg bg-slate-900 text-emerald-400 text-xs font-mono px-3 py-2 leading-relaxed break-all">
                            {row.payloadSummary}
                        </code>
                    </div>
                </div>

                {/* Read-only notice */}
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                    <span>🔒</span>
                    <span>Log data is read-only and cannot be modified. Used for audit & dispute reference.</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogExternalActivityContent() {
    const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState<LogRow | null>(null);
    const pageSize = 8;

    const setFilter = (key: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setPage(1);
    };

    const filteredData = useMemo(() => {
        return MOCK_LOGS.filter((row) => {
            const search = filters.search.toLowerCase();
            if (
                search &&
                !Object.values(row)
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(search))
            )
                return false;
            if (filters.source && row.source !== filters.source) return false;
            if (filters.direction && row.direction !== filters.direction) return false;
            if (filters.paymentGateway && row.paymentGateway !== filters.paymentGateway) return false;
            if (filters.merchant && row.merchant !== filters.merchant) return false;
            if (filters.status && row.status !== filters.status) return false;
            if (filters.dateFrom) {
                const from = new Date(filters.dateFrom);
                if (new Date(row.timestamp) < from) return false;
            }

            if (filters.dateTo) {
                const to = new Date(filters.dateTo);
                if (new Date(row.timestamp) > to) return false;
            }
            return true;
        });
    }, [filters]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [page, filteredData]);

    // Stats
    const stats = useMemo(
        () => ({
            total: filteredData.length,
            success: filteredData.filter((r) => r.status === "Success").length,
            failed: filteredData.filter((r) => r.status === "Failed").length,
            inbound: filteredData.filter((r) => r.direction === "Inbound").length,
            outbound: filteredData.filter((r) => r.direction === "Outbound").length,
        }),
        [filteredData],
    );

    const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== "search" && v !== "").length;

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const pagination = {
        currentPage: page - 1, // DataTable uses 0-based index
        totalPage: totalPages,
        size: pageSize,
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                Log External Activity
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xl">
                            Centralized logging and monitoring of all external data exchanges — Merchant POS App,
                            Payment Gateway, and internal systems.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-medium shadow-sm whitespace-nowrap">
                        🔒 Read-Only · Audit Mode
                    </div>
                </div>
                <div className="mb-6 w-fit rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    🚧 Under development. Data currently uses mock values.
                </div>

                {/* ── STATS BAR (Same UI as Summary Cards) ── */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        {
                            label: "Total Logs",
                            value: stats.total,
                            icon: "📊",
                            gradient: "from-slate-50 to-white",
                            iconBg: "from-slate-500 to-slate-600",
                            shadow: "hover:shadow-slate-200/50",
                        },
                        {
                            label: "Success",
                            value: stats.success,
                            icon: "✅",
                            gradient: "from-green-50 to-white",
                            iconBg: "from-green-500 to-green-600",
                            shadow: "hover:shadow-green-200/50",
                        },
                        {
                            label: "Failed",
                            value: stats.failed,
                            icon: "❌",
                            gradient: "from-red-50 to-white",
                            iconBg: "from-red-500 to-red-600",
                            shadow: "hover:shadow-red-200/50",
                        },
                        {
                            label: "Inbound",
                            value: stats.inbound,
                            icon: "📥",
                            gradient: "from-emerald-50 to-white",
                            iconBg: "from-emerald-500 to-emerald-600",
                            shadow: "hover:shadow-emerald-200/50",
                        },
                        {
                            label: "Outbound",
                            value: stats.outbound,
                            icon: "📤",
                            gradient: "from-orange-50 to-white",
                            iconBg: "from-orange-500 to-orange-600",
                            shadow: "hover:shadow-orange-200/50",
                        },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br ${card.gradient} p-4 shadow-sm transition-all duration-300 hover:shadow-xl ${card.shadow}`}
                        >
                            {/* Decorative circle */}
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-white opacity-20 transition-transform duration-500 group-hover:scale-150"></div>

                            <div className="relative flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    <p className="mt-1 text-xs text-gray-400">System activity summary</p>
                                </div>

                                <div
                                    className={`inline-flex rounded-lg bg-linear-to-br ${card.iconBg} p-2.5 shadow-lg`}
                                >
                                    <span className="text-lg">{card.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 w-full min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">🔍 Filter & Pencarian</span>
                            {activeFilterCount > 0 && (
                                <span className="rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5">
                                    {activeFilterCount} aktif
                                </span>
                            )}
                        </div>
                        {(activeFilterCount > 0 || filters.search) && (
                            <button
                                onClick={resetFilters}
                                className="text-xs text-slate-400 hover:text-red-500 transition font-medium shrink-0"
                            >
                                Reset semua
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="mb-4 w-full">
                        <div className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔎</span>
                            <input
                                type="text"
                                placeholder="Cari ref ID, merchant, event, payload..."
                                value={filters.search}
                                onChange={(e) => setFilter("search", e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-w-0"
                            />
                        </div>
                    </div>

                    {/* Filter grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3 w-full">
                        <FilterSelect
                            label="Sumber Sistem"
                            value={filters.source}
                            options={SOURCES}
                            onChange={(v) => setFilter("source", v)}
                        />
                        <FilterSelect
                            label="Tipe Aktivitas"
                            value={filters.direction}
                            options={DIRECTIONS}
                            onChange={(v) => setFilter("direction", v)}
                        />
                        <FilterSelect
                            label="Payment Gateway"
                            value={filters.paymentGateway}
                            options={PGS}
                            onChange={(v) => setFilter("paymentGateway", v)}
                        />
                        <FilterSelect
                            label="Merchant"
                            value={filters.merchant}
                            options={MERCHANTS}
                            onChange={(v) => setFilter("merchant", v)}
                        />
                        <FilterSelect
                            label="Status"
                            value={filters.status}
                            options={STATUSES}
                            onChange={(v) => setFilter("status", v)}
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                Dari Tanggal & Jam
                            </label>
                            <input
                                type="datetime-local"
                                value={filters.dateFrom}
                                onChange={(e) => setFilter("dateFrom", e.target.value)}
                                max={filters.dateTo || undefined}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                Hingga Tanggal & Jam
                            </label>
                            <input
                                type="datetime-local"
                                value={filters.dateTo}
                                onChange={(e) => setFilter("dateTo", e.target.value)}
                                min={filters.dateFrom || undefined}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>
                </div>

                {/* ── TABLE ── */}
                <div className="w-full overflow-x-auto rounded-xl">
                    <DataTable<LogRow>
                        columns={[
                            {
                                key: "id",
                                title: "Log ID",
                                render: (row: LogRow) => (
                                    <span className="font-mono text-xs text-slate-500">{row.id}</span>
                                ),
                            },
                            {
                                key: "source",
                                title: "Sumber",
                                render: (row: LogRow) => (
                                    <Badge label={row.source} className={SOURCE_COLORS[row.source]} />
                                ),
                            },
                            {
                                key: "direction",
                                title: "Arah",
                                render: (row: LogRow) => (
                                    <Badge label={row.direction} className={DIRECTION_COLORS[row.direction]} />
                                ),
                            },
                            {
                                key: "event",
                                title: "Event",
                                render: (row: LogRow) => (
                                    <span className="font-medium text-slate-700">{row.event}</span>
                                ),
                            },
                            {
                                key: "internalRef",
                                title: "Internal Ref",
                                render: (row: LogRow) => (
                                    <span className="font-mono text-xs text-slate-600">{row.internalRef}</span>
                                ),
                            },
                            {
                                key: "pgRef",
                                title: "PG Ref",
                                render: (row: LogRow) => (
                                    <span className="font-mono text-xs text-slate-500">{row.pgRef}</span>
                                ),
                            },
                            {
                                key: "merchant",
                                title: "Merchant",
                                render: (row: LogRow) => <span className="text-slate-700">{row.merchant}</span>,
                            },
                            {
                                key: "payloadSummary",
                                title: "Payload (masked)",
                                render: (row: LogRow) => (
                                    <div className="max-w-50">
                                        <code className="text-[11px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 line-clamp-1 block">
                                            {row.payloadSummary}
                                        </code>
                                    </div>
                                ),
                            },
                            {
                                key: "status",
                                title: "Status",
                                render: (row: LogRow) => (
                                    <Badge label={row.status} className={STATUS_COLORS[row.status]} />
                                ),
                            },
                            {
                                key: "timestamp",
                                title: "Waktu",
                                render: (row: LogRow) => (
                                    <span className="text-xs text-slate-500">{formatDate(row.timestamp)}</span>
                                ),
                            },
                        ]}
                        data={paginatedData}
                        searchable={false}
                        actions={{
                            header: "",
                            render: (row: LogRow) => (
                                <button
                                    onClick={() => setSelectedRow(row)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition"
                                >
                                    Detail
                                </button>
                            ),
                        }}
                        pagination={pagination}
                        onPageChange={(p: number) => setPage(p + 1)} // DataTable passes 0-based page index
                        emptyText="Tidak ada log yang ditemukan"
                    />
                </div>

                {/* Audit Notice */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 flex items-start gap-3">
                    <span className="text-lg mt-0.5">ℹ️</span>
                    <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                        <p className="font-semibold text-slate-600">Ketentuan Log External Activity</p>
                        <p>
                            Data log bersifat <strong>read-only</strong> dan tidak dapat diubah oleh pengguna manapun.
                            Log disimpan sebagai data historis dan digunakan sebagai referensi utama apabila terjadi
                            dispute transaksi. Payload sensitif telah di-masking/sanitized sesuai kebijakan keamanan
                            data. Kebijakan retensi log akan ditentukan pada fase teknis.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedRow && <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />}
        </div>
    );
}
