"use client";

import { useState, useMemo } from "react";
import { DataTable } from "../../../components/shared/datatable/DataTable";

type ActivityType = "LOGIN" | "LOGOUT" | "SEARCH" | "FILTER" | "EXPORT" | "PAGE_ACCESS";

type UserRole = "Super Admin" | "Admin" | "Finance" | "Merchant";

type LogRow = {
    id: string;
    userId: string;
    userName: string;
    role: UserRole;
    activityType: ActivityType;
    description: string;
    timestamp: string; // ISO string
    ipAddress: string;
    deviceInfo: string;
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_LOGS: LogRow[] = [
    {
        id: "LOG-001",
        userId: "USR-0012",
        userName: "Budi Santoso",
        role: "Admin",
        activityType: "LOGIN",
        description: "User berhasil login ke sistem.",
        timestamp: "2025-01-28T08:02:14Z",
        ipAddress: "103.21.45.12",
        deviceInfo: "Chrome 120 / Windows 11",
    },
    {
        id: "LOG-002",
        userId: "USR-0023",
        userName: "Dewi Rahayu",
        role: "Finance",
        activityType: "EXPORT",
        description: "Export laporan transaksi MDR bulan Januari 2025 (CSV).",
        timestamp: "2025-01-28T08:45:33Z",
        ipAddress: "103.21.45.88",
        deviceInfo: "Firefox 121 / macOS Sonoma",
    },
    {
        id: "LOG-003",
        userId: "USR-0031",
        userName: "Andi Wijaya",
        role: "Admin",
        activityType: "PAGE_ACCESS",
        description: "Mengakses halaman Audit MDR.",
        timestamp: "2025-01-28T09:10:05Z",
        ipAddress: "202.67.14.55",
        deviceInfo: "Safari 17 / iOS 17",
    },
    {
        id: "LOG-004",
        userId: "USR-0012",
        userName: "Budi Santoso",
        role: "Admin",
        activityType: "SEARCH",
        description: "Pencarian transaksi dengan kata kunci: 'BCA VA Sejahtera'.",
        timestamp: "2025-01-28T09:22:47Z",
        ipAddress: "103.21.45.12",
        deviceInfo: "Chrome 120 / Windows 11",
    },
    {
        id: "LOG-005",
        userId: "USR-0044",
        userName: "Siti Nurhaliza",
        role: "Finance",
        activityType: "FILTER",
        description: "Menerapkan filter: Periode 01-01-2025 s/d 28-01-2025, Status: Sukses.",
        timestamp: "2025-01-28T10:05:19Z",
        ipAddress: "180.244.12.3",
        deviceInfo: "Edge 121 / Windows 10",
    },
    {
        id: "LOG-006",
        userId: "USR-0023",
        userName: "Dewi Rahayu",
        role: "Finance",
        activityType: "PAGE_ACCESS",
        description: "Mengakses halaman Reporting.",
        timestamp: "2025-01-28T10:31:58Z",
        ipAddress: "103.21.45.88",
        deviceInfo: "Firefox 121 / macOS Sonoma",
    },
    {
        id: "LOG-007",
        userId: "USR-0056",
        userName: "Rizky Pratama",
        role: "Merchant",
        activityType: "LOGIN",
        description: "Percobaan login gagal — password salah (attempt 3/5).",
        timestamp: "2025-01-28T11:00:00Z",
        ipAddress: "114.122.78.44",
        deviceInfo: "Chrome 118 / Android 13",
    },
    {
        id: "LOG-008",
        userId: "USR-0056",
        userName: "Rizky Pratama",
        role: "Merchant",
        activityType: "LOGIN",
        description: "User berhasil login setelah reset password.",
        timestamp: "2025-01-28T11:14:32Z",
        ipAddress: "114.122.78.44",
        deviceInfo: "Chrome 118 / Android 13",
    },
    {
        id: "LOG-009",
        userId: "USR-0031",
        userName: "Andi Wijaya",
        role: "Admin",
        activityType: "EXPORT",
        description: "Export data pengguna aktif format XLSX.",
        timestamp: "2025-01-28T13:22:10Z",
        ipAddress: "202.67.14.55",
        deviceInfo: "Safari 17 / iOS 17",
    },
    {
        id: "LOG-010",
        userId: "USR-0012",
        userName: "Budi Santoso",
        role: "Admin",
        activityType: "LOGOUT",
        description: "User logout dari sistem.",
        timestamp: "2025-01-28T17:58:01Z",
        ipAddress: "103.21.45.12",
        deviceInfo: "Chrome 120 / Windows 11",
    },
    {
        id: "LOG-011",
        userId: "USR-0044",
        userName: "Siti Nurhaliza",
        role: "Finance",
        activityType: "SEARCH",
        description: "Pencarian transaksi QRIS dengan filter merchant: 'Toko Makmur'.",
        timestamp: "2025-01-29T08:15:44Z",
        ipAddress: "180.244.12.3",
        deviceInfo: "Edge 121 / Windows 10",
    },
    {
        id: "LOG-012",
        userId: "USR-0023",
        userName: "Dewi Rahayu",
        role: "Finance",
        activityType: "LOGOUT",
        description: "User logout dari sistem.",
        timestamp: "2025-01-29T17:30:00Z",
        ipAddress: "103.21.45.88",
        deviceInfo: "Firefox 121 / macOS Sonoma",
    },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ACTIVITY_TYPES: ActivityType[] = ["LOGIN", "LOGOUT", "SEARCH", "FILTER", "EXPORT", "PAGE_ACCESS"];
const ROLES: UserRole[] = ["Super Admin", "Admin", "Finance", "Merchant"];

const ACTIVITY_LABEL: Record<ActivityType, string> = {
    LOGIN: "Login",
    LOGOUT: "Logout",
    SEARCH: "Pencarian Data",
    FILTER: "Penggunaan Filter",
    EXPORT: "Export Data",
    PAGE_ACCESS: "Akses Halaman Sensitif",
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
    LOGIN: "bg-blue-100 text-blue-700",
    LOGOUT: "bg-slate-100 text-slate-600",
    SEARCH: "bg-purple-100 text-purple-700",
    FILTER: "bg-amber-100 text-amber-700",
    EXPORT: "bg-teal-100 text-teal-700",
    PAGE_ACCESS: "bg-rose-100 text-rose-700",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatTimestamp(iso: string): string {
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
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function LogInternalActivityContent() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filterRole, setFilterRole] = useState<string>("");
    const [filterActivity, setFilterActivity] = useState<string>("");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");

    const pageSize = 10;

    // ─── FILTER + SEARCH ──────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        return MOCK_LOGS.filter((item) => {
            const matchSearch =
                search === "" ||
                [item.userId, item.userName, item.description, item.ipAddress, item.deviceInfo].some((val) =>
                    val.toLowerCase().includes(search.toLowerCase()),
                );

            const matchRole = filterRole === "" || item.role === filterRole;
            const matchActivity = filterActivity === "" || item.activityType === filterActivity;

            const itemDate = new Date(item.timestamp);
            const matchFrom = filterDateFrom === "" || itemDate >= new Date(filterDateFrom + "T00:00:00Z");
            const matchTo = filterDateTo === "" || itemDate <= new Date(filterDateTo + "T23:59:59Z");

            return matchSearch && matchRole && matchActivity && matchFrom && matchTo;
        });
    }, [search, filterRole, filterActivity, filterDateFrom, filterDateTo]);

    // ─── PAGINATION ───────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [page, filteredData]);

    const pagination = {
        currentPage: page,
        totalPage: totalPages,
        totalItems: filteredData.length,
        size: pageSize,
    };

    // Reset page when filters change
    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };
    const handleRole = (val: string) => {
        setFilterRole(val);
        setPage(1);
    };
    const handleActivity = (val: string) => {
        setFilterActivity(val);
        setPage(1);
    };
    const handleDateFrom = (val: string) => {
        setFilterDateFrom(val);
        setPage(1);
    };
    const handleDateTo = (val: string) => {
        setFilterDateTo(val);
        setPage(1);
    };

    const handleReset = () => {
        setSearch("");
        setFilterRole("");
        setFilterActivity("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setPage(1);
    };

    // ─── RENDER HELPERS ───────────────────────────────────────────────────────
    const renderActivityType = (type: ActivityType) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ACTIVITY_COLOR[type]}`}>
            {ACTIVITY_LABEL[type]}
        </span>
    );

    const renderRole = (role: UserRole) => {
        const colorMap: Record<UserRole, string> = {
            "Super Admin": "bg-indigo-100 text-indigo-700",
            Admin: "bg-blue-100 text-blue-700",
            Finance: "bg-emerald-100 text-emerald-700",
            Merchant: "bg-orange-100 text-orange-700",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorMap[role]}`}>
                {role}
            </span>
        );
    };

    // ─── SUMMARY STATS ────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const all = MOCK_LOGS;
        return {
            total: all.length,
            logins: all.filter((l) => l.activityType === "LOGIN").length,
            exports: all.filter((l) => l.activityType === "EXPORT").length,
            sensitive: all.filter((l) => l.activityType === "PAGE_ACCESS").length,
        };
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── HEADER ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Log Internal Activity</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Record of all application usage activities by all users. Only the Super Admin can access
                            this page.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            Read Only · Cannot be modified.
                        </span>
                    </div>
                </div>
                <div className="mb-6 w-fit rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    🚧 Under development. Data currently uses mock values.
                </div>
                {/* ── SUMMARY CARDS ── */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Total Log",
                            value: stats.total,
                            icon: "📋",
                            gradient: "from-slate-50 to-white",
                            iconBg: "from-slate-500 to-slate-600",
                            shadow: "hover:shadow-slate-200/50",
                        },
                        {
                            label: "Login Event",
                            value: stats.logins,
                            icon: "🔐",
                            gradient: "from-blue-50 to-white",
                            iconBg: "from-blue-500 to-blue-600",
                            shadow: "hover:shadow-blue-200/50",
                        },
                        {
                            label: "Export Data",
                            value: stats.exports,
                            icon: "📤",
                            gradient: "from-teal-50 to-white",
                            iconBg: "from-teal-500 to-teal-600",
                            shadow: "hover:shadow-teal-200/50",
                        },
                        {
                            label: "Akses Sensitif",
                            value: stats.sensitive,
                            icon: "🚨",
                            gradient: "from-rose-50 to-white",
                            iconBg: "from-rose-500 to-rose-600",
                            shadow: "hover:shadow-rose-200/50",
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
                {/* ── FILTER BAR ── */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Search */}
                        <div className="flex-1 min-w-50">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Cari</label>
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Cari user, deskripsi, IP…"
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div className="min-w-40">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                            <select
                                value={filterRole}
                                onChange={(e) => handleRole(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                            >
                                <option value="">Semua Role</option>
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Activity Type Filter */}
                        <div className="min-w-50">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Aktivitas</label>
                            <select
                                value={filterActivity}
                                onChange={(e) => handleActivity(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                            >
                                <option value="">Semua Aktivitas</option>
                                {ACTIVITY_TYPES.map((a) => (
                                    <option key={a} value={a}>
                                        {ACTIVITY_LABEL[a]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => handleDateFrom(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => handleDateTo(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                        </div>

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>

                    {/* Active filter count */}
                    {(filterRole || filterActivity || filterDateFrom || filterDateTo || search) && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Filter aktif:</span>
                            {search && <FilterTag label={`Cari: "${search}"`} onRemove={() => handleSearch("")} />}
                            {filterRole && <FilterTag label={`Role: ${filterRole}`} onRemove={() => handleRole("")} />}
                            {filterActivity && (
                                <FilterTag
                                    label={`Aktivitas: ${ACTIVITY_LABEL[filterActivity as ActivityType]}`}
                                    onRemove={() => handleActivity("")}
                                />
                            )}
                            {filterDateFrom && (
                                <FilterTag label={`Dari: ${filterDateFrom}`} onRemove={() => handleDateFrom("")} />
                            )}
                            {filterDateTo && (
                                <FilterTag label={`Sampai: ${filterDateTo}`} onRemove={() => handleDateTo("")} />
                            )}
                        </div>
                    )}
                </div>
                {/* ── TABLE ── */}
                <DataTable
                    columns={[
                        {
                            key: "id",
                            title: "Log ID",
                            render: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span>,
                        },
                        {
                            key: "userId",
                            title: "User",
                            render: (row) => (
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">{row.userName}</div>
                                    <div className="text-xs font-mono text-slate-400">{row.userId}</div>
                                </div>
                            ),
                        },
                        {
                            key: "role",
                            title: "Role",
                            render: (row) => renderRole(row.role),
                        },
                        {
                            key: "activityType",
                            title: "Jenis Aktivitas",
                            render: (row) => renderActivityType(row.activityType),
                        },
                        {
                            key: "description",
                            title: "Deskripsi",
                            render: (row) => (
                                <span className="text-sm text-slate-600 line-clamp-2 max-w-xs">{row.description}</span>
                            ),
                        },
                        {
                            key: "timestamp",
                            title: "Waktu",
                            render: (row) => (
                                <span className="text-xs text-slate-600 whitespace-nowrap">
                                    {formatTimestamp(row.timestamp)}
                                </span>
                            ),
                        },
                        {
                            key: "ipAddress",
                            title: "IP / Perangkat",
                            render: (row) => (
                                <div>
                                    <div className="text-xs font-mono text-slate-700">{row.ipAddress}</div>
                                    <div className="text-xs text-slate-400">{row.deviceInfo}</div>
                                </div>
                            ),
                        },
                    ]}
                    data={paginatedData}
                    searchable={false} // we handle search ourselves
                    pagination={pagination}
                    onPageChange={(p) => setPage(p)}
                />
                {/* ── FOOTER NOTE ── */}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div>
                        <span className="font-semibold">Catatan:</span> Data log bersifat read-only dan tidak dapat
                        dimodifikasi oleh siapapun untuk menjaga integritas dan kepatuhan audit. Kebijakan retensi log
                        dan integrasi dengan sistem SIEM/monitoring eksternal masih{" "}
                        <span className="font-semibold">TBC</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── FILTER TAG ───────────────────────────────────────────────────────────────
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {label}
            <button onClick={onRemove} className="hover:text-blue-900 ml-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </span>
    );
}
