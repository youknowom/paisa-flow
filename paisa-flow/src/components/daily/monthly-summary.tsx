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
    <div className="grid grid-cols-3 gap-2 mb-5">
      {pills.map((pill) => (
        <div key={pill.label} className="summary-pill">
          <p className="text-[11px] font-semibold text-text-muted font-heading mb-1">
            {pill.label}
          </p>
          <p className="stat-amount text-[17px]">
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
    <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] left-3 right-3 md:hidden z-40">
      <div className="card-surface px-4 py-3 flex items-center justify-between shadow-[var(--shadow-card-hover)]">
        <span className="text-[13px] font-semibold text-text-muted font-heading">
          {monthLabel}
        </span>
        <MoneyDisplay
          amount={total}
          currency={currency}
          className="stat-amount text-[17px]"
        />
      </div>
    </div>
  );
}
