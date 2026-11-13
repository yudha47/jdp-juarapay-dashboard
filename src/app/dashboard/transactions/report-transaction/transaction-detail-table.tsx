"use client";

import { DataTable } from "@/components/shared/datatable/DataTable";
import { Column } from "@/components/shared/datatable/types";
import { TransactionDLSort, TransactionDLKeySearch, TransactionDetail } from "@/data/models/TransactionDetailListModel";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import { calculateTransactionProfit } from "../transaction-list/components/DetailTransactionDrawer";

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
  "pending-paid": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-700", dot: "bg-sky-400" },
  request: { bg: "bg-sky-50 border border-sky-200", text: "text-sky-700", dot: "bg-sky-400" },
  paid: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  success: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  approved: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  failed: { bg: "bg-red-50 border border-red-200", text: "text-red-700", dot: "bg-red-500" },
  expired: { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
  inactive: { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
  reject: { bg: "bg-rose-50 border border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  done: { bg: "bg-teal-50 border border-teal-200", text: "text-teal-700", dot: "bg-teal-500" },
  appjpay: { bg: "bg-violet-50 border border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
};

const BADGE_LABEL: Record<string, string> = {
  appjpay: "via juaraPay",
};

const DEFAULT_BADGE = {
  bg: "bg-slate-100 border border-slate-200",
  text: "text-slate-600",
  dot: "bg-slate-400",
};

function StatusBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-gray-400">-</span>;
  const key = value.toLowerCase();
  const s = STATUS_BADGE[key] ?? DEFAULT_BADGE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {BADGE_LABEL[key] ?? value}
    </span>
  );
}

function MonoCell({ value, title }: { value?: string | null; title?: string }) {
  if (!value) return <span className="text-gray-400">-</span>;
  return (
    <span className="font-mono text-xs text-gray-700 whitespace-nowrap" title={title ?? value}>
      {value}
    </span>
  );
}

function DateCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-gray-400">-</span>;
  return <span className="text-xs text-gray-600 whitespace-nowrap">{formatDate(value)}</span>;
}

