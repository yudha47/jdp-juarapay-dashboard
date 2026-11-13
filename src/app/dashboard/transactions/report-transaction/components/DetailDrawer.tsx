import { TransactionDetail } from "@/data/models/TransactionDetailListModel";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: string }) {
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

  const s =
    map[status?.toUpperCase()] ?? {
      bg: "bg-slate-100 border border-slate-200",
      text: "text-slate-600",
      dot: "bg-slate-400",
    };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className={`text-sm text-slate-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value ?? <span className="text-slate-300 italic">—</span>}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      <div className={`px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 ${accent ?? "bg-slate-50"}`}>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

function ColSpan({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="col-span-2">
      <Field label={label} value={value} mono={mono} />
    </div>
  );
}

type Props = {
  onClose: () => void;
  data?: TransactionDetail;
}

export function DetailTransactionDLDrawer({ onClose, data }: Props) {
  if (!data) {
    return <div>Transaction tidak ditemukan</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            .drawer-root { font-family: 'DM Sans', sans-serif; }
            .mono { font-family: 'JetBrains Mono', monospace; }
            .drawer-in { animation: slideIn 0.28s cubic-bezier(0.32, 0.72, 0, 1) both; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .overlay-in { animation: fadeIn 0.2s ease both; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .tab-active { border-bottom: 2px solid #0f172a; color: #0f172a; font-weight: 700; }
            .tab-inactive { border-bottom: 2px solid transparent; color: #94a3b8; }
            .tab-inactive:hover { color: #475569; }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
            `}</style>

      <div className="overlay-in absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      <div className="drawer-in drawer-root relative w-full max-w-110 bg-slate-50 shadow-2xl flex flex-col h-full">
        <div className="bg-white border-b border-slate-100 px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Transaction Detail
              </p>
              <h2 className="text-base font-bold text-slate-900 mono">
                {data.transactionNumber}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
              <button
                onClick={onClose}
                className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-5 flex items-end gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(data.amountTotal)}
              </p>
            </div>
            <div className="mb-1 flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Nett Profit</span>
                <span className="text-xs font-semibold text-slate-600">
                  {formatCurrency(data.nettProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <Section title="Payment Info">
            <Field label="Payment Date" value={data.paymentDate ? formatDate(data.paymentDate) : "-"} />
            <Field label="Type" value={data.typeTrx} />
            <Field label="Channel ID" value={data.channelId} />
            <ColSpan label="VA Number" value={data.vaNumber} mono />
            <Field label="Payment Code" value={data.paymentCode} mono />
            <Field label="Ext. Payment Code" value={data.extPaymentCode} mono />
            <ColSpan label="Payment NTB" value={data.paymentNtb} mono />
            <Field label="Payment ID" value={data.paymentId} mono />
            <Field label="Ext. Status" value={data.extStatus} />
            <ColSpan label="Partner Svc ID" value={data.partnerServiceId} mono />
          </Section>

          <Section title="Fee & Price">
            <Field
              label="Fee"
              value={
                !data.fee
                  ? "-"
                  : data.fee.isPercentage === "Y"
                    ? `${data.fee.fee}% (percentage)`
                    : formatCurrency(data.fee.fee)
              }
            />
            <Field
              label="Price"
              value={data.price === null
                ? "0"
                : data.price.isPercentage === "Y"
                  ? `${data.price.price}% (percentage)`
                  : formatCurrency(data.price.price)
              }
            />
          </Section>

          <Section title="Merchant Info">
            <Field label="Merchant ID" value={data.merchantId} mono />
            <Field label="Sub Merchant" value={data.subMerchantId} mono />
            <Field label="Region" value={data.regionId} />
            <Field label="Device ID" value={data.deviceId} mono />
            <Field label="Bank MID" value={data.details?.em?.bankMid} mono />
            <Field label="Bank TID" value={data.details?.em?.bankTid} mono />
          </Section>

          <Section title="Timeline">
            <Field label="Transaction Date" value={data.transactionDate ? formatDate(data.transactionDate) : "-"} />
            <Field label="Expires" value={data.transactionExp ? formatDate(data.transactionExp) : "-"} />
            <Field label="Payment Date" value={data.paymentDate ? formatDate(data.paymentDate) : "-"} />
            <Field label="Payment ISO" value={data.datetimePaymentIso ? formatDate(data.datetimePaymentIso) : "-"} />
            <Field label="Created At" value={data.createdAt ? formatDate(data.createdAt) : "-"} />
            <Field label="Updated At" value={data.updatedAt ? formatDate(data.updatedAt) : "-"} />
          </Section>

        </div>

        <div className="shrink-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Last Updated
            </p>
            <p className="text-xs text-slate-600 font-medium">{formatDate(data.updatedAt)}</p>
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
  )
}