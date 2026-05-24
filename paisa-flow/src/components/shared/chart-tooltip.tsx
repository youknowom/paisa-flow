"use client";

import { formatMoney } from "@/lib/format-money";

interface ChartTooltipProps {
  label?: string;
  amount: number;
  currency: string;
  suffix?: string;
}

export function ChartTooltipContent({
  label,
  amount,
  currency,
  suffix,
}: ChartTooltipProps) {
  return (
    <div className="bg-surface-2 border border-accent/30 rounded-xl px-3 py-2 shadow-xl">
      {label && (
        <p className="text-caption text-text-muted">{label}</p>
      )}
      <p className="text-sm font-mono-amount font-semibold text-text-primary">
        {formatMoney(amount, currency)}
        {suffix ? ` ${suffix}` : ""}
      </p>
    </div>
  );
}
