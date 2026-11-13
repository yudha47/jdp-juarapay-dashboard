/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useResetWebhook, useTransactionReport, useTransactions, useUpdatePelimpahan } from "@/hooks/useTransaction";
import { TransactionKeySearch, TransactionModel, TransactionSort } from "@/data/models/TransactionModel";
import { DataTable } from "@/components/shared/datatable/DataTable";
import { useEffect, useMemo, useState } from "react";
import { DetailTransactionDrawer } from "./components/DetailTransactionDrawer";
import { SearchByOption, FilterOption } from "@/components/shared/datatable/types";
import { ExportTransactionReportModal } from "./components/ExportTransactionModal";
import { getLoggedInRole, getLoggedInUser } from "@/lib/auth";
import { usePaymentMethods } from "@/hooks/usePaymentMethod";
import { useMerchant, useMerchants } from "@/hooks/useMerchant";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useUser } from "@/hooks/useUsers";
import { exportToExcel } from "@/utils/exportToExcel";
import { UpdatePelimpahanButton } from "./components/UpdatePelimpahanModal";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";
import { DateRangePickerModal } from "./components/DateRangePickerModal";
import { StatusLegendButton, StatusLegendDialog } from "@/components/ui/StatusLegendDialog";
import { LegendSectionKey } from "../_lib/status-legend";

// ─── Status Badge ─────────────────────────────────────────────────────────────

type StatusStyle = {
    label: string;
    bgColor: string;
    textColor: string;
    dotColor: string;
    borderColor: string;
};

// Tambah export
export type PelimpahanStatus = "PENDING" | "DONE" | "FAILED";

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
    REQUEST: {
        label: "Request",
        bgColor: "#f0f9ff",
        textColor: "#0369a1",
        dotColor: "#38bdf8",
        borderColor: "#bae6fd",
    },
    REJECT: {
        label: "Reject",
        bgColor: "#fff1f2",
        textColor: "#be123c",
        dotColor: "#fb7185",
        borderColor: "#fecdd3",
    },
    EXPIRED: {
        label: "Expired",
        bgColor: "#f3f4f6",
        textColor: "#4b5563",
        dotColor: "#9ca3af",
        borderColor: "#e5e7eb",
    },
    INACTIVE: {
        label: "Inactive",
        bgColor: "#f3f4f6",
        textColor: "#4b5563",
        dotColor: "#9ca3af",
        borderColor: "#e5e7eb",
    },
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
    label: "-",
    bgColor: "#f3f4f6",
    textColor: "#4b5563",
    dotColor: "#9ca3af",
    borderColor: "#e5e7eb",
};

const WEBHOOK_STATUS_MAP: Record<string, StatusStyle> = {
    SENT: {
        label: "Sent",
        bgColor: "#f0fdf4",
        textColor: "#15803d",
        dotColor: "#22c55e",
        borderColor: "#bbf7d0",
    },
    PENDING: {
        label: "Pending",
        bgColor: "#fffbeb",
        textColor: "#b45309",
        dotColor: "#f59e0b",
        borderColor: "#fde68a",
    },
    FAILED: {
        label: "Failed",
        bgColor: "#fef2f2",
        textColor: "#b91c1c",
        dotColor: "#ef4444",
        borderColor: "#fecaca",
    },
    APPJPAY: {
        label: "via juaraPay",
        bgColor: "#f5f3ff",
        textColor: "#6d28d9",
        dotColor: "#8b5cf6",
        borderColor: "#ddd6fe",
    },
};

