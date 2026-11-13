import { useState, useMemo } from "react";
import { fmt, fmtDatetime, StatusBadge, sendToLabel } from "../request-settlement-content";
import { WithdrawModel } from "../../../../data/models/WithdrawModel";
import { Pagination } from "@/data/response/BaseResponse";

export function WithdrawalTable({
    withdrawals,
    loading,
    error,
    pagination,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onView,
}: {
    withdrawals: WithdrawModel[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    page: number;
    limit: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
    onView: (record: WithdrawModel) => void;
}) {
    // Search by withdrawUid — filter lokal, tidak ganggu q dari parent
    const [search] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return withdrawals;
        const q = search.toLowerCase();
        return withdrawals.filter((w) => w.withdrawUid.toLowerCase().includes(q));
    }, [withdrawals, search]);

    const totalPages = Math.max(1, pagination ? Math.ceil(pagination.total / limit) : 1);
    const totalEntries = pagination?.total ?? 0;
    const startEntry = totalEntries === 0 ? 0 : (page - 1) * limit + 1;
    const endEntry = Math.min(page * limit, totalEntries);

    const pageButtons = () => {
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <div className="flex-1 min-w-0 rounded-2xl border border-gray-100 bg-white shadow-md">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-100 px-6">
                <button className="relative px-1 py-4 text-sm font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-slate-800">
                    Withdrawal History
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    Show
                    <select
                        value={limit}
                        onChange={(e) => {
                            onLimitChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    entries
                </div>
                {/* <div className="flex items-center gap-2 text-xs text-gray-500">
                    Search by ID:
                    <input
                        type="text"
                        value={search}
                        placeholder="Withdraw UID..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-100"
                    />
                </div> */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-500 bg-gray-50">
                            <th className="px-5 py-3 text-left font-medium">No</th>
                            <th className="px-5 py-3 text-left font-medium">Withdrawal Date</th>
                            <th className="px-5 py-3 text-left font-medium">Amount</th>
                            <th className="px-5 py-3 text-left font-medium">Status</th>
                            <th className="px-5 py-3 text-left font-medium">SEND TO</th>
                            <th className="px-5 py-3 text-left font-medium">Merchant</th>
                            <th className="px-5 py-3 text-left font-medium">Region</th>
                            <th className="px-5 py-3 text-left font-medium">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: limit }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-6 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-32 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-24 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-16 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-24 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-28 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-10 rounded bg-gray-100" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-3 w-10 rounded bg-gray-100" />
                                    </td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-sm text-red-400">
                                    {error}
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-sm text-gray-400">
                                    No data available in table
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, idx) => (
                                <tr
                                    key={row.withdrawUid}
                                    className="hover:bg-gray-50 transition-colors even:bg-gray-50/30"
                                >
                                    <td className="px-5 py-4 text-xs text-gray-500">{(page - 1) * limit + idx + 1}</td>

                                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                                        {fmtDatetime(row.requestTime)}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-800 whitespace-nowrap">
                                        {fmt(row.amount)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{sendToLabel(row.isMerchant)}</td>
                                    <td className="px-5 py-3.5 text-xs text-gray-600">{row.merchant.merchantDesc}</td>
                                    <td className="px-5 py-3.5 text-xs text-gray-600">{row.region.regionDesc}</td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => onView(row)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-500">
                    {totalEntries === 0
                        ? "Showing 0 to 0 of 0 entries"
                        : `Showing ${startEntry} to ${endEntry} of ${totalEntries} entries`}
                </p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                        Previous
                    </button>
                    {pageButtons().map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            disabled={loading}
                            className={`rounded px-3 py-1 text-xs ${
                                p === page
                                    ? "bg-slate-800 text-white"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages || loading}
                        className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