function MoneyCell({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-gray-400">-</span>;
  return <span className="font-medium whitespace-nowrap">{formatCurrency(value)}</span>;
}

function FeePriceCell({ value, isPercentage }: { value?: number | null; isPercentage?: string | null }) {
  if (value == null) return <span className="text-gray-400">-</span>;
  if (isPercentage === "Y") return <span className="whitespace-nowrap">{value}%</span>;
  return <span className="whitespace-nowrap">{formatCurrency(value)}</span>;
}

const SEARCH_BY_OPTIONS = [
  { label: "Payment Code", value: "paymentCode" },
  { label: "Trx Number", value: "transactionNumber" },
  { label: "Ext Status", value: "extStatus" },
  { label: "Created At", value: "createdAt" },
];

const FILTER_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Expired", value: "expired" },
  { label: "Failed", value: "failed" },
  { label: "Inactive", value: "inactive" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Pending Paid", value: "pending-paid" },
  { label: "Reject", value: "reject" },
  { label: "Request", value: "request" },
];

type Props = {
  data: TransactionDetail[];
  pagination: {
    page: number;
    totalPages: number;
    limit: number;
  };
  params: {
    page: number;
    sort: TransactionDLSort;
    order: "asc" | "desc";
    searchBy?: TransactionDLKeySearch;
    q?: string;
    status?: string;
  };
  onParamsChange: (p: Partial<Props["params"]>) => void;
  onDetailClick: (row: TransactionDetail) => void;
};

export function TransactionDetailTable({
  data,
  pagination,
  params,
  onParamsChange,
  onDetailClick,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("");

  const columns: Column<TransactionDetail, TransactionDLSort>[] = [
    {
      key: "transactionNumber",
      title: "Trx Number",
      sortable: true,
      render: (row) => <MonoCell value={row.transactionNumber} />,
    },
    {
      key: "externalTrxId",
      title: "Ext Trx ID",
      render: (row) => <MonoCell value={row.externalTrxId} />,
    },
    {
      key: "custTrxId",
      title: "Cust Trx ID",
      render: (row) => <MonoCell value={row.custTrxId} />,
    },
    {
      key: "typeTrx",
      title: "Type",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium whitespace-nowrap">
          {row.typeTrx}
        </span>
      ),
    },
    {
      key: "merchantId",
      title: "Merchant",
      render: (row) => <MonoCell value={row.merchantId} />,
    },
    {
      key: "productName",
      title: "Product",
      render: (row) => row.productName || <span className="text-gray-400">-</span>,
    },
    {
      key: "regionId",
      title: "Region",
      render: (row) => row.regionId || <span className="text-gray-400">-</span>,
    },
    {
      key: "subMerchantId",
      title: "Sub Merchant",
      render: (row) => row.subMerchantId || <span className="text-gray-400">-</span>,
    },
    {
      key: "channelId",
      title: "Channel ID",
      render: (row) => <MonoCell value={row.channelId} title={row.channelId ?? undefined} />,
    },
    {
      key: "partnerServiceId",
      title: "Partner Svc ID",
      render: (row) => <MonoCell value={row.partnerServiceId} />,
    },
    {
      key: "deviceId",
      title: "Device ID",
      render: (row) => <MonoCell value={row.deviceId} />,
    },
    {
      key: "paymentCode",
      title: "Payment Code",
      render: (row) => <MonoCell value={row.paymentCode} />,
    },
    {
      key: "pgDesc",
      title: "Payment Gateway",
      render: (row) => row.pgDesc || <span className="text-gray-400">-</span>,
    },
    {
      key: "extPaymentCode",
      title: "Ext Payment Code",
      render: (row) => <MonoCell value={row.extPaymentCode} />,
    },
    {
      key: "vaNumber",
      title: "VA Number",
      render: (row) => <MonoCell value={row.vaNumber} />,
    },
    {
      key: "transactionDate",
      title: "Trx Date",
      sortable: true,
      render: (row) => <DateCell value={row.transactionDate} />,
    },
    {
      key: "transactionExp",
      title: "Trx Exp",
      render: (row) => <DateCell value={row.transactionExp} />,
    },
    {
      key: "paymentDate",
      title: "Payment Date",
      sortable: true,
      render: (row) => <DateCell value={row.paymentDate} />,
    },
    {
      key: "datetimePaymentIso",
      title: "Payment ISO",
      render: (row) => <DateCell value={row.datetimePaymentIso} />,
    },
    {
      key: "amountTotal",
      title: "Amount",
      className: "text-right",
      render: (row) => <MoneyCell value={row.amountTotal} />,
    },
    {
      key: "fee",
      title: "Fee",
      render: (row) => (
        <FeePriceCell value={row.fee?.fee} isPercentage={row.fee?.isPercentage} />
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (row) => (
        <FeePriceCell value={row.price?.price} isPercentage={row.price?.isPercentage} />
      ),
    },
    {
      key: "profit",
      title: "Profit",
      render: (row) =>
        (() => {
          const { profitAmount, mdrLabel } = calculateTransactionProfit({
            amountTotal: row.amountTotal,
            fee: row.fee ?? undefined,
            price: row.price ?? undefined,
          });
          return (
            <div className="flex flex-col items-end">
              <span className="font-medium whitespace-nowrap">{formatCurrency(profitAmount)}</span>
              <span className="text-xs text-gray-500">{mdrLabel}</span>
            </div>
          );
        })(),
    },
    {
      key: "nettProfit",
      title: "Nett Profit",
      className: "text-right",
      render: (row) => <MoneyCell value={row.nettProfit} />,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "extStatus",
      title: "Ext Status",
      render: (row) => <StatusBadge value={row.extStatus} />,
    },
    {
      key: "pelimpahan",
      title: "Delegation",
      render: (row) => <StatusBadge value={row.pelimpahan} />,
    },
    {
      key: "statusWebhook",
      title: "Webhook",
      render: (row) => <StatusBadge value={row.statusWebhook} />,
    },
    {
      key: "paymentId",
      title: "Payment ID",
      render: (row) => <MonoCell value={row.paymentId} title={row.paymentId ?? undefined} />,
    },
    {
      key: "paymentNtb",
      title: "NTB",
      render: (row) => <MonoCell value={row.paymentNtb} />,
    },
    {
      key: "createdAt",
      title: "Created At",
      sortable: true,
      render: (row) => <DateCell value={row.createdAt} />,
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (row) => <DateCell value={row.updatedAt} />,
    },
  ];

  return (
    <DataTable<TransactionDetail, TransactionDLSort>
      columns={columns}
      data={data}
      searchable
      searchByOptions={SEARCH_BY_OPTIONS}
      searchBy={params.searchBy}
      onSearchByChange={(v) =>
        onParamsChange({ searchBy: v as TransactionDLKeySearch })
      }
      onSearch={(q) => onParamsChange({ q, page: 1 })}
      filters={[
        {
          key: "status",
          label: "Ext Status",
          type: "select",
          value: statusFilter,
          options: FILTER_OPTIONS,
          onChange: (v) => {
            setStatusFilter(v);
            onParamsChange({ searchBy: "extStatus", q: v, page: 1 });
          },
        },
      ]}
      sort={params.sort}
      order={params.order}
      onSortChange={(sort, order) => onParamsChange({ sort, order, page: 1 })}
      pagination={{
        currentPage: pagination.page,
        totalPage: pagination.totalPages,
        size: pagination.limit,
      }}
      onPageChange={(page) => onParamsChange({ page: page + 1 })}
      emptyText="No transactions found"
      actions={{
        header: "Actions",
        render: (row) => (
          <button
            onClick={() => onDetailClick(row)}
            className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Detail
          </button>
        ),
      }}
    />
  );
}
