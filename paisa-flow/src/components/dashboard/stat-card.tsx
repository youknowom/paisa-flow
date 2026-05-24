"use client";

import { LucideIcon } from "lucide-react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  currency?: string;
  icon: LucideIcon;
  iconColor: string;
  variant?: "default" | "positive" | "negative" | "neutral";
  isCount?: boolean;
}

export function StatCard({
  label,
  value,
  currency = "INR",
  icon: Icon,
  iconColor,
  variant = "default",
  isCount = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card-surface p-4 min-h-[100px] flex flex-col justify-between",
        variant === "positive" && "ring-1 ring-accent/15",
        variant === "negative" && "ring-1 ring-red/15"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[12px] font-semibold text-text-muted font-heading leading-tight">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      {isCount ? (
        <span className="stat-amount">{value}</span>
      ) : (
        <MoneyDisplay
          amount={value}
          currency={currency}
          compact
          className="stat-amount"
        />
      )}
    </div>
  );
}
