"use client";

import { motion } from "motion/react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  percentage: number;
  currency: string;
  warningLevel?: "safe" | "warning" | "danger" | "exceeded";
}

export function BudgetProgress({
  spent,
  budget,
  percentage,
  currency,
  warningLevel = "safe",
}: BudgetProgressProps) {
  const barPercent = Math.min(percentage, 100);
  const barColor =
    percentage >= 90
      ? "bg-red"
      : percentage >= 70
        ? "bg-amber"
        : "bg-accent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="card-surface p-5 mb-8"
    >
      <p className="text-label text-text-muted mb-4">Monthly Budget</p>
      <div className="flex items-baseline justify-between mb-3">
        <MoneyDisplay
          amount={spent}
          currency={currency}
          className="text-h3 font-semibold text-text-primary"
        />
        <span className="text-caption text-text-muted">
          of{" "}
          <MoneyDisplay
            amount={budget}
            currency={currency}
            animated={false}
            className="inline text-text-secondary"
          />
        </span>
      </div>
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: barPercent / 100 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          style={{ transformOrigin: "left" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <p
        className={cn(
          "text-caption mt-2",
          warningLevel === "exceeded" || warningLevel === "danger"
            ? "text-red"
            : warningLevel === "warning"
              ? "text-amber"
              : "text-text-muted"
        )}
      >
        {percentage.toFixed(0)}% used
      </p>
    </motion.div>
  );
}
