"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { MoneyDisplay } from "@/components/shared/money-display";

interface HeroCardProps {
  totalSpent: number;
  currency: string;
  changePercent?: number;
}

export function HeroCard({
  totalSpent,
  currency,
  changePercent = 0,
}: HeroCardProps) {
  const isUp = changePercent >= 0;

  return (
    <div className="card-surface p-5 mb-5">
      <p className="text-[13px] font-semibold text-text-muted font-heading mb-2">
        Total spent this month
      </p>
      <MoneyDisplay
        amount={totalSpent}
        currency={currency}
        className="text-display block text-text-primary"
      />
      <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-accent-muted">
        {isUp ? (
          <TrendingUp size={14} className="text-accent" />
        ) : (
          <TrendingDown size={14} className="text-red" />
        )}
        <span className="text-[12px] font-medium text-text-secondary">
          {Math.abs(changePercent).toFixed(0)}% vs last month
        </span>
      </div>
    </div>
  );
}
