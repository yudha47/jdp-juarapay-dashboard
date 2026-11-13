import { PaymentMethodModel } from "@/data/models/PaymentMethodModel";

const PM_COLORS: Record<string, string> = {
    QRIS: "bg-blue-50 text-blue-700 border-blue-200",
    VA: "bg-violet-50 text-violet-700 border-violet-200",
    EDC: "bg-amber-50 text-amber-700 border-amber-200",
};

export function PaymentBadge({ method }: { method: PaymentMethodModel }) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PM_COLORS[method.paymentCode]}`}
        >
            {method.paymentCode}
        </span>
    );
}