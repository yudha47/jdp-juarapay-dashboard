import { useState } from "react";

type ReportSearchBy = "paymentDate" | "transactionDate" | "createdAt";

interface ExportTransactionReportModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { searchBy: ReportSearchBy; q: string; endDate: string }) => void;
}

const fmt = (d: Date): string => d.toISOString().slice(0, 10);

type Shortcut = "today" | "yesterday" | "last2days" | "thisweek" | "thismonth";

const SHORTCUTS: { label: string; value: Shortcut }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 2 days", value: "last2days" },
  { label: "This week", value: "thisweek" },
  { label: "This month", value: "thismonth" },
];

const resolveShortcut = (type: Shortcut): { startDate: string; endDate: string } => {
  const now = new Date();
  if (type === "today") return { startDate: fmt(now), endDate: fmt(now) };
  if (type === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { startDate: fmt(y), endDate: fmt(y) };
  }
  if (type === "last2days") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { startDate: fmt(y), endDate: fmt(now) };
  }
  if (type === "thisweek") {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMonday);
    return { startDate: fmt(mon), endDate: fmt(now) };
  }
  // thismonth
  return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: fmt(now) };
};

export function ExportTransactionReportModal({
  open,
  loading = false,
  onClose,
  onSubmit,
}: ExportTransactionReportModalProps) {
  const [searchBy, setSearchBy] = useState<ReportSearchBy>("createdAt");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59:59");
  const [activeShortcut, setActiveShortcut] = useState<Shortcut | null>(null);
  const [error, setError] = useState("");

  if (!open) return null;

  const applyShortcut = (type: Shortcut) => {
    const { startDate: s, endDate: e } = resolveShortcut(type);
    setStartDate(s);
    setEndDate(e);
    setStartTime("00:00:00");
    setEndTime("23:59:59");
    setActiveShortcut(type);
    setError("");
  };

  const handleSubmit = () => {
    setError("");
    if (!startDate) { setError("Start date wajib diisi"); return; }
    if (!endDate) { setError("End date wajib diisi"); return; }
    const fullStart = `${startDate}T${startTime}`;
    const fullEnd = `${endDate}T${endTime}`;
    if (fullStart > fullEnd) { setError("Start date tidak boleh lebih besar dari end date"); return; }
    onSubmit({ searchBy, q: fullStart, endDate: fullEnd });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">Export report</p>
            <p className="text-xs text-gray-400 mt-0.5">Pilih filter tanggal untuk export report</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Search By */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Search by</label>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as ReportSearchBy)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white"
            >
              <option value="createdAt">Created at</option>
              <option value="paymentDate">Payment date</option>
              <option value="transactionDate">Transaction date</option>
            </select>
          </div>

          {/* Shortcuts */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Quick select</label>
            <div className="flex flex-wrap gap-1.5">
              {SHORTCUTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => applyShortcut(s.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeShortcut === s.value
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start date</label>
              <div className="rounded-lg border border-gray-200 px-2.5 py-2 space-y-2">
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => { setStartDate(e.target.value); setActiveShortcut(null); }}
                    className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                  />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="time"
                    step="1"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setActiveShortcut(null); }}
                    className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                  />
                </div>
              </div>
            </div>

            {/* End */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End date</label>
              <div className="rounded-lg border border-gray-200 px-2.5 py-2 space-y-2">
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => { setEndDate(e.target.value); setActiveShortcut(null); }}
                    className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                  />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="time"
                    step="1"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setActiveShortcut(null); }}
                    className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {loading ? "Processing..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}