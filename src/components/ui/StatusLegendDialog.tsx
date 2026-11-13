"use client";

import { useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import {
    DELEGATION_LEGEND,
    LegendItem,
    LegendSectionKey,
    STATUS_LEGEND,
    WEBHOOK_LEGEND,
} from "@/app/dashboard/transactions/_lib/status-legend";

function LegendPill({ item }: { item: LegendItem }) {
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
                backgroundColor: item.style.bgColor,
                color: item.style.textColor,
                border: `1px solid ${item.style.borderColor}`,
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: item.style.dotColor,
                    flexShrink: 0,
                }}
            />
            {item.label}
        </span>
    );
}

function LegendSection({ items }: { items: LegendItem[] }) {
    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                    <LegendPill item={item} />

                    <span className="text-xs leading-relaxed text-gray-600">
                        {item.description}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function StatusLegendButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Keterangan status"
            className="ml-1.5 inline-flex cursor-pointer items-center align-middle text-gray-400 transition-colors hover:text-blue-600"
        >
            <HelpCircle className="h-3.5 w-3.5" />
        </button>
    );
}

const LEGEND_SECTIONS: Record<
    LegendSectionKey,
    { title: string; description: string; items: LegendItem[] }
> = {
    status: {
        title: "Keterangan Status Transaksi",
        description: "Arti setiap status transaksi pada tabel.",
        items: STATUS_LEGEND,
    },
    webhook: {
        title: "Keterangan Status Webhook",
        description: "Arti setiap status webhook pada tabel.",
        items: WEBHOOK_LEGEND,
    },
    delegation: {
        title: "Keterangan Status Delegation",
        description: "Arti setiap status delegation (pelimpahan) pada tabel.",
        items: DELEGATION_LEGEND,
    },
};

export function StatusLegendDialog({
    section,
    onClose,
}: {
    section: LegendSectionKey;
    onClose: () => void;
}) {
    const config = LEGEND_SECTIONS[section];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">{config.title}</p>
                        <p className="mt-0.5 text-xs text-foreground/60">{config.description}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-2 rounded-md p-1 transition-colors hover:bg-muted"
                    >
                        <X className="h-4 w-4 text-foreground/70" />
                    </button>
                </div>

                <div className="space-y-5">
                    <LegendSection items={config.items} />
                </div>
            </div>
        </div>
    );
}
