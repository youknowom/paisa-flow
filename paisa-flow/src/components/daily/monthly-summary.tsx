"use client";

import { formatMoney } from "@/lib/format-money";
import { MoneyDisplay } from "@/components/shared/money-display";

interface MonthlySummaryProps {
  totalSpent: number;
  expenseCount: number;
  avgPerDay: number;
  topCategory: string | null;
  currency: string;
}

export function SummaryPills({
  monthTotal,
  weekTotal,
  todayTotal,
  currency,
}: {
  monthTotal: number;
  weekTotal: number;
  todayTotal: number;
  currency: string;
}) {
  const pills = [
    { label: "This Month", value: monthTotal },
    { label: "This Week", value: weekTotal },
    { label: "Today", value: todayTotal },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {pills.map((pill) => (
        <div key={pill.label} className="pf-card p-3">
          <p className="text-[10px] font-bold text-text-muted font-heading mb-1 uppercase tracking-wider">
            {pill.label}
          </p>
          <p className="font-mono text-[16px] font-bold text-text-primary tracking-tight">
            {formatMoney(pill.value, currency, true)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MonthlySummary({
  totalSpent,
  currency,
}: MonthlySummaryProps) {
  return (
    <div className="hidden">
      <MoneyDisplay amount={totalSpent} currency={currency} />
    </div>
  );
}

export function FloatingMonthSummary({
  total,
  currency,
  monthLabel,
}: {
  total: number;
  currency: string;
  monthLabel: string;
}) {
  return (
    <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-4 right-4 md:hidden z-30">
      <div className="rounded-2xl bg-white border border-border-subtle px-4 py-3 flex items-center justify-between shadow-md">
        <span className="text-[12px] font-bold text-text-muted font-heading uppercase tracking-wider">
          {monthLabel}
        </span>
        <MoneyDisplay
          amount={total}
          currency={currency}
          className="font-mono text-[16px] font-bold text-text-primary"
        />
      </div>
    </div>
  );
}
