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
  iconBg?: string;
  variant?: "default" | "positive" | "negative" | "neutral";
  isCount?: boolean;
}

export function StatCard({
  label,
  value,
  currency = "INR",
  icon: Icon,
  iconColor,
  iconBg = "bg-surface-3",
  variant = "default",
  isCount = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 min-h-[100px] flex flex-col justify-between bg-white shadow-md border border-border-subtle",
        variant === "positive" && "border-accent/20",
        variant === "negative" && "border-red/20",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold text-text-muted font-heading leading-tight uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      {isCount ? (
        <span className="font-mono text-[22px] font-bold tracking-tight text-text-primary">
          {value}
        </span>
      ) : (
        <MoneyDisplay
          amount={value}
          currency={currency}
          compact
          className="font-mono text-[20px] font-bold tracking-tight text-text-primary"
        />
      )}
    </div>
  );
}
