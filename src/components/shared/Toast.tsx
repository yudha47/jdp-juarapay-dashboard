"use client";

import { useEffect, useState, useCallback, JSX } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const icons: Record<ToastType, JSX.Element> = {
    success: (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
        </svg>
    ),
    info: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
};

const styles: Record<ToastType, string> = {
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
    warning: "border-amber-200 bg-amber-50",
    info: "border-blue-200 bg-blue-50",
};

const progressStyles: Record<ToastType, string> = {
    success: "bg-green-400",
    error: "bg-red-400",
    warning: "bg-amber-400",
    info: "bg-blue-400",
};

const DURATION = 4000;

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // mount animation
        requestAnimationFrame(() => setVisible(true));

        // progress bar
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
            setProgress(remaining);
        }, 16);

        // auto remove
        const timeout = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, DURATION);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [toast.id, onRemove]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`relative w-80 overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ${styles[toast.type]} ${
                visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                    {toast.message && <p className="mt-0.5 text-xs text-gray-600">{toast.message}</p>}
                </div>
                <button
                    onClick={handleClose}
                    className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-black/5">
                <div
                    className={`h-full transition-all ease-linear ${progressStyles[toast.type]}`}
                    style={{ width: `${progress}%`, transitionDuration: "16ms" }}
                />
            </div>
        </div>
    );
}

// ─── Toast Container ───────────────────────────────────────────────────────────
interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ─── useToast Hook ─────────────────────────────────────────────────────────────
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const clear = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, title, message }]);
    }, []);

    const toast = {
        success: (title: string, message?: string) => show("success", title, message),
        error: (title: string, message?: string) => show("error", title, message),
        warning: (title: string, message?: string) => show("warning", title, message),
        info: (title: string, message?: string) => show("info", title, message),
    };

    return { toasts, toast, clear };
}
