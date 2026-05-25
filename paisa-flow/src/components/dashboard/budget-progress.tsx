"use client";

import { motion } from "motion/react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  percentage: number;
  currency: string;
  warningLevel: "safe" | "warning" | "danger" | "exceeded";
}

export function BudgetProgress({
  spent,
  budget,
  percentage,
  currency,
  warningLevel,
}: BudgetProgressProps) {
  const barPercent = Math.min(percentage, 100);

  return (
    <Link href="/budget">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.98 }}
        className="pf-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-text-primary font-heading">
            Monthly Budget
          </span>
          <div className="flex items-center gap-1 text-text-muted">
            <span className="text-[11px] font-semibold">
              {percentage.toFixed(0)}% used
            </span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: barPercent / 100 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "left" }}
            className={cn(
              "h-full rounded-full",
              warningLevel === "exceeded" || warningLevel === "danger"
                ? "bg-red"
                : warningLevel === "warning"
                  ? "bg-amber"
                  : "bg-accent"
            )}
          />
        </div>

        <div className="flex justify-between">
          <MoneyDisplay
            amount={spent}
            currency={currency}
            compact
            className="text-[13px] font-semibold text-text-primary"
          />
          <MoneyDisplay
            amount={budget}
            currency={currency}
            compact
            className="text-[13px] font-semibold text-text-muted"
          />
        </div>
      </motion.div>
    </Link>
  );
}
