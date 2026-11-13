export type LegendStyle = {
    bgColor: string;
    textColor: string;
    dotColor: string;
    borderColor: string;
};

export type LegendItem = {
    key: string;
    label: string;
    description: string;
    style: LegendStyle;
};

export const STATUS_LEGEND: LegendItem[] = [
    {
        key: "PAID",
        label: "Paid",
        description: "Pembayaran berhasil dan dana sudah diterima.",
        style: {
            bgColor: "#f0fdf4",
            textColor: "#15803d",
            dotColor: "#22c55e",
            borderColor: "#bbf7d0",
        },
    },
    {
        key: "PAID-SETTLE",
        label: "Paid (Settle)",
        description: "Pembayaran Electronic Money berhasil dan dana sudah settlement.",
        style: {
            bgColor: "#f0fdf4",
            textColor: "#15803d",
            dotColor: "#22c55e",
            borderColor: "#bbf7d0",
        },
    },
    {
        key: "PENDING-PAID",
        label: "Pending Paid",
        description: "Pembayaran diterima, menunggu proses settlement.",
        style: {
            bgColor: "#f0f9ff",
            textColor: "#0369a1",
            dotColor: "#38bdf8",
            borderColor: "#bae6fd",
        },
    },
    {
        key: "PENDING",
        label: "Pending",
        description: "Transaksi dibuat, menunggu pembayaran dari pelanggan.",
        style: {
            bgColor: "#fffbeb",
            textColor: "#b45309",
            dotColor: "#fbbf24",
            borderColor: "#fde68a",
        },
    },

    {
        key: "PENDING-NOT-SETTLE",
        label: "Pending (Not Settle)",
        description: "Transaksi Electronic Money menunggu pembayaran, dana belum settlement.",
        style: {
            bgColor: "#fffbeb",
            textColor: "#b45309",
            dotColor: "#fbbf24",
            borderColor: "#fde68a",
        },
    },
    {
        key: "REQUEST",
        label: "Request",
        description: "Request pembayaran diterima, belum diproses.",
        style: {
            bgColor: "#f0f9ff",
            textColor: "#0369a1",
            dotColor: "#38bdf8",
            borderColor: "#bae6fd",
        },
    },
    {
        key: "FAILED",
        label: "Failed",
        description: "Transaksi gagal diproses.",
        style: {
            bgColor: "#fef2f2",
            textColor: "#b91c1c",
            dotColor: "#ef4444",
            borderColor: "#fecaca",
        },
    },
    {
        key: "DECLINED",
        label: "Declined",
        description: "Pembayaran ditolak oleh kanal atau issuer.",
        style: {
            bgColor: "#fff1f2",
            textColor: "#be123c",
            dotColor: "#fb7185",
            borderColor: "#fecdd3",
        },
    },
    {
        key: "REJECT",
        label: "Reject",
        description: "Transaksi ditolak oleh sistem atau merchant.",
        style: {
            bgColor: "#fff1f2",
            textColor: "#be123c",
            dotColor: "#fb7185",
            borderColor: "#fecdd3",
        },
    },
    {
        key: "EXPIRED",
        label: "Expired",
        description: "Transaksi kedaluwarsa sebelum dibayar.",
        style: {
            bgColor: "#f3f4f6",
            textColor: "#4b5563",
            dotColor: "#9ca3af",
            borderColor: "#e5e7eb",
        },
    },
    {
        key: "INACTIVE",
        label: "Inactive",
        description: "Transaksi tidak aktif.",
        style: {
            bgColor: "#f3f4f6",
            textColor: "#4b5563",
            dotColor: "#9ca3af",
            borderColor: "#e5e7eb",
        },
    },
];

export const WEBHOOK_LEGEND: LegendItem[] = [
    {
        key: "SENT",
        label: "Sent",
        description: "Webhook berhasil dikirim ke merchant.",
        style: {
            bgColor: "#f0fdf4",
            textColor: "#15803d",
            dotColor: "#22c55e",
            borderColor: "#bbf7d0",
        },
    },
    {
        key: "PENDING",
        label: "Pending",
        description: "Webhook belum terkirim, masih antre.",
        style: {
            bgColor: "#fffbeb",
            textColor: "#b45309",
            dotColor: "#f59e0b",
            borderColor: "#fde68a",
        },
    },
    {
        key: "FAILED",
        label: "Failed",
        description: "Webhook gagal dikirim ke merchant.",
        style: {
            bgColor: "#fef2f2",
            textColor: "#b91c1c",
            dotColor: "#ef4444",
            borderColor: "#fecaca",
        },
    },
    {
        key: "APPJPAY",
        label: "via juaraPay",
        description: "Webhook dikirim melalui aplikasi juaraPay.",
        style: {
            bgColor: "#f5f3ff",
            textColor: "#6d28d9",
            dotColor: "#8b5cf6",
            borderColor: "#ddd6fe",
        },
    },
];

export const DELEGATION_LEGEND: LegendItem[] = [
    {
        key: "PENDING",
        label: "Pending",
        description: "Pelimpahan menunggu untuk diproses.",
        style: {
            bgColor: "#fffbeb",
            textColor: "#b45309",
            dotColor: "#fbbf24",
            borderColor: "#fde68a",
        },
    },
    {
        key: "DONE",
        label: "Done",
        description: "Pelimpahan sudah selesai diproses.",
        style: {
            bgColor: "#f0fdf4",
            textColor: "#15803d",
            dotColor: "#22c55e",
            borderColor: "#bbf7d0",
        },
    },
    {
        key: "FAILED",
        label: "Failed",
        description: "Pelimpahan gagal diproses.",
        style: {
            bgColor: "#fef2f2",
            textColor: "#b91c1c",
            dotColor: "#ef4444",
            borderColor: "#fecaca",
        },
    },
];

export type LegendSectionKey = "status" | "webhook" | "delegation";
