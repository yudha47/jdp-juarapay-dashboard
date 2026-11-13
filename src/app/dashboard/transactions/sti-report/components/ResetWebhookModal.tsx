import { useState } from "react";

type ResetWebhookButtonProps = {
    transactionUid: string;
    onConfirm: (transactionUid: string) => Promise<void>;
    loading?: boolean;
};

export function ResetWebhookButton({ transactionUid, onConfirm, loading }: ResetWebhookButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirm = async () => {
        await onConfirm(transactionUid);
        setShowConfirm(false);
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {loading ? "Resetting..." : "Reset Webhook"}
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-60 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                        onClick={() => !loading && setShowConfirm(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                    <path d="M12 9v4M12 17h.01" />
                                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Reset Webhook</h3>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to reset the webhook for this transaction? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Resetting..." : "Yes, Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}