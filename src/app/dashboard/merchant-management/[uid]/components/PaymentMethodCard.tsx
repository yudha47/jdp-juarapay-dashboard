import { PaymentMethodByMerchantModel } from "@/data/models/PaymentMethodModel";
import { formatCurrency } from "@/utils/formatCurrency";

export function PaymentMethodCard({ pm }: { pm: PaymentMethodByMerchantModel }) {
  const isPercentage = pm.price?.isPercentage === "Y";
  const priceDisplay = pm.price
    ? isPercentage
      ? `${pm.price.price} %`
      : `${formatCurrency(pm.price.price)}`
    : "—";

  const isPercentageFee = pm.fee?.isPercentage === "Y";
  const feeDisplay = pm.fee
    ? isPercentageFee
      ? `${pm.fee.fee} %`
      : `${formatCurrency(pm.fee.fee)}`
    : "—";

  return (
    <div className="bg-background border border-border rounded-lg p-2.5 flex flex-col gap-1.5 hover:border-primary/40 transition-colors">
      {/* Bank name + badge */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold truncate">{pm.bank}</span>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0 leading-tight">
          Active
        </span>
      </div>

      {/* Payment code */}
      <p className="text-[10px] text-foreground/40 font-mono leading-none">{pm.paymentCode}</p>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Detail */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] text-foreground/50 truncate">{pm.category?.catDesc || "—"}</p>
        <p className="text-[10px] text-foreground/50 truncate">{pm.pgate?.pgDesc || "—"}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Fee & Price */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-foreground/40">PG Price</span> {/* fee */}
          <span className="text-[11px] font-semibold text-blue-600 font-mono">{feeDisplay}</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-foreground/40">Merchant Price</span>
          <span className="text-[11px] font-semibold text-violet-600 font-mono">{priceDisplay}</span>
        </div>
      </div>
    </div>
  );
}