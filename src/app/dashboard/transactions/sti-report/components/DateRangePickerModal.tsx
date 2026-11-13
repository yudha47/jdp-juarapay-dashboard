/* eslint-disable react-hooks/set-state-in-effect */
// components/DateRangePickerModal.tsx
import { useState, useEffect, useRef } from "react";

type DateType = "transactionDate" | "paymentDate" | "createdAt";

interface Props {
  searchBy: string;
  q: string;
  endDate: string;
  onApply: (params: { searchBy: DateType; q: string; endDate: string }) => void;
  onClear: () => void;
}

const DATE_TYPE_OPTIONS = [
  { label: "Transaction Date", value: "transactionDate" as DateType },
  { label: "Payment Date",     value: "paymentDate"     as DateType },
  { label: "Created At",       value: "createdAt"       as DateType },
];

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);

  return result;
};

export function DateRangePickerModal({ searchBy, q, endDate, onApply, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [dateType, setDateType] = useState<DateType>("transactionDate");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endDateLocal, setEndDateLocal] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const overlayRef = useRef<HTMLDivElement>(null);

  const isDateSearchBy = (v: string) =>
    v === "paymentDate" || v === "transactionDate" || v === "createdAt";

  const hasActiveFilter = isDateSearchBy(searchBy) && q && endDate;

  // Sync state from parent when cleared externally
  useEffect(() => {
    if (!q) {
      setStartDate("");
      setStartTime("00:00");
      setEndDateLocal("");
      setEndTime("23:59");
    }
  }, [q]);

  const handleOpen = () => {
    if (isDateSearchBy(searchBy)) setDateType(searchBy as DateType);
    if (q) setStartDate(q.split("T")[0]);
    if (endDate) setEndDateLocal(endDate.split("T")[0]);
    setOpen(true);
  };

  const handleApply = () => {
    if (!startDate || !endDateLocal) return;

    const q = `${startDate}T${startTime}:00`;
    const end = `${endDateLocal}T${endTime}:00`;
    onApply({ searchBy: dateType, q, endDate: end });
    setOpen(false);
  };

  const applyShortcut = (start: Date, end: Date) => {
    setStartDate(formatInputDate(start));
    setStartTime("00:00");
    setEndDateLocal(formatInputDate(end));
    setEndTime("23:59");
  };

  const shortcutOptions = [
    {
      label: "Today",
      onClick: () => {
        const today = new Date();
        applyShortcut(today, today);
      },
    },
    {
      label: "Yesterday",
      onClick: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        applyShortcut(yesterday, yesterday);
      },
    },
    {
      label: "Last 2 days",
      onClick: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 2);
        applyShortcut(start, today);
      },
    },
    {
      label: "This week",
      onClick: () => {
        const today = new Date();
        const monday = getStartOfWeek(today);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        applyShortcut(monday, sunday);
      },
    },
    {
      label: "This month",
      onClick: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        applyShortcut(firstDay, lastDay);
      },
    },
  ];


  const handleClear = () => {
    setStartDate("");
    setStartTime("00:00");
    setEndDateLocal("");
    setEndTime("23:59");
    onClear();
    setOpen(false);
  };

  const canApply = Boolean(startDate && endDateLocal);

  const formatLabel = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const triggerLabel = hasActiveFilter && q
    ? `${formatLabel(q.split("T")[0])} – ${endDate ? formatLabel(endDate.split("T")[0]) : "..."}`
    : "Filter by date";

  return (
    <>
      {/* Trigger button */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasActiveFilter
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{triggerLabel}</span>
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            title="Clear date filter"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-lg border border-gray-200 mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Filter by date</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Date type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Date type</label>
                <select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value as DateType)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                >
                  {DATE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {shortcutOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={option.onClick}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Start */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">Start</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* End */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">End</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <input
                      type="date"
                      value={endDateLocal}
                      min={startDate || undefined}
                      onChange={(e) => setEndDateLocal(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button
                onClick={handleClear}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                disabled={!canApply}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