function getStatusStyle(status?: string, category?: string): StatusStyle {
    const key = (status ?? "").toUpperCase().trim();
    const roleDesc = getLoggedInRole()?.roleDesc;
    const showEmLabel = roleDesc === "Super Admin" || roleDesc === "Dev";
    const isEM = showEmLabel && category?.trim().toLowerCase() === "electronic money";

    if (STATUS_MAP[key]) {
        const base = STATUS_MAP[key];

        // Override label jika Electronic Money
        if (isEM) {
            if (key === "PAID") return { ...base, label: "Paid (Settle)" };
            if (key === "PENDING") return { ...base, label: "Pending (Not Settle)" };
            if (key === "PENDING-PAID") return { ...base, label: "Pending Paid (Not Settle)" };
        }

        return base;
    }

    const matchedKey = Object.keys(STATUS_MAP).find((k) => key.startsWith(k));
    if (matchedKey) {
        const base = STATUS_MAP[matchedKey];

        if (isEM) {
            if (matchedKey === "PAID") return { ...base, label: "Paid (Settle)" };
            if (matchedKey === "PENDING") return { ...base, label: "Pending (Not Settle)" };
        }

        return base;
    }

    return { ...DEFAULT_STATUS_STYLE, label: status ?? "-" };
}

function StatusBadge({ status, category }: { status?: string, category?: string }) {
    const s = getStatusStyle(status, category);
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

function WebhookStatusBadge({ status }: { status?: string }) {
    const key = (status ?? "").toUpperCase().trim();
    const s = WEBHOOK_STATUS_MAP[key] ?? { ...DEFAULT_STATUS_STYLE, label: status || "-" };

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

const getActualValue = (
    amountTotal?: number | null,
    value?: number | string | null,
    isPercentage?: string | null
) => {
    const numericValue = Number(value ?? 0);
    const numericAmount = Number(amountTotal ?? 0);

    if (isPercentage === "Y") {
        return (numericAmount * numericValue) / 100;
    }

    return numericValue;
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TransactionReportPage() {
    const userLoggedin = getLoggedInUser();
    const { data: dataUser } = useUser(userLoggedin?.userUid);

    const role = getLoggedInRole();
    const roleDesc = role?.roleDesc;
    const isSuperAdmin = roleDesc === "Super Admin";
    const isDev = roleDesc === "Dev";
    const isAdmin = dataUser?.role.roleDesc === "Admin";
    const adminMerchantId = isAdmin ? dataUser?.merchantUid : "";

    const [selectedMerchantId, setSelectedMerchantId] = useState("");
    const [selectedRegionId, setSelectedRegionId] = useState("");
    const [selectedSubMerchantId, setSelectedSubMerchantId] = useState("");
    const [selectedPaymentCode, setSelectedPaymentCode] = useState("");
    const [paymentCodeSearch, setPaymentCodeSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
    const { update, loading: pelimpahanLoading } = useUpdatePelimpahan();
    const { reset: resetWebhook, loading: resetWebhookLoading } = useResetWebhook();

    const { toast, toasts, clear } = useToast();
    const { items: paymentMethods } = usePaymentMethods({
        page: 1,
        limit: 1000,
        sort: "createdAt",
        order: "desc",
    });

    const {
        items,
        pagination,
        loading,
        page,
        limit,
        sort,
        order,
        searchBy,
        q,
        endDate,
        setSearchBy,
        setPage,
        setLimit,
        setSort,
        setOrder,
        setQ,
        setEndDate,
        setFilterBy,
        setId,
        refetch
    } = useTransactions({
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
        searchBy: "typeTrx",
        id: "",
        q: "offline",
    });

    const {
        items: merchantItems,
        loading: merchantsLoading,
        q: merchantSearch,
        setQ: setMerchantSearch,
    } = useMerchants({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const merchantOptions = useMemo(
        () =>
            merchantItems.map((item) => ({
                label: item.merchantDesc,
                value: item.merchantId,
            })),
        [merchantItems],
    );

    const effectiveMerchantId = isSuperAdmin ? selectedMerchantId : isAdmin ? adminMerchantId : "";

    const { data: merchantDetail } = useMerchant(effectiveMerchantId ?? "");

    const regionOptions = useMemo(
        () =>
            (merchantDetail?.region ?? []).map((r) => ({
                label: r.regionDesc,
                value: r.regionId,
            })),
        [merchantDetail],
    );

    const subMerchantOptions = useMemo(() => {
        if (!merchantDetail) return [];

        const result: { label: string; value: string }[] = [];

        merchantDetail.region.forEach((region) => {
            if (selectedRegionId && region.regionId !== selectedRegionId) return;

            region.cluster?.forEach((cluster) => {
                cluster.site?.forEach((site) => {
                    site.subMerchant?.forEach((sm) => {
                        result.push({
                            label: sm.subMerchantDesc,
                            value: sm.subMerchantId,
                        });
                    });
                });
            });
        });

        return result;
    }, [merchantDetail, selectedRegionId]);

    const { fetchReport, loading: reportLoading } = useTransactionReport(
        {
            page: 1,
            limit: 1000,
            sort: "createdAt",
            order: "desc",
            searchBy: "createdAt",
        },
        { manual: true },
    );


    const allVisibleUids = useMemo(() => items.map((i) => i.transactionUid), [items]);

    const isAllSelected =
        allVisibleUids.length > 0 && allVisibleUids.every((uid) => selectedUids.has(uid));

    const toggleAll = () => {
        if (isAllSelected) {
            setSelectedUids((prev) => {
                const next = new Set(prev);
                allVisibleUids.forEach((uid) => next.delete(uid));
                return next;
            });
        } else {
            setSelectedUids((prev) => {
                const next = new Set(prev);
                allVisibleUids.forEach((uid) => next.add(uid));
                return next;
            });
        }
    };

    const toggleRow = (uid: string) => {
        setSelectedUids((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid);
            else next.add(uid);
            return next;
        });
    };


    const tablePagination = pagination
        ? {
            currentPage: (pagination.page ?? 1) - 1,
            totalPage: pagination.totalPages ?? 1,
            size: pagination.limit ?? limit,
        }
        : { currentPage: page - 1, totalPage: 1, size: limit };

    const [openModalDrawer, setOpenModalDrawer] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionModel | null>(null);
    const [showLegend, setShowLegend] = useState<LegendSectionKey | null>(null);

    const TRANSACTION_SEARCH_BY_OPTIONS: SearchByOption[] = [
        { label: "Transaction No.", value: "transactionNumber" },
        { label: "Merchant Trx ID", value: "custTrxId" },
    ];

    const STATUS_FILTER_OPTIONS: FilterOption[] = [
        { label: "All Status", value: "" },
        { label: "Request", value: "request" },
        { label: "Pending", value: "pending" },
    ];

    const isDateSearchBy = (value?: string) =>
        value === "paymentDate" || value === "transactionDate" || value === "createdAt";

    const tableSearchBy = isDateSearchBy(searchBy) ? "transactionNumber" : searchBy;

    const handleOpenDrawer = (data: TransactionModel) => {
        setOpenModalDrawer(true);
        setSelectedTransaction(data);
    };

    const [openExportModal, setOpenExportModal] = useState(false);
    const [exportModalKey, setExportModalKey] = useState(0);

    const handleOpenExportModal = () => {
        setExportModalKey((prev) => prev + 1);
        setOpenExportModal(true);
    };

    const handleResetWebhook = async (transactionUid: string, onClose?: () => void) => {
        try {
            await resetWebhook([{ transactionUid }]);

            toast.success(
                "Webhook Reset",
                "Webhook has been reset successfully."
            );

            refetch();
            onClose?.();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            toast.error("Reset Failed", e?.message ?? "Failed to reset webhook.");
        }
    };

    const handleUpdatePelimpahan = async (uids: string[], status: PelimpahanStatus, onClose?: () => void) => {
        const isBulk = uids.length > 1;
        try {
            const payload = uids.map((uid) => ({
                pelimpahan: status.toLowerCase(),
                transactionUid: uid,
            }));
            await update(payload);

            toast.success(
                "Status Updated",
                isBulk
                    ? `${uids.length} transactions updated to ${status}.`
                    : `Delegation status has been changed to ${status}.`
            );

            setSelectedUids(new Set());
            refetch();
            onClose?.();  // ← close modal/drawer setelah sukses
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            toast.error("Update Failed", e?.message ?? "Failed to update delegation status.");
        }
    };

    const handleExportReport = async ({
        searchBy,
        q,
        endDate,
    }: {
        searchBy: "paymentDate" | "transactionDate" | "createdAt";
        q: string;
        endDate: string;
    }) => {
        try {
            const res = await fetchReport({
                page: 1,
                limit: 10000000,
                sort: "createdAt",
                order: "desc",
                searchBy,
                q,
                endDate,
            });
            const rows = (res.data ?? []).filter(
                (r) => (r.typeTrx ?? "").toLowerCase() === "offline"
            );

            const roleDesc = role?.roleDesc;
            const isSuperAdmin = roleDesc === "Super Admin";
            const isFinance = roleDesc?.toLowerCase() === "finance";
            const isAdmin = roleDesc === "Admin";
            const isRegion = roleDesc === "Region";

            type Col = { header: string; value: (row: (typeof rows)[0]) => string };

            const colTransactionNumber: Col = { header: "Transaction Number", value: (r) => r.transactionNumber ?? "" };
            const colExternalTrxId: Col = { header: "External Trx ID", value: (r) => r.externalTrxId ?? "" };
            const colcustTrxId: Col = { header: "Customer Transaction ID", value: (r) => r.custTrxId ?? "" };
            const colTypeTrx: Col = { header: "Type", value: (r) => r.typeTrx ?? "" };
            const colMerchantId: Col = { header: "Merchant ID", value: (r) => r.merchantId ?? "" };
            const colRegionId: Col = { header: "Region ID", value: (r) => r.regionId ?? "" };
            const colSubMerchantId: Col = { header: "Sub-merchant ID", value: (r) => r.subMerchantId ?? "" };
            const colDeviceId: Col = { header: "Device ID", value: (r) => r.deviceId ?? "" };
            const colTransactionDate: Col = { header: "Transaction Date", value: (r) => r.transactionDate ?? "" };
            const colPaymentDate: Col = { header: "Payment Date", value: (r) => r.paymentDate ?? "" };
            const colCreatedAt: Col = { header: "Created At", value: (r) => r.createdAt ?? "" };
            const colPaymentCode: Col = { header: "Payment Code", value: (r) => r.paymentCode ?? "" };
            const colExtPaymentCode: Col = { header: "Ext Payment Code", value: (r) => r.extPaymentCode ?? "" };
            const colVaNumber: Col = { header: "VA Number", value: (r) => r.vaNumber ?? "" };
            const colAmountTotal: Col = { header: "Bruto", value: (r) => String(r.amountTotal ?? "") };

            // column for payment method emoney paylater
            const colEmBankMid: Col = {
                header: "Bank MID",
                value: (r) => r.details.em?.bankMid ?? "",
            };

            const colEmBankTid: Col = {
                header: "Bank TID",
                value: (r) => r.details.em?.bankTid ?? "",
            };

            const colEmCardType: Col = {
                header: "Card Type",
                value: (r) => r.details.em?.cardType ?? "",
            };

            const colEmCardNo: Col = {
                header: "Card No",
                value: (r) => r.details.em?.cardNo ?? "",
            };

            const colEmBalance: Col = {
                header: "Balance",
                value: (r) => String(r.details.em?.balance ?? ""),
            };

            const colEmTransCounter: Col = {
                header: "Trans Counter",
                value: (r) => r.details.em?.transCounter ?? "",
            };

            const colPaylaterCustomerName: Col = {
                header: "Customer Name",
                value: (r) => r.details.paylater?.customerName ?? "",
            };

            const colPaylaterCustomerPhone: Col = {
                header: "Customer Phone",
                value: (r) => r.details.paylater?.customerPhone ?? "",
            };

            const colPaylaterCustomerEmail: Col = {
                header: "Customer Email",
                value: (r) => r.details.paylater?.customerEmail ?? "",
            };

            const colPaylaterItems: Col = {
                header: "Paylater Items",
                value: (r) =>
                    r.details.paylater?.itemDetails
                        ?.map((item) => `${item.itemName} x${item.quantity}`)
                        .join(", ") ?? "",
            };

            const colPaylaterTotalItemPrice: Col = {
                header: "Paylater Item Total",
                value: (r) => {
                    const total =
                        r.details.paylater?.itemDetails?.reduce(
                            (sum, item) => sum + Number(item.totalPrice ?? 0),
                            0
                        ) ?? 0;

                    return String(total);
                },
            };

            const colPrice: Col = {
                header: "Merchant Price",
                value: (r) => {
                    const value = getActualValue(
                        r.amountTotal,
                        r.price?.price,
                        r.price?.isPercentage
                    );

                    return String(value);
                },
            };
            const colFeeRaw: Col = {
                header: "PG Price",
                value: (r) => {
                    const value = getActualValue(
                        r.amountTotal,
                        r.fee?.fee,
                        r.fee?.isPercentage
                    );

                    return String(value);
                },
            };
            const colMdrProfit: Col = {
                header: "MDR Profit",
                value: (r) => {
                    const price = getActualValue(
                        r.amountTotal,
                        r.price?.price,
                        r.price?.isPercentage
                    );

                    const fee = getActualValue(
                        r.amountTotal,
                        r.fee?.fee,
                        r.fee?.isPercentage
                    );

                    return String(price - fee);
                },
            };

            const colFeeMerged: Col = { header: "Fee", value: (r) => (r.amountTotal - r.nettProfit).toString() };
            const colNettProfit: Col = {
                header: "Nett Profit",
                value: (r) => (r.nettProfit != null ? String(r.nettProfit) : ""),
            };
            const colPelimpahan: Col = { header: "Delegation", value: (r) => r.pelimpahan?.toString() ?? "" };
            const colStatus: Col = { header: "Withdrawal Status", value: (r) => r.status ?? "" };
            const colExtStatus: Col = { header: "Status", value: (r) => r.extStatus ?? "" };
            const colPaymentNtb: Col = { header: "Payment NTB", value: (r) => r.paymentNtb ?? "" };

            const baseColumns: Col[] = [
                colTransactionNumber,
                colcustTrxId,
                colTypeTrx,
                colTransactionDate,
                colPaymentDate,
                colCreatedAt,
                colPaymentCode,
                colExtPaymentCode,
                colVaNumber,
                colExtStatus,
                colAmountTotal,
                colNettProfit,
            ];

            let columns: Col[];

            if (isSuperAdmin) {
                columns = [
                    ...baseColumns,

                    colPrice,
                    colFeeRaw,
                    colMdrProfit,
                    colPelimpahan,

                    colMerchantId,
                    colRegionId,
                    colSubMerchantId,
                    colDeviceId,

                    colExternalTrxId,
                    colStatus,
                    colPaymentNtb,

                    colEmBankMid,
                    colEmBankTid,
                    colEmCardType,
                    colEmCardNo,
                    colEmBalance,
                    colEmTransCounter,

                    colPaylaterCustomerName,
                    colPaylaterCustomerPhone,
                    colPaylaterCustomerEmail,
                    colPaylaterItems,
                    colPaylaterTotalItemPrice,
                ];
            } else if (isFinance) {
                columns = [
                    ...baseColumns,

                    colPrice,
                    colFeeRaw,
                    colMdrProfit,
                    // colPelimpahan,

                    colMerchantId,
                    colRegionId,
                    colSubMerchantId,
                    colDeviceId,

                    colExternalTrxId,
                    colStatus,
                ];
            } else if (isAdmin) {
                columns = [
                    ...baseColumns,
                    colFeeMerged,
                    colMerchantId,
                    colRegionId,
                    colSubMerchantId,
                    colStatus,
                ];
            } else if (isRegion) {
                columns = [...baseColumns, colRegionId, colSubMerchantId, colFeeMerged, colPaymentNtb];
            } else {
                columns = [...baseColumns, colSubMerchantId, colFeeMerged];
            }

            exportToExcel({
                rows,
                columns,
                fileName: `transaction-report-${q}-${endDate}`,
            });

            setOpenExportModal(false);
        } catch (error) {
            console.error(error);
            alert((error as Error)?.message ?? "Failed to export report");
        }
    };

    useEffect(() => {
        if (selectedSubMerchantId) {
            setFilterBy("subMerchantId");
            setId(selectedSubMerchantId);
            return;
        }

        if (selectedRegionId) {
            setFilterBy("regionId");
            setId(selectedRegionId);
            return;
        }

        if (isSuperAdmin && selectedMerchantId) {
            setFilterBy("merchantId");
            setId(selectedMerchantId);
            return;
        }

        setId("");
    }, [isSuperAdmin, selectedMerchantId, selectedRegionId, selectedSubMerchantId, setFilterBy, setId]);

    useEffect(() => {
        setSelectedRegionId("");
        setSelectedSubMerchantId("");
    }, [effectiveMerchantId]);

    useEffect(() => {
        setSelectedSubMerchantId("");
    }, [selectedRegionId]);

    useEffect(() => {
        if (!isSuperAdmin) {
            setSelectedMerchantId("");
        }
    }, [isSuperAdmin]);

    const roleBasedFilterNode = isSuperAdmin ? (
        <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-56 max-w-60">
                <SearchableSelect
                    label="Merchant"
                    placeholder="Search merchant..."
                    value={selectedMerchantId || undefined}
                    onChange={(value) => {
                        setPage(1);
                        setSelectedMerchantId(value ?? "");
                    }}
                    options={merchantOptions}
                    loading={merchantsLoading}
                    search={merchantSearch}
                    setSearch={setMerchantSearch}
                />
            </div>

            {selectedMerchantId && (
                <>
                    <div className="min-w-48 max-w-52">
                        <label className="mb-2 block text-sm font-medium text-gray-900">Region</label>
                        <select
                            value={selectedRegionId}
                            onChange={(e) => {
                                setPage(1);
                                setSelectedRegionId(e.target.value);
                            }}
                            disabled={!selectedMerchantId}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Regions</option>
                            {regionOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-56 max-w-60">
                        <label className="mb-2 block text-sm font-medium text-gray-900">Sub Merchant</label>
                        <select
                            value={selectedSubMerchantId}
                            onChange={(e) => {
                                setPage(1);
                                setSelectedSubMerchantId(e.target.value);
                            }}
                            disabled={!selectedMerchantId}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Sub Merchants</option>
                            {subMerchantOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}
        </div>
    ) : isAdmin ? (
        <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 max-w-52">
                <label className="mb-2 block text-sm font-medium text-gray-900">Region</label>
                <select
                    value={selectedRegionId}
                    onChange={(e) => {
                        setPage(1);
                        setSelectedRegionId(e.target.value);
                    }}
                    disabled={!effectiveMerchantId}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="">All Regions</option>
                    {regionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="min-w-56 max-w-60">
                <label className="mb-2 block text-sm font-medium text-gray-900">Sub Merchant</label>
                <select
                    value={selectedSubMerchantId}
                    onChange={(e) => {
                        setPage(1);
                        setSelectedSubMerchantId(e.target.value);
                    }}
                    disabled={!effectiveMerchantId}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="">All Sub Merchants</option>
                    {subMerchantOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    ) : null;



    const customFilterNode = (
        <>
            {roleBasedFilterNode}
        </>
    );

    const dateFilterNode = (
        <DateRangePickerModal
            searchBy={searchBy}
            q={q}
            endDate={endDate}
            onApply={({ searchBy: sb, q: newQ, endDate: newEnd }) => {
                setPage(1);
                setSelectedPaymentCode("");

                if (!newQ || !newEnd) {
                    setSearchBy("transactionNumber");
                    setQ("");
                    setEndDate("");
                    return;
                }

                setSearchBy(sb as TransactionKeySearch);
                setQ(newQ);
                setEndDate(newEnd);
            }}
            onClear={() => {
                setPage(1);
                setSearchBy("transactionNumber");
                setQ("");
                setEndDate("");
            }}
        />
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">STI Transaction Report</h1>
                    <p className="mt-2 text-slate-600">Manage transactions and monitor details</p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-3">
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>

                    {dateFilterNode}

                    <button
                        onClick={handleOpenExportModal}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Export Report
                    </button>

                    {loading && <span className="text-sm text-gray-500">Loading...</span>}
                </div>

                {selectedUids.size > 0 && (
                    <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-sm font-medium text-emerald-800">
                            {selectedUids.size} transaksi dipilih
                        </span>

                        <UpdatePelimpahanButton
                            transactionUids={Array.from(selectedUids)}
                            onSubmit={handleUpdatePelimpahan}
                            loading={pelimpahanLoading}
                        />

                        <button
                            onClick={() => setSelectedUids(new Set())}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Clear
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <DataTable<TransactionModel, TransactionSort>
                        columns={[
                            ...(isSuperAdmin || isDev ? [{
                                key: "transactionUid",
                                title: (
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                ) as unknown as string,
                                render: (row: TransactionModel) => (
                                    <input
                                        type="checkbox"
                                        checked={selectedUids.has(row.transactionUid)}
                                        onChange={() => toggleRow(row.transactionUid)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                ),
                            }] : []),
                            {
                                key: "transactionNumber",
                                title: "Transaction Number",
                                sortable: true,
                                sortKey: "transactionNumber",
                            },

                            {
                                key: "custTrxId",
                                title: "Merchant Trx ID",
                                sortable: true,
                                sortKey: "custTrxId",
                                render: (row) => row.custTrxId || "-",
                            },
                            {
                                key: "transactionDate",
                                title: "Transaction Date",
                                sortable: true,
                                sortKey: "transactionDate",
                                render: (row) => row.transactionDate,
                            },
                            {
                                key: "paymentDate",
                                title: "Payment Date",
                                sortable: true,
                                sortKey: "paymentDate",
                                render: (row) => row.paymentDate || "-",
                            },
                            {
                                key: "paymentCode",
                                title: "Payment Name",
                                sortable: true,
                                sortKey: "paymentCode",
                                render: (row) => {
                                    const method = paymentMethods.find((pm) => pm.paymentCode === row.paymentCode);
                                    if (!method) return row.paymentCode;
                                    const bank = method.bank?.trim() || "-";
                                    const category = method.category?.catDesc?.trim() || "-";
                                    return `${bank} (${category})`;
                                },
                            },
                            {
                                key: "merchantDesc",
                                title: "Merchant",
                            },
                            {
                                key: "regionDesc",
                                title: "Region",
                            },
                            {
                                key: "subMerchantDesc",
                                title: "Sub Merchant",
                            },
                            {
                                key: "status",
                                title: "Status",
                                sortable: true,
                                sortKey: "status",
                                render: (row) => {
                                    const method = paymentMethods.find((pm) => pm.paymentCode === row.paymentCode);
                                    const category = row.category?.trim() || method?.category?.catDesc;
                                    return <StatusBadge status={row.status} category={category} />;
                                },
                                headerInfo: <StatusLegendButton onClick={() => setShowLegend("status")} />,
                            },
                            {
                                key: "statusWebhook",
                                title: "Status Webhook",
                                render: (row) => <WebhookStatusBadge status={row.statusWebhook} />,
                                headerInfo: <StatusLegendButton onClick={() => setShowLegend("webhook")} />,
                            },
                            ...(isSuperAdmin || isDev ? [{
                                key: "pelimpahan",
                                title: "Status Delegation",
                                headerInfo: <StatusLegendButton onClick={() => setShowLegend("delegation")} />,
                                render: (row: TransactionModel) => {
                                    const status = (row.pelimpahan ?? "").toString().toUpperCase();

                                    const styleMap: Record<string, { bg: string; text: string; dot: string; border: string; label: string }> = {
                                        PENDING: {
                                            bg: "#fffbeb",
                                            text: "#b45309",
                                            dot: "#fbbf24",
                                            border: "#fde68a",
                                            label: "Pending",
                                        },
                                        DONE: {
                                            bg: "#f0fdf4",
                                            text: "#15803d",
                                            dot: "#22c55e",
                                            border: "#bbf7d0",
                                            label: "Done",
                                        },
                                        FAILED: {
                                            bg: "#fef2f2",
                                            text: "#b91c1c",
                                            dot: "#ef4444",
                                            border: "#fecaca",
                                            label: "Failed",
                                        },
                                    };

                                    const s = styleMap[status];

                                    if (!s) return <span className="text-gray-400 text-xs">-</span>;

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
                                                backgroundColor: s.bg,
                                                color: s.text,
                                                border: `1px solid ${s.border}`,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "9999px",
                                                    backgroundColor: s.dot,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {s.label}
                                        </span>
                                    );
                                },
                            }] : []),
                            {
                                key: "nettProfit",
                                title: "Nett Profit",
                                render: (row) => `Rp ${row.nettProfit.toLocaleString("id-ID")}`,
                            },
                            {
                                key: "amountTotal",
                                title: "Bruto",
                                render: (row) => `Rp ${row.amountTotal.toLocaleString("id-ID")}`,
                            },
                        ]}
                        data={items as TransactionModel[]}
                        loading={loading}
                        searchable
                        searchPlaceholder="Search Transactions..."
                        searchByOptions={TRANSACTION_SEARCH_BY_OPTIONS}
                        searchBy={tableSearchBy}
                        onSearchByChange={(val) => {
                            setPage(1);
                            setSearchBy(val as TransactionKeySearch);
                            if (isDateSearchBy(searchBy)) {
                                setQ("");
                                setEndDate("");
                            }
                            if (val !== "paymentCode" && selectedPaymentCode) {
                                setSelectedPaymentCode("");
                                setQ("");
                            }
                        }}
                        onSearch={(val) => {
                            setPage(1);
                            if (isDateSearchBy(searchBy)) {
                                setSearchBy(tableSearchBy as TransactionKeySearch);
                                setEndDate("");
                            }
                            setQ(val);
                        }}
                        filters={[
                            {
                                key: "status",
                                label: "Status",
                                value: statusFilter,
                                options: STATUS_FILTER_OPTIONS,
                                onChange: (v) => {
                                    setPage(1);
                                    setStatusFilter(v);
                                    setEndDate("");
                                    if (v) {
                                        setSearchBy("extStatus");
                                        setQ(v);
                                    } else {
                                        setSearchBy("typeTrx");
                                        setQ("offline");
                                    }
                                },
                            },
                        ]}
                        customFilters={customFilterNode}
                        order={order}
                        sort={sort}
                        onSortChange={(nextSort, nextOrder) => {
                            setPage(1);
                            setSort(nextSort);
                            setOrder(nextOrder);
                        }}
                        pagination={tablePagination}
                        onPageChange={(nextZeroBased) => setPage(nextZeroBased + 1)}
                        actions={{
                            header: "Details",
                            render: (row) => (
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleOpenDrawer(row)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
                                    >
                                        <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        View
                                    </button>
                                </div>
                            ),
                        }}
                        emptyText="No transactions found"
                    />
                </div>
            </div>

            {openModalDrawer && selectedTransaction && (
                <DetailTransactionDrawer
                    data={selectedTransaction}
                    onClose={() => setOpenModalDrawer(false)}
                    onRefetch={refetch}
                    onUpdatePelimpahan={(uids, status) => handleUpdatePelimpahan(uids, status, () => setOpenModalDrawer(false))}
                    pelimpahanLoading={pelimpahanLoading}
                    onResetWebhook={handleResetWebhook}
                    resetWebhookLoading={resetWebhookLoading}
                />
            )}

            <ExportTransactionReportModal
                key={exportModalKey}
                open={openExportModal}
                loading={reportLoading}
                onClose={() => setOpenExportModal(false)}
                onSubmit={handleExportReport}
            />

            <ToastContainer toasts={toasts} onRemove={clear} />

            {showLegend && (
                <StatusLegendDialog section={showLegend} onClose={() => setShowLegend(null)} />
            )}

        </div>
    );
}
