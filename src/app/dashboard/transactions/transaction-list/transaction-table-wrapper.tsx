"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/datatable/DataTable";
import { Column, FilterOption } from "@/components/shared/datatable/types";
import { TransactionModel } from "@/data/models/TransactionModel";
import { StatusLegendButton, StatusLegendDialog } from "@/components/ui/StatusLegendDialog";

type SearchParams = {
    page?: string;
    size?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    paymentGateway?: string;
    merchantId?: string;
};

type StatusStyle = {
    label: string;
    bgColor: string;
    textColor: string;
    dotColor: string;
    borderColor: string;
};

const STATUS_MAP: Record<string, StatusStyle> = {
    PAID: {
        label: "Paid",
        bgColor: "#f0fdf4",
        textColor: "#15803d",
        dotColor: "#22c55e",
        borderColor: "#bbf7d0",
    },
    "PENDING-PAID": {
        label: "Pending Paid",
        bgColor: "#f0f9ff",
        textColor: "#0369a1",
        dotColor: "#38bdf8",
        borderColor: "#bae6fd",
    },
    PENDING: {
        label: "Pending",
        bgColor: "#fffbeb",
        textColor: "#b45309",
        dotColor: "#fbbf24",
        borderColor: "#fde68a",
    },
    FAILED: {
        label: "Failed",
        bgColor: "#fef2f2",
        textColor: "#b91c1c",
        dotColor: "#ef4444",
        borderColor: "#fecaca",
    },
    DECLINED: {
        label: "Declined",
        bgColor: "#fff1f2",
        textColor: "#be123c",
        dotColor: "#fb7185",
        borderColor: "#fecdd3",
    },
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
    label: "-",
    bgColor: "#f3f4f6",
    textColor: "#4b5563",
    dotColor: "#9ca3af",
    borderColor: "#e5e7eb",
};

function getStatusStyle(status?: string): StatusStyle {
    const key = (status ?? "").toUpperCase().trim();

    if (STATUS_MAP[key]) return STATUS_MAP[key];

    const matchedKey = Object.keys(STATUS_MAP).find((k) => key.startsWith(k));
    if (matchedKey) return STATUS_MAP[matchedKey];

    return { ...DEFAULT_STATUS_STYLE, label: status ?? "-" };
}

function StatusBadge({ status }: { status?: string }) {
    const s = getStatusStyle(status);

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "12px",
                fontWeight: 500,
                backgroundColor: s.bgColor,
                color: s.textColor,
                border: `1px solid ${s.borderColor}`,
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: s.dotColor,
                    flexShrink: 0,
                }}
            />
            {s.label}
        </span>
    );
}

export default function TransactionTableWrapper({
    data,
    pagination,
    searchParams,
}: {
    data: TransactionModel[];
    pagination:
        | {
              currentPage: number;
              totalPage: number;
              size: number;
          }
        | undefined;
    searchParams: SearchParams;
}) {
    const router = useRouter();
    const [showLegend, setShowLegend] = useState(false);

    const updateQuery = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams as Record<string, string>);

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        params.set("page", "0");

        router.push(`/dashboard/transactions?${params.toString()}`);
    };

    const columns: Column<TransactionModel>[] = [
        { key: "transactionDate", title: "Date & Time" },
        { key: "transactionNumber", title: "Transaction Number" },
        { key: "paymentCode", title: "Payment Code" },
        {
            key: "status",
            title: "Status",
            render: (row) => <StatusBadge status={row.status} />,
            headerInfo: <StatusLegendButton onClick={() => setShowLegend(true)} />,
        },
        {
            key: "nettProfit",
            title: "Amount",
            render: (row) => `Rp ${row.nettProfit.toLocaleString()}`,
        },
         {
            key: "amountTotal",
            title: "Bruto",
            render: (row) => `Rp ${row.amountTotal.toLocaleString()}`,
        },
    ];

    const statusOptions: FilterOption[] = [
        { label: "All Status", value: "" },
        { label: "Paid", value: "paid" },
        { label: "Pending Paid", value: "pending-paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
        { label: "Declined", value: "declined" },
    ];

    return (
        <>
            <DataTable<TransactionModel>
                columns={columns}
                data={data}
                searchable
                searchPlaceholder="Search transaction number..."
                onSearch={(value) => updateQuery("search", value)}
                filters={[
                    {
                        key: "status",
                        type: "select",
                        value: searchParams.status ?? "",
                        options: statusOptions,
                        onChange: (value) => updateQuery("status", value),
                    },
                ]}
                pagination={pagination}
                onPageChange={(page) => updateQuery("page", String(page))}
                emptyText="No transaction data"
            />

            {showLegend && (
                <StatusLegendDialog section="status" onClose={() => setShowLegend(false)} />
            )}
        </>
    );
}
