import { useState } from "react";
import { useUpdatePelimpahan } from "../../../../../hooks/useTransaction";
import { useToast, ToastContainer } from "../../../../../components/shared/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type PelimpahanStatus = "PENDING" | "DONE" | "FAILED";

type UpdatePelimpahanButtonProps =
    | {
        transactionUid: string;
        transactionUids?: never;
        currentStatus?: string;
        onSubmit: (uids: string[], status: PelimpahanStatus) => Promise<void>;
        loading?: boolean;
    }
    | {
        transactionUids: string[];
        transactionUid?: never;
        currentStatus?: never;
        onSubmit: (uids: string[], status: PelimpahanStatus) => Promise<void>;
        loading?: boolean;
    };

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
    PelimpahanStatus,
    {
        label: string;
        bg: string;
        border: string;
        text: string;
        dot: string;
        ring: string;
        activeBg: string;
        activeBorder: string;
        activeText: string;
    }
> = {
    PENDING: {
        label: "Pending",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        dot: "bg-amber-400",
        ring: "ring-amber-300",
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-400",
        activeText: "text-amber-800",
    },
    DONE: {
        label: "Done",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        ring: "ring-emerald-300",
        activeBg: "bg-emerald-50",
        activeBorder: "border-emerald-500",
        activeText: "text-emerald-800",
    },
    FAILED: {
        label: "Failed",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        dot: "bg-red-500",
        ring: "ring-red-300",
        activeBg: "bg-red-50",
        activeBorder: "border-red-400",
        activeText: "text-red-800",
    },
};

// ─── Confirm Button Colors ────────────────────────────────────────────────────
const CONFIRM_BTN: Record<PelimpahanStatus, string> = {
    PENDING: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300",
    DONE: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300",
    FAILED: "bg-red-600 hover:bg-red-700 focus:ring-red-300",
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function UpdatePelimpahanModal({
    transactionUids,
    currentStatus,
    onClose,
    onSubmit,
}: {
    transactionUids: string[];
    currentStatus?: string;
    onClose: () => void;
    onSubmit: (uids: string[], status: PelimpahanStatus) => Promise<void>;
    onSuccess?: () => void;
    loading?: boolean;
}) {
    const [selected, setSelected] = useState<PelimpahanStatus | null>(null);
    const [error] = useState<string | null>(null);

    const { loading } = useUpdatePelimpahan();
    const { toasts, clear } = useToast();

    const isBulk = transactionUids.length > 1;

    const handleSubmit = async () => {
        if (!selected) return;
        await onSubmit(transactionUids, selected);  // lempar sepenuhnya ke page
    };

    return (
        <div
            className="fixed inset-0 z-60 bg-black/30 backdrop-blur-[3px] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Card */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                            Update Delegation
                        </p>
                        {isBulk && (
                            <p className="text-sm font-semibold text-slate-700 mt-0.5">
                                {transactionUids.length} transactions selected
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mt-0.5"
                    >
                        <svg
                            width="15"
                            height="15"
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

                {/* Body */}
                <div className="px-5 py-5">
                    <p className="text-xs text-slate-500 mb-3 font-medium">
                        Select a new delegation status:
                    </p>

                    {/* Status Options */}
                    <div className="flex flex-col gap-2">
                        {(Object.keys(STATUS_CONFIG) as PelimpahanStatus[]).map((status) => {
                            const cfg = STATUS_CONFIG[status];
                            const isSelected = selected === status;
                            // currentStatus hanya relevan untuk mode satuan
                            const isCurrent =
                                !isBulk && currentStatus?.toUpperCase() === status;

                            return (
                                <button
                                    key={status}
                                    disabled={isCurrent}
                                    onClick={() => setSelected(status)}
                                    className={`
                                        group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left
                                        transition-all duration-150
                                        ${isCurrent
                                            ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200"
                                            : isSelected
                                                ? `${cfg.activeBg} ${cfg.activeBorder} `
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    {/* Radio */}
                                    <span
                                        className={`
                                            w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                            ${isSelected
                                                ? `${cfg.border} ${cfg.bg}`
                                                : "border-slate-300 bg-white"
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        )}
                                    </span>

                                    {/* Label */}
                                    <span className="flex items-center gap-2 flex-1">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                        <span
                                            className={`text-sm font-semibold ${isSelected ? cfg.activeText : "text-slate-700"
                                                }`}
                                        >
                                            {cfg.label}
                                        </span>
                                    </span>

                                    {/* Current Badge — hanya untuk satuan */}
                                    {isCurrent && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                                            Current
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!selected || loading}
                        onClick={handleSubmit}
                        className={`
                            flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold
                            transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                            ${selected ? CONFIRM_BTN[selected] : "bg-slate-400"}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                    />
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            "Confirm"
                        )}
                    </button>
                </div>
            </div>
            <ToastContainer toasts={toasts} onRemove={clear} />

        </div>

    );
}

// ─── Main Button Component ────────────────────────────────────────────────────
export function UpdatePelimpahanButton(props: UpdatePelimpahanButtonProps) {
    const [open, setOpen] = useState(false);

    // Normalise ke array untuk diteruskan ke modal
    const uids =
        props.transactionUids ?? (props.transactionUid ? [props.transactionUid] : []);

    const isBulk = uids.length > 1;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                    bg-slate-900 hover:bg-slate-700 active:scale-95
                    text-white text-xs font-semibold tracking-wide
                    transition-all shadow-sm
                "
            >
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                </svg>

                {isBulk ? `Update Delegation (${uids.length})` : "Update Delegation"}
            </button>

            {open && (
                <UpdatePelimpahanModal
                    transactionUids={uids}
                    currentStatus={props.currentStatus}
                    onClose={() => setOpen(false)}
                    onSubmit={props.onSubmit}      // ← tambah
                    loading={props.loading}        // ← tambah
                />
            )}
        </>
    );
}