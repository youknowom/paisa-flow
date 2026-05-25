"use client";

import { formatMoney } from "@/lib/format-money";

interface ChartTooltipContentProps {
  label: string;
  amount: number;
  currency: string;
}

export function ChartTooltipContent({
  label,
  amount,
  currency,
}: ChartTooltipContentProps) {
  return (
    <div className="bg-white border border-border-subtle rounded-xl px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </p>
      <p className="text-[15px] font-mono font-bold text-text-primary mt-0.5">
        {formatMoney(amount, currency)}
      </p>
    </div>
  );
}
